import { expect, test, type Page } from '@playwright/test';

type AuditEvent = { kind: 'request' | 'play' | 'pause' | 'ended'; id: string };
type AuditState = { events: AuditEvent[]; active: number; maxActive: number };

const READY_LESSONS = 90;
const TOTAL_LESSONS = 175;

async function installAudioAudit(page: Page) {
  await page.addInitScript(() => {
    const audit: AuditState = { events: [], active: 0, maxActive: 0 };
    const blobIds = new WeakMap<Blob, string>();
    const nativeFetch = window.fetch.bind(window);
    const nativeCreateObjectURL = URL.createObjectURL.bind(URL);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      let narrationId = '';

      if (url.includes('/api/narration') && !url.includes('/api/narration-status')) {
        let rawBody = init?.body;
        if (rawBody == null && input instanceof Request) {
          try {
            rawBody = await input.clone().text();
          } catch {
            // The request audit is best-effort; playback is checked independently below.
          }
        }
        if (typeof rawBody === 'string') {
          try {
            narrationId = (JSON.parse(rawBody) as { id?: string }).id ?? '';
          } catch {
            narrationId = '';
          }
        }
        if (narrationId) audit.events.push({ kind: 'request', id: narrationId });
      }

      const response = await nativeFetch(input, init);
      if (!narrationId) return response;

      return new Proxy(response, {
        get(target, property) {
          if (property === 'blob') {
            return async () => {
              const blob = await target.blob();
              blobIds.set(blob, narrationId);
              return blob;
            };
          }
          const value = Reflect.get(target, property, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    };

    URL.createObjectURL = (blob: Blob | MediaSource) => {
      if (blob instanceof Blob) {
        const id = blobIds.get(blob);
        if (id) return `blob:audio-hard-test/${encodeURIComponent(id)}`;
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
      private started = false;
      private timer: number | null = null;

      constructor(source = '') {
        this.src = source;
      }

      private narrationId() {
        const prefix = 'blob:audio-hard-test/';
        return this.src.startsWith(prefix) ? decodeURIComponent(this.src.slice(prefix.length)) : this.src;
      }

      pause() {
        if (!this.started) return;
        audit.events.push({ kind: 'pause', id: this.narrationId() });
        this.started = false;
        audit.active = Math.max(0, audit.active - 1);
        if (this.timer !== null) {
          window.clearTimeout(this.timer);
          this.timer = null;
        }
      }

      play() {
        this.pause();
        this.started = true;
        audit.active += 1;
        audit.maxActive = Math.max(audit.maxActive, audit.active);
        audit.events.push({ kind: 'play', id: this.narrationId() });
        this.timer = window.setTimeout(() => {
          if (!this.started) return;
          this.started = false;
          this.timer = null;
          audit.active = Math.max(0, audit.active - 1);
          audit.events.push({ kind: 'ended', id: this.narrationId() });
          this.onended?.();
        }, 30_000);
        return Promise.resolve();
      }
    }

    Object.defineProperty(window, 'Audio', { configurable: true, writable: true, value: MockAudio });
    (window as unknown as { __audioHardTest: AuditState }).__audioHardTest = audit;
    localStorage.setItem('mathnikita-voice-settings-v4', JSON.stringify({ engine: 'studio', rate: 0.94 }));
    localStorage.setItem('mathnikita-mentor-auto-guide', 'false');
  });
}

async function auditState(page: Page) {
  return page.evaluate(() => {
    const audit = (window as unknown as { __audioHardTest: AuditState }).__audioHardTest;
    return { events: [...audit.events], active: audit.active, maxActive: audit.maxActive };
  });
}

async function openLessonFromCatalog(page: Page, lessonNumber: number) {
  const button = page.locator(`button[aria-label^="Открыть урок ${lessonNumber}:"]`);
  await expect(button).toHaveCount(1);
  await button.evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText(`Урок ${lessonNumber} из ${TOTAL_LESSONS}`);
}

async function expectPlayed(page: Page, narrationId: string) {
  await expect.poll(async () => {
    const audit = await auditState(page);
    return audit.events.some(event => event.kind === 'play' && event.id === narrationId);
  }, { timeout: 12_000 }).toBeTruthy();
}

async function expectPaused(page: Page, narrationId: string) {
  await expect.poll(async () => {
    const audit = await auditState(page);
    return audit.events.some(event => event.kind === 'pause' && event.id === narrationId);
  }, { timeout: 5_000 }).toBeTruthy();
}

test('Audio Hard-Test 1-90: every ready lesson can play Sulafat opening and stops it on exit', async ({ page }) => {
  test.setTimeout(180_000);
  await installAudioAudit(page);

  await page.route('**/api/narration-status', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, studioConfigured: true, provider: 'gemini', voice: 'Sulafat' }),
  }));
  await page.route('**/api/narration', route => route.fulfill({
    status: 200,
    contentType: 'audio/wav',
    body: 'RIFF-audio-hard-test',
  }));

  await page.goto('/');
  await expect(page.locator('button[aria-label^="Открыть урок "]')).toHaveCount(READY_LESSONS);
  await expect(page.locator('button[aria-label^="Урок "][aria-label$="в разработке"]')).toHaveCount(TOTAL_LESSONS - READY_LESSONS);

  for (let lessonNumber = 1; lessonNumber <= READY_LESSONS; lessonNumber += 1) {
    await openLessonFromCatalog(page, lessonNumber);

    const narrationId = `lesson-${String(lessonNumber).padStart(2, '0')}-opening`;
    const voiceButton = page.locator('.voice-narrator > button').first();
    await expect(voiceButton).toBeEnabled();
    await voiceButton.click();
    await expectPlayed(page, narrationId);

    const duringPlayback = await auditState(page);
    expect(duringPlayback.active, `lesson ${lessonNumber}: exactly one narration must be active`).toBe(1);
    expect(duringPlayback.maxActive, `lesson ${lessonNumber}: narrations must never overlap`).toBeLessThanOrEqual(1);

    await page.locator('.lesson-mode-toolbar > button').first().click();
    await expect(page.locator('.course-catalog-page')).toBeVisible();
    await expectPaused(page, narrationId);

    await expect.poll(async () => (await auditState(page)).active).toBe(0);
  }

  const finalAudit = await auditState(page);
  const playedOpeningIds = new Set(finalAudit.events.filter(event => event.kind === 'play' && /lesson-\d{2}-opening/.test(event.id)).map(event => event.id));
  const pausedOpeningIds = new Set(finalAudit.events.filter(event => event.kind === 'pause' && /lesson-\d{2}-opening/.test(event.id)).map(event => event.id));

  expect(playedOpeningIds.size).toBe(READY_LESSONS);
  expect(pausedOpeningIds.size).toBe(READY_LESSONS);
  expect(finalAudit.active).toBe(0);
  expect(finalAudit.maxActive).toBe(1);
});

