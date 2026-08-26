import { expect,test } from '@playwright/test';

test('catalog follows the official 175-lesson Merzlyak plan through lesson 69',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('175 уроков в официальном плане')).toBeVisible();
  await expect(page.locator('.course-chapter-group')).toHaveCount(7);
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(lessons).toHaveCount(175);
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(66);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(69);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(3);
  await expect(lessons.nth(24)).toContainText('Вычитание натуральных чисел');
  await expect(lessons.nth(28)).toContainText('Вычитание натуральных чисел');
  await expect(lessons.nth(29)).toContainText('Числовые и буквенные выражения. Формулы');
  await expect(lessons.nth(32)).toContainText('Контрольная работа № 2');
  await expect(lessons.nth(32)).toBeEnabled();
  await expect(lessons.nth(32)).toHaveClass(/is-control-ready/);
  for(let index=33;index<=50;index+=1){await expect(lessons.nth(index)).toBeEnabled();await expect(lessons.nth(index)).toHaveClass(/is-interactive/)}
  await expect(lessons.nth(52)).toContainText('Контрольная работа № 3');
  await expect(lessons.nth(52)).toBeEnabled();
  await expect(lessons.nth(52)).toHaveClass(/is-control-ready/);
  for(let index=53;index<=68;index+=1){await expect(lessons.nth(index)).toBeEnabled();await expect(lessons.nth(index)).toHaveClass(/is-interactive/)}
  await expect(lessons.nth(60)).toContainText('Смысл деления');
  await expect(lessons.nth(61)).toContainText('Деление: вычисления и задачи');
  await expect(lessons.nth(62)).toContainText('Деление: текстовые задачи');
  await expect(lessons.nth(63)).toContainText('Деление: решение уравнений');
  await expect(lessons.nth(64)).toContainText('Деление: комплексное закрепление');
  await expect(lessons.nth(65)).toContainText('Деление: уравнения и составные задачи');
  await expect(lessons.nth(66)).toContainText('Деление: итоговое обобщение');
  await expect(lessons.nth(67)).toContainText('Деление с остатком: смысл и правило');
  await expect(lessons.nth(68)).toContainText('Деление с остатком: задачи и закономерности');
  await expect(lessons.nth(68)).toBeEnabled();
  await expect(lessons.nth(69)).toContainText('Деление с остатком');
  await expect(lessons.nth(69)).toBeDisabled();
  await expect(lessons.nth(90)).toContainText('Понятие обыкновенной дроби');
  await expect(lessons.nth(108)).toContainText('Представление о десятичных дробях');
  await expect(lessons.nth(174)).toContainText('Итоговая контрольная работа');
  await expect(page.getByText('Полностью готовы 69 уроков.')).toBeVisible();
});
