import {expect,test} from '@playwright/test';

test('catalog follows the official 175-lesson Merzlyak plan through lesson 121',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('175 уроков в официальном плане')).toBeVisible();
  await expect(page.locator('.course-chapter-group')).toHaveCount(7);
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(lessons).toHaveCount(175);
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(115);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(121);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(6);
  for(const lessonNumber of [20,33,53,73,90,108]){const button=lessons.nth(lessonNumber-1);await expect(button).toBeEnabled();await expect(button).toHaveClass(/is-control-ready/)}
  for(let lessonNumber=91;lessonNumber<=107;lessonNumber+=1){const button=lessons.nth(lessonNumber-1);await expect(button).toBeEnabled();await expect(button).toHaveClass(/is-interactive/)}
  await expect(lessons.nth(107)).toContainText('Контрольная работа № 6');await expect(lessons.nth(107)).toHaveClass(/is-control-ready/);
  await expect(lessons.nth(108)).toContainText('Представление о десятичных дробях');await expect(lessons.nth(108)).toBeEnabled();await expect(lessons.nth(108)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(109)).toContainText('Десятичные дроби: закрепление записи и чтения');await expect(lessons.nth(109)).toBeEnabled();await expect(lessons.nth(109)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(110)).toContainText('Десятичные дроби: единицы измерения и деление на 10/100');await expect(lessons.nth(110)).toBeEnabled();await expect(lessons.nth(110)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(111)).toContainText('Десятичные дроби: координатный луч и итог § 30');await expect(lessons.nth(111)).toBeEnabled();await expect(lessons.nth(111)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(112)).toContainText('Сравнение десятичных дробей: нули справа и разряды');await expect(lessons.nth(112)).toBeEnabled();await expect(lessons.nth(112)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(113)).toContainText('Сравнение десятичных дробей: интервалы и неизвестная цифра');await expect(lessons.nth(113)).toBeEnabled();await expect(lessons.nth(113)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(114)).toContainText('Сравнение десятичных дробей: числа между границами и итог § 31');await expect(lessons.nth(114)).toBeEnabled();await expect(lessons.nth(114)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(115)).toContainText('Округление чисел: правило для десятичных и натуральных');await expect(lessons.nth(115)).toBeEnabled();await expect(lessons.nth(115)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(116)).toContainText('Округление чисел: крупные разряды и наивысший разряд');await expect(lessons.nth(116)).toBeEnabled();await expect(lessons.nth(116)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(117)).toContainText('Округление чисел: обратные задачи, прикидки и итог § 32');await expect(lessons.nth(117)).toBeEnabled();await expect(lessons.nth(117)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(118)).toContainText('Сложение десятичных дробей: разряды и запись столбиком');await expect(lessons.nth(118)).toBeEnabled();await expect(lessons.nth(118)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(119)).toContainText('Вычитание десятичных дробей: разряды и переход через разряд');await expect(lessons.nth(119)).toBeEnabled();await expect(lessons.nth(119)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(120)).toContainText('Сложение и вычитание десятичных дробей: уравнения и составные задачи');await expect(lessons.nth(120)).toBeEnabled();await expect(lessons.nth(120)).toHaveClass(/is-interactive/);
  await expect(lessons.nth(121)).toBeDisabled();
  await expect(lessons.nth(174)).toContainText('Итоговая контрольная работа');
  await expect(page.getByText('Полностью готовы 121 уроков.')).toBeVisible();
});
