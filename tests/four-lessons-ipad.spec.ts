import { expect, test } from '@playwright/test';

for (const lessonNumber of [1, 2, 3, 4]) {
  test(`lesson ${lessonNumber} opens and fits iPad viewport`, async ({ page }) => {
    await page.goto('/');
    const lesson = page.getByRole('button', { name: new RegExp(`Открыть урок ${lessonNumber}:`) });
    await expect(lesson).toBeEnabled();
    await lesson.click();
    await expect(page.getByRole('button', { name: /Начать урок/ })).toBeVisible();
    await page.getByRole('button', { name: /Начать урок/ }).click();
    await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage')).toBeVisible();
    await expect(page.locator('.lesson-page-navigator-toggle')).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);

    await page.locator('.lesson-page-navigator-toggle').click();
    await expect(page.locator('.lesson-page-navigator-panel')).toBeVisible();
    const firstPage = page.locator('.lesson-page-navigator-panel button').filter({ has: page.locator('span') }).first();
    await expect(firstPage).toBeVisible();

    const listen = page.getByRole('button', { name: /Слушать|Остановить/ }).first();
    await expect(listen).toBeVisible();
  });
}

test('lesson 1 response survives page navigation on iPad WebKit', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Открыть урок 1:/ }).click();
  await page.getByRole('button', { name: /Начать урок/ }).click();
  await page.locator('.lesson-page-navigator-toggle').click();
  await page.getByRole('button', { name: /Какое число идёт следующим/ }).click();
  await page.getByRole('button', { name: '40', exact: true }).click();

  await page.locator('.lesson-page-navigator-toggle').click();
  await page.getByRole('button', { name: /Сравниваем по положению/ }).click();
  await page.locator('.lesson-page-navigator-toggle').click();
  await page.getByRole('button', { name: /Какое число идёт следующим/ }).click();

  await expect(page.getByRole('button', { name: '40', exact: true })).toHaveClass(/selected/);
});
