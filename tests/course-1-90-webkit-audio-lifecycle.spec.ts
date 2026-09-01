import { expect, test, type Locator, type Page } from '@playwright/test';

const PROD = 'https://mathnikita.gunya999.workers.dev';
type AudioEvent = { at: number; source?: string; lessonNumber?: number; narrationId?: string };
type MockState = { played: AudioEvent[]; pauses: Array<{ at: number; src: string }>; playCalls: Array<{ at: number; src: string }> };

async function prepare(page: Page) {
  await page.route('**/api/narration', route => route.fulfill({ status: 200, headers: { 'content-type': 'audio/wav', 'x-mathnikita-voice': 'Sulafat', 'x-mathnikita-provider': 'gemini-flash', 'x-mathnikita-narration': 'ru-teacher-gemini-sulafat-v2', 'x-mathnikita-cache': 'hit' }, body: 'RIFFmockWAVEaudio-data-for-lifecycle' }));
  await page.addInitScript(() => {
    const profileId = 'webkit-audio-audit-user', now = new Date().toISOString();
    localStorage.setItem('mathnikita:accounts:registry:v1', JSON.stringify({ version: 1, profiles: [{ id: profileId, name: 'WebKit Audio Audit', avatar: '🐱', pinSalt: 'audit-only', pinHash: 'audit-only', createdAt: now, lastUsedAt: now }] }));
    localStorage.setItem('mathnikita:accounts:workspace-owner:v1', profileId); sessionStorage.setItem('mathnikita:accounts:session:v1', profileId);
    localStorage.setItem('mathnikita-mentor-auto-guide', 'false'); localStorage.setItem('mathnikita-voice-settings-v4', JSON.stringify({ engine: 'studio', rate: 0.94 }));
    const state: MockState = { played: [], pauses: [], playCalls: [] }; Object.defineProperty(window, '__mathnikitaWebkitAudioAudit', { value: state, configurable: true });
    window.addEventListener('mathnikita-audio-played', event => state.played.push({ at: performance.now(), ...((event as CustomEvent).detail ?? {}) }));
    class AuditAudio {
      src: string; currentSrc: string; preload = ''; playbackRate = 1; currentTime = 0; onended: (() => void) | null = null; onerror: (() => void) | null = null;
      constructor(source = '') { this.src = source; this.currentSrc = source; }
      play() { state.playCalls.push({ at: performance.now(), src: this.src }); return Promise.resolve(); }
      pause() { state.pauses.push({ at: performance.now(), src: this.src }); }
    }
    Object.defineProperty(window, 'Audio', { value: AuditAudio, configurable: true });
  });
}
const state = (page: Page): Promise<MockState> => page.evaluate(() => (window as unknown as { __mathnikitaWebkitAudioAudit: MockState }).__mathnikitaWebkitAudioAudit);
async function waitPlayed(page: Page, lesson: number, afterCount: number) { await expect.poll(async () => (await state(page)).played.slice(afterCount).filter(x => x.lessonNumber === lesson).length, { timeout: 10_000 }).toBeGreaterThan(0); return (await state(page)).played.slice(afterCount).filter(x => x.lessonNumber === lesson).at(-1)!; }
async function clickNext(runtime: Locator) { const buttons = runtime.getByRole('button', { name: /^(Дальше|Далее)\s*→$/ }); for (let i = 0; i < await buttons.count(); i += 1) { const b = buttons.nth(i); if (await b.isVisible() && await b.isEnabled()) { await b.click(); return true; } } return false; }

for (let lesson = 1; lesson <= 90; lesson += 1) {
  test(`lesson ${lesson} WebKit/iPad voice lifecycle: play, interrupt, switch, replay`, async ({ page }) => {
    test.setTimeout(45_000); await prepare(page); const response = await page.goto(`${PROD}/?webkitAudioAudit=${lesson}`, { waitUntil: 'domcontentloaded' }); expect(response?.ok()).toBeTruthy();
    const lessons = page.locator('.course-lesson-grid > button'); await expect(lessons).toHaveCount(175); await page.locator('.course-chapter-group').evaluateAll(nodes => { for (const node of nodes) (node as HTMLDetailsElement).open = true; });
    const openButton = lessons.nth(lesson - 1); await expect(openButton).toBeVisible(); await expect(openButton).toBeEnabled(); await openButton.click();

    const narrator = page.locator('.voice-narrator > button').first(); const openingBaseline = (await state(page)).played.length; await narrator.click();
    const opening = await waitPlayed(page, lesson, openingBaseline); expect(opening.narrationId).toBe(`lesson-${String(lesson).padStart(2, '0')}-opening`);
    const openingPause = (await state(page)).pauses.length; await narrator.click(); await expect.poll(async () => (await state(page)).pauses.length).toBeGreaterThan(openingPause);

    const beforeFirst = (await state(page)).played.length; await page.locator('.lesson-opening-start').click();
    const runtime = page.locator(`.lesson-runtime[data-lesson-number="${lesson}"]:not([hidden])`); await expect(runtime).toBeVisible(); const stage = runtime.locator('[data-stage-id]').first(); await expect(stage).toBeVisible(); const firstStageId = await stage.getAttribute('data-stage-id');
    const first = await waitPlayed(page, lesson, beforeFirst); expect(first.narrationId).toMatch(new RegExp(`^lesson-${String(lesson).padStart(2, '0')}-stage-`));

    const beforeAdvance = await state(page); expect(await clickNext(runtime), `lesson ${lesson}: next control`).toBe(true); await expect.poll(async () => stage.getAttribute('data-stage-id')).not.toBe(firstStageId);
    await expect.poll(async () => (await state(page)).pauses.length, { message: `lesson ${lesson}: previous audio must pause` }).toBeGreaterThan(beforeAdvance.pauses.length);
    const second = await waitPlayed(page, lesson, beforeAdvance.played.length); expect(second.narrationId).not.toBe(first.narrationId); const switched = await state(page); expect(switched.pauses.at(-1)!.at).toBeLessThanOrEqual(second.at);

    const pauseBaseline = switched.pauses.length; await narrator.click(); await expect.poll(async () => (await state(page)).pauses.length).toBeGreaterThan(pauseBaseline);
    const replayBaseline = (await state(page)).played.length; await narrator.click(); const replay = await waitPlayed(page, lesson, replayBaseline); expect(replay.narrationId).toBe(second.narrationId);
  });
}