test('Audio Hard-Test: fast forward from opening stops stale audio before the first lesson stage starts', async ({ page }) => {
  test.setTimeout(60_000);
  await installAudioAudit(page);

  await page.route('**/api/narration-status', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, studioConfigured: true, provider: 'gemini', voice: 'Sulafat' }),
  }));
  await page.route('**/api/narration', route => route.fulfill({
    status: 200,
    contentType: 'audio/wav',
    body: 'RIFF-audio-hard-test-forward',
  }));

  await page.goto('/');
  await openLessonFromCatalog(page, 1);

  const openingId = 'lesson-01-opening';
  await page.locator('.voice-narrator > button').first().click();
  await expectPlayed(page, openingId);
  expect((await auditState(page)).active).toBe(1);

  await page.locator('.lesson-opening-start').click();
  await expectPaused(page, openingId);
  await expect(page.locator('.lesson-runtime:not([hidden])')).toBeVisible();

  await expect.poll(async () => {
    const audit = await auditState(page);
    return audit.events.find(event => event.kind === 'play' && event.id.startsWith('lesson-01-stage-'))?.id ?? '';
  }, { timeout: 12_000 }).not.toBe('');

  const afterForward = await auditState(page);
  expect(afterForward.active).toBe(1);
  expect(afterForward.maxActive).toBe(1);
});
