import {expect,test} from '@playwright/test';

test('catalog follows the official 175-lesson Merzlyak plan through lesson 99',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('175 уроков в официальном плане')).toBeVisible();
  await expect(page.locator('.course-chapter-group')).toHaveCount(7);
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(lessons).toHaveCount(175);
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(94);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(99);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(5);

  for(const lessonNumber of [20,33,53,73,90]){
    const button=lessons.nth(lessonNumber-1);
    await expect(button).toBeEnabled();
    await expect(button).toHaveClass(/is-control-ready/);
  }
  for(let lessonNumber=91;lessonNumber<=99;lessonNumber+=1){
    const button=lessons.nth(lessonNumber-1);
    await expect(button).toBeEnabled();
    await expect(button).toHaveClass(/is-interactive/);
  }

  await expect(lessons.nth(95)).toContainText('Правильные и неправильные дроби');
  await expect(lessons.nth(96)).toContainText('Сравнение и упорядочивание дробей');
  await expect(lessons.nth(97)).toContainText('Итог § 26: сложные сравнения и дробные неравенства');
  await expect(lessons.nth(98)).toContainText('Сложение и вычитание дробей с одинаковыми знаменателями');
  await expect(lessons.nth(98)).toBeEnabled();
  await expect(lessons.nth(98)).toHaveClass(/is-interactive/);

  await expect(lessons.nth(99)).toContainText('Сложение и вычитание дробей с одинаковыми знаменателями');
  await expect(lessons.nth(99)).toBeDisabled();
  await expect(lessons.nth(108)).toContainText('Представление о десятичных дробях');
  await expect(lessons.nth(174)).toContainText('Итоговая контрольная работа');
  await expect(page.getByText('Полностью готовы 99 уроков.')).toBeVisible();
});
