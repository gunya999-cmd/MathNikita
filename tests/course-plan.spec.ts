import {expect,test} from '@playwright/test';

test('catalog follows the official 175-lesson Merzlyak plan through lesson 105',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('175 уроков в официальном плане')).toBeVisible();
  await expect(page.locator('.course-chapter-group')).toHaveCount(7);
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(lessons).toHaveCount(175);
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(100);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(105);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(5);
  for(const lessonNumber of [20,33,53,73,90]){const button=lessons.nth(lessonNumber-1);await expect(button).toBeEnabled();await expect(button).toHaveClass(/is-control-ready/)}
  for(let lessonNumber=91;lessonNumber<=105;lessonNumber+=1){const button=lessons.nth(lessonNumber-1);await expect(button).toBeEnabled();await expect(button).toHaveClass(/is-interactive/)}
  await expect(lessons.nth(100)).toContainText('Дроби и деление натуральных чисел');
  await expect(lessons.nth(101)).toContainText('Смешанные числа: целая и дробная части');
  await expect(lessons.nth(102)).toContainText('Смешанные числа: сложение и вычитание');
  await expect(lessons.nth(103)).toContainText('Смешанные числа: закрепление и неравенства');
  await expect(lessons.nth(104)).toContainText('Смешанные числа: сложные выражения и двойные неравенства');
  await expect(lessons.nth(104)).toBeEnabled();await expect(lessons.nth(104)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(105)).toContainText('Смешанные числа');await expect(lessons.nth(105)).toBeDisabled();
  await expect(lessons.nth(108)).toContainText('Представление о десятичных дробях');
  await expect(lessons.nth(174)).toContainText('Итоговая контрольная работа');
  await expect(page.getByText('Полностью готовы 105 уроков.')).toBeVisible();
});
