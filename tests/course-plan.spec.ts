import { expect,test } from '@playwright/test';

test('catalog follows the official 175-lesson Merzlyak plan through lesson 30',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('175 уроков в официальном плане')).toBeVisible();
  await expect(page.locator('.course-chapter-group')).toHaveCount(7);
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(lessons).toHaveCount(175);
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(29);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(30);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(1);
  await expect(lessons.nth(24)).toContainText('Вычитание натуральных чисел');
  await expect(lessons.nth(28)).toContainText('Вычитание натуральных чисел');
  await expect(lessons.nth(29)).toContainText('Числовые и буквенные выражения. Формулы');
  await expect(lessons.nth(30)).toContainText('Числовые и буквенные выражения. Формулы');
  await expect(lessons.nth(29)).toBeEnabled();
  await expect(lessons.nth(30)).toBeDisabled();
  await expect(lessons.nth(90)).toContainText('Понятие обыкновенной дроби');
  await expect(lessons.nth(108)).toContainText('Представление о десятичных дробях');
  await expect(lessons.nth(174)).toContainText('Итоговая контрольная работа');
  await expect(page.getByText('Полностью готовы 30 интерактивных уроков.')).toBeVisible();
});
