import { expect, test, type Locator, type Page } from '@playwright/test';

const PROD = 'https://mathnikita.gunya999.workers.dev';
type AuditEvent = { kind: 'request' | 'play' | 'pause'; id: string; at: number };
type AuditState = { events: AuditEvent[] };

async function installAudioAudit(page: Page) {
  await page.addInitScript(() => {
    const profileId = 'webkit-audio-audit-user';
    const now = new Date().toISOString();
    localStorage.setItem('mathnikita:accounts:registry:v1', JSON.stringify({
      version: 1,
      profiles: [{ id: profileId, name: 'WebKit Audio Audit', avatar: '🐱', pinSalt: 'audit-only', pinHash: 'audit-only', createdAt: now, lastUsedAt: now }],
    }));
    localStorage.setItem('mathnikita:accounts:workspace-owner:v1', profileId);
    sessionStorage.setItem('mathnikita:accounts:session:v1', profileId);
    localStorage.setItem('mathnikita-voice-settings-v4', JSON.stringify({ engine: 'studio', rate: 0.94 }));
    localStorage.setItem('mathnikita-mentor-auto-guide', 'false');

    const audit: AuditState = { events: [] };
    const blobIds = new WeakMap<Blob, string>();
    const nativeFetch = window.fetch.bind(window);
    const nativeCreateObjectURL = URL.createObjectURL.bind(URL);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      let narrationId = '';
      if (url.includes('/api/narration')) {
        let rawBody = init?.body;
        if (rawBody == null && input instanceof Request) {
          try { rawBody = await input.clone().text(); } catch { /* no-op */ }
        }
        if (typeof rawBody === 'string') {
          try { narrationId = (JSON.parse(rawBody) as { id?: string }).id ?? ''; } catch { /* no-op */ }
        }
        if (narrationId) audit.events.push({ kind: 'request', id: narrationId, at: performance.now() });
      }
      const response = await nativeFetch(input, init);
      if (!narrationId) return response;
      return new Proxy(response, {
        get(target, property) {
          if (property === 'blob') return async () => {
            const blob = await target.blob();
            blobIds.set(blob, narrationId);
            return blob;
          };
          const value = Reflect.get(target, property, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    };

    URL.createObjectURL = (blob: Blob | MediaSource) => {
      if (blob instanceof Blob) {
        const id = blobIds.get(blob);
        if (id) return `blob:audio-audit/${encodeURIComponent(id)}`;
      }
      return nativeCreateObjectURL(blob);
    };

    class MockAudio {
      src = '';
      preload = '';
      playbackRate = 1;
      currentTime = 0;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      private timer: number | null = null;
      private started = false;
      constructor(source = '') { this.src = source; }
      private id() {
        const prefix = 'blob:audio-audit/';
        return this.src.startsWith(prefix) ? decodeURIComponent(this.src.slice(prefix.length)) : this.src;
      }
      pause() {
        if (this.started) audit.events.push({ kind: 'pause', id: this.id(), at: performance.now() });
        this.started = false;
        if (this.timer !== null) { window.clearTimeout(this.timer); this.timer = null; }
      }
      play() {
        this.pause();
        this.started = true;
        audit.events.push({ kind: 'play', id: this.id(), at: performance.now() });
        this.timer = window.setTimeout(() => {
          this.timer = null;
          this.started = false;
          this.onended?.();
        }, 8_000);
        return Promise.resolve();
      }
    }
    Object.defineProperty(window, 'Audio', { configurable: true, writable: true, value: MockAudio });
    (window as unknown as { __audioAudit: AuditState }).__audioAudit = audit;
  });

  await page.route('**/api/narration-status', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, studioConfigured: true, provider: 'gemini', voice: 'Sulafat' }),
  }));
  await page.route('**/api/narration', route => route.fulfill({
    status: 200,
    headers: {
      'content-type': 'audio/wav',
      'x-mathnikita-voice': 'Sulafat',
      'x-mathnikita-provider': 'gemini-flash',
      'x-mathnikita-narration': 'ru-teacher-gemini-sulafat-v2',
      'x-mathnikita-cache': 'hit',
    },
    body: 'RIFF-audio-audit',
  }));
}

async function events(page: Page) {
  return page.evaluate(() => (window as unknown as { __audioAudit: AuditState }).__audioAudit.events);
}

async function clearEvents(page: Page) {
  await page.evaluate(() => { (window as unknown as { __audioAudit: AuditState }).__audioAudit.events = []; });
}

