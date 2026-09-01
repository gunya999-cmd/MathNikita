import { expect, test, type Page, type Response } from '@playwright/test';

const PROD = 'https://mathnikita.gunya999.workers.dev';
const VOICE_VERSION = 'ru-teacher-gemini-sulafat-v2';

type AudioEvent = { at: number; source?: string; lessonNumber?: number; narrationId?: string };
type AuditState = {
  played: AudioEvent[];
  ended: AudioEvent[];
  stops: number[];
  pauses: Array<{ at: number; src: string; currentTime: number }>;
  playCalls: Array<{ at: number; src: string }>;
};
type AudioCheck = {
  id: string;
  status: number;
  contentType: string;
  voice: string;
  provider: string;
  version: string;
  cache: string;
  bytes: number;
  wav?: { channels: number; sampleRate: number; bits: number; durationSeconds: number; peak: number; silentRatio: number };
};

function lessonToken(lesson: number) { return String(lesson).padStart(2, '0'); }

function analyzeWav(body: Buffer): AudioCheck['wav'] | undefined {
  if (body.length < 44 || body.toString('ascii', 0, 4) !== 'RIFF' || body.toString('ascii', 8, 12) !== 'WAVE') return undefined;
  let offset = 12;
  let channels = 0;
  let sampleRate = 0;
  let bits = 0;
  let dataStart = -1;
  let dataSize = 0;
  while (offset + 8 <= body.length) {
    const chunk = body.toString('ascii', offset, offset + 4);
    const size = body.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (chunk === 'fmt ' && size >= 16 && start + 16 <= body.length) {
      channels = body.readUInt16LE(start + 2);
      sampleRate = body.readUInt32LE(start + 4);
      bits = body.readUInt16LE(start + 14);
    }
    if (chunk === 'data') { dataStart = start; dataSize = Math.min(size, body.length - start); break; }
    offset = start + size + (size % 2);
  }
  if (dataStart < 0 || !channels || !sampleRate || bits !== 16 || dataSize < 2) return undefined;
  let peak = 0;
  let silent = 0;
  let samples = 0;
  for (let i = dataStart; i + 1 < dataStart + dataSize; i += 2) {
    const value = Math.abs(body.readInt16LE(i));
    peak = Math.max(peak, value);
    if (value < 48) silent += 1;
    samples += 1;
  }
  return {
    channels,
    sampleRate,
    bits,
    durationSeconds: dataSize / (sampleRate * channels * (bits / 8)),
    peak,
    silentRatio: samples ? silent / samples : 1,
  };
}

async function prepare(page: Page) {
  await page.addInitScript(() => {
    const profileId = 'audio-audit-user';
    const now = new Date().toISOString();
    localStorage.setItem('mathnikita:accounts:registry:v1', JSON.stringify({
      version: 1,
      profiles: [{ id: profileId, name: 'Audio Audit', avatar: '🐱', pinSalt: 'audit-only', pinHash: 'audit-only', createdAt: now, lastUsedAt: now }],
    }));
    localStorage.setItem('mathnikita:accounts:workspace-owner:v1', profileId);
    sessionStorage.setItem('mathnikita:accounts:session:v1', profileId);
    localStorage.setItem('mathnikita-mentor-auto-guide', 'false');
    localStorage.setItem('mathnikita-voice-settings-v4', JSON.stringify({ engine: 'studio', rate: 0.94 }));

    const state: AuditState = { played: [], ended: [], stops: [], pauses: [], playCalls: [] };
    Object.defineProperty(window, '__mathnikitaAudioAudit', { value: state, configurable: true });
    window.addEventListener('mathnikita-audio-played', event => {
      const detail = (event as CustomEvent).detail ?? {};
      state.played.push({ at: performance.now(), ...detail });
    });
    window.addEventListener('mathnikita-audio-ended', event => {
      const detail = (event as CustomEvent).detail ?? {};
      state.ended.push({ at: performance.now(), ...detail });
    });
    window.addEventListener('mathnikita-stop-narration', () => state.stops.push(performance.now()));

    const originalPlay = HTMLMediaElement.prototype.play;
    const originalPause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.play = function () {
      state.playCalls.push({ at: performance.now(), src: this.currentSrc || this.src || '' });
      return originalPlay.call(this);
    };
    HTMLMediaElement.prototype.pause = function () {
      state.pauses.push({ at: performance.now(), src: this.currentSrc || this.src || '', currentTime: Number(this.currentTime || 0) });
      return originalPause.call(this);
    };
  });
}

