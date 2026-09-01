import { expect, test, type Locator, type Page, type Response } from '@playwright/test';

const PROD = 'https://mathnikita.gunya999.workers.dev';
const VOICE_VERSION = 'ru-teacher-gemini-sulafat-v2';
type AudioEvent = { at: number; source?: string; lessonNumber?: number; narrationId?: string };
type AuditState = { played: AudioEvent[]; ended: AudioEvent[]; stops: number[]; pauses: Array<{ at: number; src: string; currentTime: number }>; playCalls: Array<{ at: number; src: string }> };
type AudioCheck = { id: string; status: number; contentType: string; voice: string; provider: string; version: string; cache: string; bytes: number; wav?: { channels: number; sampleRate: number; bits: number; durationSeconds: number; peak: number; silentRatio: number } };

const lessonToken = (lesson: number) => String(lesson).padStart(2, '0');

function analyzeWav(body: Buffer): AudioCheck['wav'] | undefined {
  if (body.length < 44 || body.toString('ascii', 0, 4) !== 'RIFF' || body.toString('ascii', 8, 12) !== 'WAVE') return undefined;
  let offset = 12, channels = 0, sampleRate = 0, bits = 0, dataStart = -1, dataSize = 0;
  while (offset + 8 <= body.length) {
    const chunk = body.toString('ascii', offset, offset + 4); const size = body.readUInt32LE(offset + 4); const start = offset + 8;
    if (chunk === 'fmt ' && size >= 16 && start + 16 <= body.length) { channels = body.readUInt16LE(start + 2); sampleRate = body.readUInt32LE(start + 4); bits = body.readUInt16LE(start + 14); }
    if (chunk === 'data') { dataStart = start; dataSize = Math.min(size, body.length - start); break; }
    offset = start + size + (size % 2);
  }
  if (dataStart < 0 || !channels || !sampleRate || bits !== 16 || dataSize < 2) return undefined;
  let peak = 0, silent = 0, samples = 0;
  for (let i = dataStart; i + 1 < dataStart + dataSize; i += 2) { const value = Math.abs(body.readInt16LE(i)); peak = Math.max(peak, value); if (value < 48) silent += 1; samples += 1; }
  return { channels, sampleRate, bits, durationSeconds: dataSize / (sampleRate * channels * (bits / 8)), peak, silentRatio: samples ? silent / samples : 1 };
}

async function prepare(page: Page) {
  await page.addInitScript(() => {
    const profileId = 'audio-audit-user'; const now = new Date().toISOString();
    localStorage.setItem('mathnikita:accounts:registry:v1', JSON.stringify({ version: 1, profiles: [{ id: profileId, name: 'Audio Audit', avatar: '🐱', pinSalt: 'audit-only', pinHash: 'audit-only', createdAt: now, lastUsedAt: now }] }));
    localStorage.setItem('mathnikita:accounts:workspace-owner:v1', profileId); sessionStorage.setItem('mathnikita:accounts:session:v1', profileId);
    localStorage.setItem('mathnikita-mentor-auto-guide', 'false'); localStorage.setItem('mathnikita-voice-settings-v4', JSON.stringify({ engine: 'studio', rate: 0.88 }));
    const state: AuditState = { played: [], ended: [], stops: [], pauses: [], playCalls: [] };
    Object.defineProperty(window, '__mathnikitaAudioAudit', { value: state, configurable: true });
    window.addEventListener('mathnikita-audio-played', event => state.played.push({ at: performance.now(), ...((event as CustomEvent).detail ?? {}) }));
    window.addEventListener('mathnikita-audio-ended', event => state.ended.push({ at: performance.now(), ...((event as CustomEvent).detail ?? {}) }));
    window.addEventListener('mathnikita-stop-narration', () => state.stops.push(performance.now()));
    const originalPlay = HTMLMediaElement.prototype.play; const originalPause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.play = function () { state.playCalls.push({ at: performance.now(), src: this.currentSrc || this.src || '' }); return originalPlay.call(this); };
    HTMLMediaElement.prototype.pause = function () { state.pauses.push({ at: performance.now(), src: this.currentSrc || this.src || '', currentTime: Number(this.currentTime || 0) }); return originalPause.call(this); };
  });
}

