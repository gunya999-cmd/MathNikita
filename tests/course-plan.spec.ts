import {expect,test} from '@playwright/test';

test('catalog follows the official 175-lesson Merzlyak plan through lesson 100',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('175 уроков в официальном плане')).toBeVisible();
  await expect(page.locator('.course-chapter-group')).toHaveCount(7);
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(lessons).toHaveCount(175);
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(95);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(100);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(5);

  for(const lessonNumber of [20,33,53,73,90]){
    const button=lessons.nth(lessonNumber-1);
    await expect(button).toBeEnabled();
    await expect(button).toHaveClass(/is-control-ready/);
  }
  for(let lessonNumber=91;lessonNumber<=100;lessonNumber+=1){
    const button=lessons.nth(lessonNumber-1);
    await expect(button).toBeEnabled();
    await expect(button).toHaveClass(/is-interactive/);
  }

  await expect(lessons.nth(97)).toContainText('Итог § 26: сложные сравнения и дробные неравенства');
  await expect(lessons.nth(98)).toContainText('Сложение и вычитание дробей с одинаковыми знаменателями');
  await expect(lessons.nth(99)).toContainText('Итог § 27: сложение и вычитание дробей с одинаковыми знаменателями');
  await expect(lessons.nth(99)).toBeEnabled();
  await expect(lessons.nth(99)).toHaveClass(/is-interactive/);

  await expect(lessons.nth(100)).toContainText('Дроби и деление натуральных чисел');
  await expect(lessons.nth(100)).toBeDisabled();
  await expect(lessons.nth(108)).toContainText('Представление о десятичных дробях');
  await expect(lessons.nth(174)).toContainText('Итоговая контрольная работа');
  await expect(page.getByText('Полностью готовы 100 уроков.')).toBeVisible();
});
