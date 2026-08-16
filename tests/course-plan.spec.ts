import { expect,test } from '@playwright/test';

test('catalog follows the official 175-lesson Merzlyak plan through lesson 46',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('175 уроков в официальном плане')).toBeVisible();
  await expect(page.locator('.course-chapter-group')).toHaveCount(7);
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(lessons).toHaveCount(175);
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(44);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(46);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(2);
  await expect(lessons.nth(24)).toContainText('Вычитание натуральных чисел');
  await expect(lessons.nth(28)).toContainText('Вычитание натуральных чисел');
  await expect(lessons.nth(29)).toContainText('Числовые и буквенные выражения. Формулы');
  await expect(lessons.nth(32)).toContainText('Контрольная работа № 2');
  await expect(lessons.nth(32)).toBeEnabled();
  await expect(lessons.nth(32)).toHaveClass(/is-control-ready/);
  for(let index=33;index<=45;index+=1){await expect(lessons.nth(index)).toBeEnabled();await expect(lessons.nth(index)).toHaveClass(/is-interactive/)}
  await expect(lessons.nth(38)).toContainText('Виды углов. Измерение углов');
  await expect(lessons.nth(42)).toContainText('Виды углов. Измерение углов');
  await expect(lessons.nth(43)).toContainText('Многоугольники. Равные фигуры');
  await expect(lessons.nth(44)).toContainText('Многоугольники. Равные фигуры');
  await expect(lessons.nth(44)).toBeEnabled();
  await expect(lessons.nth(45)).toContainText('Треугольник и его виды');
  await expect(lessons.nth(45)).toBeEnabled();
  await expect(lessons.nth(46)).toContainText('Треугольник и его виды');
  await expect(lessons.nth(46)).toBeDisabled();
  await expect(lessons.nth(90)).toContainText('Понятие обыкновенной дроби');
  await expect(lessons.nth(108)).toContainText('Представление о десятичных дробях');
  await expect(lessons.nth(174)).toContainText('Итоговая контрольная работа');
  await expect(page.getByText('Полностью готовы 46 уроков.')).toBeVisible();
});