function captureNarrationResponses(page: Page) {
  const checks = new Map<string, Promise<AudioCheck>>();
  page.on('response', response => {
    let url: URL; try { url = new URL(response.url()); } catch { return; }
    if (url.pathname !== '/api/narration' || response.request().method() !== 'POST') return;
    let id = ''; try { id = String((response.request().postDataJSON() as { id?: string })?.id ?? ''); } catch { return; } if (!id) return;
    checks.set(id, (async (r: Response) => { const body = await r.body(); const h = r.headers(); return { id, status: r.status(), contentType: h['content-type'] ?? '', voice: h['x-mathnikita-voice'] ?? '', provider: h['x-mathnikita-provider'] ?? '', version: h['x-mathnikita-narration'] ?? '', cache: h['x-mathnikita-cache'] ?? '', bytes: body.length, wav: analyzeWav(body) }; })(response));
  });
  return checks;
}

async function auditResponse(checks: Map<string, Promise<AudioCheck>>, id: string, label: string) {
  await expect.poll(() => checks.has(id), { timeout: 75_000, message: `${label}: response ${id}` }).toBe(true);
  const c = await checks.get(id)!;
  expect(c.status, `${label}: HTTP`).toBe(200); expect(c.contentType, `${label}: content-type`).toMatch(/^audio\//i); expect(c.voice, `${label}: voice`).toBe('Sulafat');
  expect(c.provider, `${label}: provider`).toMatch(/^gemini-(flash|pro)$/); expect(c.version, `${label}: version`).toBe(VOICE_VERSION); expect(c.cache, `${label}: cache`).toMatch(/^(hit|miss)$/); expect(c.bytes, `${label}: bytes`).toBeGreaterThan(1_000);
  if (c.wav) { expect(c.wav.channels).toBe(1); expect(c.wav.sampleRate).toBe(24_000); expect(c.wav.bits).toBe(16); expect(c.wav.durationSeconds, `${label}: duration`).toBeGreaterThan(0.35); expect(c.wav.peak, `${label}: non-silence`).toBeGreaterThan(250); expect(c.wav.silentRatio, `${label}: silence ratio`).toBeLessThan(0.995); }
}

const audioState = (page: Page): Promise<AuditState> => page.evaluate(() => (window as unknown as { __mathnikitaAudioAudit: AuditState }).__mathnikitaAudioAudit);
async function waitForPlayed(page: Page, lesson: number, afterCount: number, wantedId?: string) {
  await expect.poll(async () => { const s = await audioState(page); const events = s.played.slice(afterCount).filter(item => item.lessonNumber === lesson); return wantedId ? events.some(item => item.narrationId === wantedId) : events.length > 0; }, { timeout: 75_000, message: `lesson ${lesson}: audio must start` }).toBe(true);
  const s = await audioState(page); return s.played.slice(afterCount).filter(item => item.lessonNumber === lesson && (!wantedId || item.narrationId === wantedId)).at(-1)!;
}
async function clickNext(runtime: Locator) { const buttons = runtime.getByRole('button', { name: /^(Дальше|Далее)\s*→$/ }); for (let i = 0; i < await buttons.count(); i += 1) { const b = buttons.nth(i); if (await b.isVisible() && await b.isEnabled()) { await b.click(); return true; } } return false; }

for (let lesson = 1; lesson <= 90; lesson += 1) {
  test(`lesson ${lesson} live Sulafat: opening, stage switch, interruption and replay`, async ({ page }) => {
    test.setTimeout(210_000); await prepare(page); const checks = captureNarrationResponses(page);
    const pageErrors: string[] = []; const consoleErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message)); page.on('console', message => { if (message.type() === 'error' && !/Failed to load resource|favicon|net::ERR_ABORTED|AbortError/i.test(message.text())) consoleErrors.push(message.text()); });
    const response = await page.goto(`${PROD}/?audioAudit=${lesson}`, { waitUntil: 'domcontentloaded' }); expect(response?.ok(), `lesson ${lesson}: production HTML`).toBeTruthy();
    const status = await page.request.get(`${PROD}/api/narration-status`); expect(status.ok()).toBeTruthy(); expect((await status.json() as { studioConfigured?: boolean }).studioConfigured, `lesson ${lesson}: Sulafat configured`).toBe(true);
    const lessons = page.locator('.course-lesson-grid > button'); await expect(lessons).toHaveCount(175); await page.locator('.course-chapter-group').evaluateAll(nodes => { for (const node of nodes) (node as HTMLDetailsElement).open = true; });
    const openButton = lessons.nth(lesson - 1); await expect(openButton).toBeVisible(); await expect(openButton).toBeEnabled(); await openButton.click();

    const openingId = `lesson-${lessonToken(lesson)}-opening`; await auditResponse(checks, openingId, `lesson ${lesson} opening`);
    const narrator = page.locator('.voice-narrator > button').first(); await expect(narrator).toBeVisible(); await expect(narrator).toContainText(/Слушать · AI|Повторить · AI/);
    const beforeOpening = (await audioState(page)).played.length; await narrator.click(); await waitForPlayed(page, lesson, beforeOpening, openingId);
    const openingPauseBaseline = (await audioState(page)).pauses.length; await narrator.click(); await expect.poll(async () => (await audioState(page)).pauses.length, { timeout: 5_000 }).toBeGreaterThan(openingPauseBaseline);

    const startButton = page.locator('.lesson-opening-start'); await expect(startButton).toBeVisible();
    const beforeStageOne = (await audioState(page)).played.length; await startButton.click();
    const runtime = page.locator(`.lesson-runtime[data-lesson-number="${lesson}"]:not([hidden])`); await expect(runtime).toBeVisible();
    const stage = runtime.locator('[data-stage-id]').first(); await expect(stage).toBeVisible(); const firstStageId = await stage.getAttribute('data-stage-id'); expect(firstStageId).toBeTruthy();
    const firstPlayed = await waitForPlayed(page, lesson, beforeStageOne); expect(firstPlayed.narrationId).toMatch(new RegExp(`^lesson-${lessonToken(lesson)}-stage-`));

    // Advance immediately after playback begins so the first clip is definitely still active.
    const beforeSwitch = await audioState(page); const didAdvance = await clickNext(runtime); expect(didAdvance, `lesson ${lesson}: enabled next control`).toBe(true);
    await expect.poll(async () => stage.getAttribute('data-stage-id'), { timeout: 8_000 }).not.toBe(firstStageId);
    await expect.poll(async () => (await audioState(page)).pauses.length, { timeout: 5_000, message: `lesson ${lesson}: old audio pauses on advance` }).toBeGreaterThan(beforeSwitch.pauses.length);
    const secondPlayed = await waitForPlayed(page, lesson, beforeSwitch.played.length); expect(secondPlayed.narrationId).not.toBe(firstPlayed.narrationId);
    const switched = await audioState(page); const lastPause = switched.pauses.at(-1); expect(lastPause).toBeTruthy(); expect(lastPause!.at, `lesson ${lesson}: pause precedes new playback`).toBeLessThanOrEqual(secondPlayed.at);

    // Stop/replay immediately while stage two is active; replay must use the current narration id.
    const pauseBeforeReplay = switched.pauses.length; await narrator.click(); await expect.poll(async () => (await audioState(page)).pauses.length, { timeout: 5_000 }).toBeGreaterThan(pauseBeforeReplay);
    const playedBeforeReplay = (await audioState(page)).played.length; await narrator.click(); const replay = await waitForPlayed(page, lesson, playedBeforeReplay, secondPlayed.narrationId); expect(replay.narrationId).toBe(secondPlayed.narrationId);

    await auditResponse(checks, firstPlayed.narrationId!, `lesson ${lesson} first stage`); await auditResponse(checks, secondPlayed.narrationId!, `lesson ${lesson} second stage`);
    await page.waitForTimeout(80); expect(pageErrors, `lesson ${lesson} page errors: ${pageErrors.join(' | ')}`).toEqual([]); expect(consoleErrors, `lesson ${lesson} console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
  });
}
