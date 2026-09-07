import {expect,test} from '@playwright/test';

test('catalog follows the official 175-lesson Merzlyak plan through lesson 108',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('175 уроков в официальном плане')).toBeVisible();
  await expect(page.locator('.course-chapter-group')).toHaveCount(7);
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(lessons).toHaveCount(175);
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(102);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(108);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(6);
  for(const lessonNumber of [20,33,53,73,90,108]){const button=lessons.nth(lessonNumber-1);await expect(button).toBeEnabled();await expect(button).toHaveClass(/is-control-ready/)}
  for(let lessonNumber=91;lessonNumber<=107;lessonNumber+=1){const button=lessons.nth(lessonNumber-1);await expect(button).toBeEnabled();await expect(button).toHaveClass(/is-interactive/)}
  await expect(lessons.nth(105)).toContainText('Итог § 29: систематизация смешанных чисел');
  await expect(lessons.nth(106)).toContainText('Повторение главы 4: диагностика перед контрольной');
  await expect(lessons.nth(107)).toContainText('Контрольная работа № 6');await expect(lessons.nth(107)).toBeEnabled();await expect(lessons.nth(107)).toHaveClass(/is-control-ready/);
  await expect(lessons.nth(108)).toContainText('Представление о десятичных дробях');await expect(lessons.nth(108)).toBeDisabled();
  await expect(lessons.nth(174)).toContainText('Итоговая контрольная работа');
  await expect(page.getByText('Полностью готовы 108 уроков.')).toBeVisible();
});
