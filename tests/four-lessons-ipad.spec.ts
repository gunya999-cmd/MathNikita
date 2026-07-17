import { expect, test } from '@playwright/test';

async function openLesson(page: import('@playwright/test').Page, lessonNumber: number) {
  await page.goto('/');
  const lessons = page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(4);
  await lessons.nth(lessonNumber - 1).click();
  await expect(page.locator('.lesson-opening-start')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage')).toBeVisible();
}

for (const lessonNumber of [1, 2, 3, 4]) {
  test(`lesson ${lessonNumber} opens and fits iPad viewport`, async ({ page }) => {
    await openLesson(page, lessonNumber);
    await expect(page.locator('.lesson-page-navigator-toggle')).toBeVisible();
    await expect(page.locator('.voice-narrator > button').first()).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);

    await page.locator('.lesson-page-navigator-toggle').click();
    await expect(page.locator('.lesson-page-navigator-panel')).toBeVisible();
    await expect(page.locator('.lesson-page-navigator-groups button').first()).toBeVisible();
  });
}

test('lesson 1 response survives direct page navigation on iPad WebKit', async ({ page }) => {
  await openLesson(page, 1);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage', { detail: { lessonNumber: 1, stageIndex: 8 } })));
  await expect(page.locator('[data-stage-id="choice"]')).toBeVisible();
  await page.locator('[data-stage-id="choice"] .choice-grid button', { hasText: '40' }).click();

  await page.evaluate(() => window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage', { detail: { lessonNumber: 1, stageIndex: 9 } })));
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage', { detail: { lessonNumber: 1, stageIndex: 8 } })));
  await expect(page.locator('[data-stage-id="choice"] .choice-grid button.selected')).toHaveText('40');
});