function captureNarrationResponses(page: Page) {
  const checks = new Map<string, Promise<AudioCheck>>();
  page.on('response', response => {
    let url: URL;
    try { url = new URL(response.url()); } catch { return; }
    if (url.pathname !== '/api/narration' || response.request().method() !== 'POST') return;
    let id = '';
    try { id = String((response.request().postDataJSON() as { id?: string })?.id ?? ''); } catch { /* handled below */ }
    if (!id) return;
    const check = (async (r: Response): Promise<AudioCheck> => {
      const body = await r.body();
      const headers = r.headers();
      return {
        id,
        status: r.status(),
        contentType: headers['content-type'] ?? '',
        voice: headers['x-mathnikita-voice'] ?? '',
        provider: headers['x-mathnikita-provider'] ?? '',
        version: headers['x-mathnikita-narration'] ?? '',
        cache: headers['x-mathnikita-cache'] ?? '',
        bytes: body.length,
        wav: analyzeWav(body),
      };
    })(response);
    checks.set(id, check);
  });
  return checks;
}

async function auditResponse(checks: Map<string, Promise<AudioCheck>>, id: string, label: string) {
  await expect.poll(() => checks.has(id), { timeout: 75_000, message: `${label}: narration response ${id} must arrive` }).toBe(true);
  const check = await checks.get(id)!;
  expect(check.status, `${label}: ${id} HTTP`).toBe(200);
  expect(check.contentType, `${label}: ${id} content-type`).toMatch(/^audio\//i);
  expect(check.voice, `${label}: ${id} voice`).toBe('Sulafat');
  expect(check.provider, `${label}: ${id} provider`).toMatch(/^gemini-(flash|pro)$/);
  expect(check.version, `${label}: ${id} voice version`).toBe(VOICE_VERSION);
  expect(check.cache, `${label}: ${id} cache header`).toMatch(/^(hit|miss)$/);
  expect(check.bytes, `${label}: ${id} must contain real audio bytes`).toBeGreaterThan(1_000);
  if (check.wav) {
    expect(check.wav.channels, `${label}: ${id} WAV channels`).toBe(1);
    expect(check.wav.sampleRate, `${label}: ${id} WAV sample rate`).toBe(24_000);
    expect(check.wav.bits, `${label}: ${id} WAV bit depth`).toBe(16);
    expect(check.wav.durationSeconds, `${label}: ${id} duration`).toBeGreaterThan(0.35);
    expect(check.wav.peak, `${label}: ${id} must not be silent`).toBeGreaterThan(250);
    expect(check.wav.silentRatio, `${label}: ${id} cannot be almost entirely silence`).toBeLessThan(0.995);
  }
  return check;
}

async function audioState(page: Page): Promise<AuditState> {
  return page.evaluate(() => (window as unknown as { __mathnikitaAudioAudit: AuditState }).__mathnikitaAudioAudit);
}

async function waitForPlayed(page: Page, lesson: number, afterCount: number, wantedId?: string) {
  await expect.poll(async () => {
    const state = await audioState(page);
    const events = state.played.slice(afterCount).filter(item => item.lessonNumber === lesson);
    return wantedId ? events.some(item => item.narrationId === wantedId) : events.length > 0;
  }, { timeout: 75_000, message: `lesson ${lesson}: audio must actually start playing` }).toBe(true);
  const state = await audioState(page);
  const events = state.played.slice(afterCount).filter(item => item.lessonNumber === lesson && (!wantedId || item.narrationId === wantedId));
  return events.at(-1)!;
}

async function clickFirstEnabledNext(page: Page, runtime: ReturnType<Page['locator']>) {
  const buttons = runtime.getByRole('button', { name: /^(Дальше|Далее)\s*→$/ });
  const count = await buttons.count();
  for (let i = 0; i < count; i += 1) {
    const button = buttons.nth(i);
    if (await button.isVisible() && await button.isEnabled()) { await button.click(); return true; }
  }
  return false;
}

for (let lesson = 1; lesson <= 90; lesson += 1) {
  test(`lesson ${lesson} live Sulafat: opening, stage switch, interruption and replay`, async ({ page }) => {
    test.setTimeout(210_000);
    await prepare(page);
    const checks = captureNarrationResponses(page);
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && !/Failed to load resource|favicon|net::ERR_ABORTED|AbortError/i.test(message.text())) consoleErrors.push(message.text());
    });

    const response = await page.goto(`${PROD}/?audioAudit=${lesson}`, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `lesson ${lesson}: production HTML`).toBeTruthy();
    const status = await page.request.get(`${PROD}/api/narration-status`);
    expect(status.ok(), `lesson ${lesson}: narration status endpoint`).toBeTruthy();
    expect((await status.json() as { studioConfigured?: boolean }).studioConfigured, `lesson ${lesson}: Sulafat must be configured`).toBe(true);

    const lessons = page.locator('.course-lesson-grid > button');
    await expect(lessons).toHaveCount(175);
    await page.locator('.course-chapter-group').evaluateAll(nodes => { for (const node of nodes) (node as HTMLDetailsElement).open = true; });
    const openButton = lessons.nth(lesson - 1);
    await expect(openButton).toBeVisible();
    await expect(openButton).toBeEnabled();
    await openButton.click();

    const openingId = `lesson-${lessonToken(lesson)}-opening`;
    await auditResponse(checks, openingId, `lesson ${lesson} opening`);
    const narrator = page.locator('.voice-narrator > button').first();
    await expect(narrator).toBeVisible();
    await expect(narrator).toContainText(/Слушать · AI|Повторить · AI/);
    const beforeOpening = (await audioState(page)).played.length;
    await narrator.click();
    await waitForPlayed(page, lesson, beforeOpening, openingId);
    const openingPlaying = await audioState(page);
    const openingPauseBaseline = openingPlaying.pauses.length;
    await narrator.click();
    await expect.poll(async () => (await audioState(page)).pauses.length, { timeout: 5_000 }).toBeGreaterThan(openingPauseBaseline);

    const startButton = page.locator('.lesson-opening-start');
    await expect(startButton).toBeVisible();
    await startButton.click();
    const runtime = page.locator(`.lesson-runtime[data-lesson-number="${lesson}"]:not([hidden])`);
    await expect(runtime).toBeVisible();
    const stage = runtime.locator('[data-stage-id]').first();
    await expect(stage).toBeVisible();
    const firstStageId = await stage.getAttribute('data-stage-id');
    expect(firstStageId).toBeTruthy();

    const beforeStageOne = (await audioState(page)).played.length;
    const firstPlayed = await waitForPlayed(page, lesson, beforeStageOne);
    expect(firstPlayed.narrationId, `lesson ${lesson}: first stage narration id`).toMatch(new RegExp(`^lesson-${lessonToken(lesson)}-stage-`));
    await auditResponse(checks, firstPlayed.narrationId!, `lesson ${lesson} first stage`);

    const beforeSwitch = await audioState(page);
    const didAdvance = await clickFirstEnabledNext(page, runtime);
    expect(didAdvance, `lesson ${lesson}: first stage must expose an enabled next control for interruption audit`).toBe(true);
    await expect.poll(async () => stage.getAttribute('data-stage-id'), { timeout: 8_000 }).not.toBe(firstStageId);
    await expect.poll(async () => (await audioState(page)).pauses.length, { timeout: 5_000, message: `lesson ${lesson}: old audio must be paused immediately on advance` }).toBeGreaterThan(beforeSwitch.pauses.length);

    const secondPlayed = await waitForPlayed(page, lesson, beforeSwitch.played.length);
    expect(secondPlayed.narrationId, `lesson ${lesson}: second narration must differ`).not.toBe(firstPlayed.narrationId);
    await auditResponse(checks, secondPlayed.narrationId!, `lesson ${lesson} second stage`);
    const switchedState = await audioState(page);
    const lastPause = switchedState.pauses.at(-1);
    expect(lastPause, `lesson ${lesson}: interruption pause event`).toBeTruthy();
    expect(lastPause!.at, `lesson ${lesson}: old audio must stop before new audio starts`).toBeLessThanOrEqual(secondPlayed.at);

    // Stop and replay the current narration. Replay should use the in-memory studio cache.
    const pauseBeforeReplay = switchedState.pauses.length;
    await narrator.click();
    await expect.poll(async () => (await audioState(page)).pauses.length, { timeout: 5_000 }).toBeGreaterThan(pauseBeforeReplay);
    const playedBeforeReplay = (await audioState(page)).played.length;
    await narrator.click();
    const replay = await waitForPlayed(page, lesson, playedBeforeReplay, secondPlayed.narrationId);
    expect(replay.narrationId).toBe(secondPlayed.narrationId);

    await page.waitForTimeout(120);
    expect(pageErrors, `lesson ${lesson} page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    expect(consoleErrors, `lesson ${lesson} console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
  });
}
