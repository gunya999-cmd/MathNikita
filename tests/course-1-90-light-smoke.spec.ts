import { expect, test, type Page } from '@playwright/test';

const PROD = 'https://mathnikita.gunya999.workers.dev';

const ignorableConsoleError = (text: string) =>
  /Failed to load resource|favicon|net::ERR_ABORTED/i.test(text);

async function prepare(page: Page) {
  await page.addInitScript(() => {
    const profileId = 'smoke-audit-user';
    const now = new Date().toISOString();
    localStorage.setItem('mathnikita:accounts:registry:v1', JSON.stringify({
      version: 1,
      profiles: [{
        id: profileId,
        name: 'Smoke Audit',
        avatar: '🐱',
        pinSalt: 'smoke-only',
        pinHash: 'smoke-only',
        createdAt: now,
        lastUsedAt: now,
      }],
    }));
    localStorage.setItem('mathnikita:accounts:workspace-owner:v1', profileId);
    sessionStorage.setItem('mathnikita:accounts:session:v1', profileId);
    localStorage.setItem('mathnikita-mentor-auto-guide', 'false');
    localStorage.setItem('mathnikita-voice-settings-v4', JSON.stringify({ engine: 'browser', rate: 1 }));
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel = () => {};
      synth.speak = () => {};
    }
  });
}

for (let lessonNumber = 1; lessonNumber <= 90; lessonNumber += 1) {
  test(`lesson ${lessonNumber} opens and reaches a live runtime without client errors`, async ({ page }) => {
    test.setTimeout(30_000);
    await prepare(page);

    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && !ignorableConsoleError(message.text())) consoleErrors.push(message.text());
    });

    const response = await page.goto(`${PROD}/?smokeLesson=${lessonNumber}`, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `production HTML failed for lesson ${lessonNumber}`).toBeTruthy();

    const lessons = page.locator('.course-lesson-grid > button');
    await expect(lessons, 'catalog must contain the official 175 lessons').toHaveCount(175);
    await page.locator('.course-chapter-group').evaluateAll(nodes => {
      for (const node of nodes) (node as HTMLDetailsElement).open = true;
    });

    const openButton = lessons.nth(lessonNumber - 1);
    await expect(openButton, `lesson ${lessonNumber} card must be visible`).toBeVisible();
    await expect(openButton, `lesson ${lessonNumber} must be enabled`).toBeEnabled();
    await expect(openButton, `lesson ${lessonNumber} card must identify its lesson number`).toHaveAttribute('aria-label', new RegExp(`^Открыть урок ${lessonNumber}:`));
    await openButton.click();

    const startButton = page.locator('.lesson-opening-start');
    await expect(startButton, `lesson ${lessonNumber} opening must render`).toBeVisible();
    await expect(startButton, `lesson ${lessonNumber} opening start must be enabled`).toBeEnabled();
    await startButton.click();

    const runtime = page.locator('.lesson-runtime:not([hidden])');
    await expect(runtime, `lesson ${lessonNumber} runtime must become visible`).toBeVisible();

    const stage = runtime.locator('[data-stage-id]').first();
    await expect(stage, `lesson ${lessonNumber} must render a stage`).toBeVisible();
    const firstStageId = await stage.getAttribute('data-stage-id');
    expect(firstStageId, `lesson ${lessonNumber} stage id must be non-empty`).toBeTruthy();

    const nextCandidates = runtime.getByRole('button', { name: /^(Дальше|Далее)\s*→$/ });
    for (let index = 0; index < await nextCandidates.count(); index += 1) {
      const candidate = nextCandidates.nth(index);
      if (await candidate.isVisible() && await candidate.isEnabled()) {
        await candidate.click();
        await expect.poll(async () => stage.getAttribute('data-stage-id'), { timeout: 4_000 }).not.toBe(firstStageId);
        break;
      }
    }

    await page.waitForTimeout(120);
    expect(pageErrors, `lesson ${lessonNumber} page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    expect(consoleErrors, `lesson ${lessonNumber} console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
  });
}