async function waitForPlay(page: Page, predicate: (event: AuditEvent) => boolean, message: string) {
  await expect.poll(async () => (await events(page)).filter(event => event.kind === 'play').some(predicate), { timeout: 12_000, message }).toBe(true);
  return (await events(page)).filter(event => event.kind === 'play').filter(predicate).at(-1)!;
}

async function clickNext(runtime: Locator) {
  const buttons = runtime.getByRole('button', { name: /^(Дальше|Далее)\s*→$/ });
  for (let i = 0; i < await buttons.count(); i += 1) {
    const button = buttons.nth(i);
    if (await button.isVisible() && await button.isEnabled()) {
      await button.dispatchEvent('click');
      return true;
    }
  }
  return false;
}

for (let lesson = 1; lesson <= 90; lesson += 1) {
  test(`lesson ${lesson} WebKit/iPad voice lifecycle`, async ({ page }) => {
    test.setTimeout(50_000);
    await installAudioAudit(page);
    const response = await page.goto(`${PROD}/?webkitAudioAudit=${lesson}`, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `lesson ${lesson}: production HTML`).toBeTruthy();

    const lessons = page.locator('.course-lesson-grid > button');
    await expect(lessons).toHaveCount(175);
    await page.locator('.course-chapter-group').evaluateAll(nodes => { for (const node of nodes) (node as HTMLDetailsElement).open = true; });
    const openButton = lessons.nth(lesson - 1);
    await expect(openButton).toBeVisible();
    await expect(openButton).toBeEnabled();
    await openButton.click();

    const openingId = `lesson-${String(lesson).padStart(2, '0')}-opening`;
    const narrator = page.locator('.voice-narrator > button').first();
    await expect(narrator).toBeVisible();
    // Opening narration is manual. If a future UI version auto-starts it, this remains valid.
    if (!(await events(page)).some(event => event.kind === 'play' && event.id === openingId)) {
      await expect(narrator).toBeEnabled();
      await narrator.click();
    }
    await waitForPlay(page, event => event.id === openingId, `lesson ${lesson}: opening audio must play`);

    // Starting the lesson must cut the opening and begin the first stage narration.
    await clearEvents(page);
    await page.locator('.lesson-opening-start').click();
    const runtime = page.locator(`.lesson-runtime[data-lesson-number="${lesson}"]:not([hidden])`);
    await expect(runtime).toBeVisible();
    const stage = runtime.locator('[data-stage-id]').first();
    await expect(stage).toBeVisible();
    const firstStageId = await stage.getAttribute('data-stage-id');
    expect(firstStageId).toBeTruthy();

    const prefix = `lesson-${String(lesson).padStart(2, '0')}-stage-`;
    const first = await waitForPlay(page, event => event.id.startsWith(prefix), `lesson ${lesson}: first stage narration must play`);
    const afterFirst = await events(page);
    expect(afterFirst.some(event => event.kind === 'pause' && event.id === openingId), `lesson ${lesson}: opening must stop when lesson starts`).toBe(true);

    await clearEvents(page);
    expect(await clickNext(runtime), `lesson ${lesson}: first stage must have an enabled next control`).toBe(true);
    await expect.poll(async () => stage.getAttribute('data-stage-id'), { timeout: 8_000 }).not.toBe(firstStageId);
    const immediate = await events(page);
    expect(immediate.some(event => event.kind === 'pause' && event.id === first.id), `lesson ${lesson}: old stage audio must stop immediately`).toBe(true);

    const second = await waitForPlay(page, event => event.id.startsWith(prefix) && event.id !== first.id, `lesson ${lesson}: new stage narration must play`);
    const switched = await events(page);
    const pause = switched.find(event => event.kind === 'pause' && event.id === first.id);
    expect(pause, `lesson ${lesson}: pause event for stale narration`).toBeTruthy();
    expect(pause!.at, `lesson ${lesson}: stale audio must stop before new audio starts`).toBeLessThanOrEqual(second.at);

    // Manual stop and replay of the current narration.
    await clearEvents(page);
    await narrator.click();
    const stopped = await events(page);
    expect(stopped.some(event => event.kind === 'pause' && event.id === second.id), `lesson ${lesson}: manual stop`).toBe(true);
    await narrator.click();
    await waitForPlay(page, event => event.id === second.id, `lesson ${lesson}: replay current narration`);
  });
}
