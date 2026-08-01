import { expect, test } from '@playwright/test';

test('catalog follows the official 175-lesson Merzlyak plan', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('175 уроков в официальном плане')).toBeVisible();
  await expect(page.locator('.course-chapter-group')).toHaveCount(7);

  const lessons = page.locator('.course-lesson-grid > button');
  await expect(lessons).toHaveCount(175);
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(19);

  await expect(lessons.nth(0)).toContainText('Ряд натуральных чисел');
  await expect(lessons.nth(1)).toContainText('Ряд натуральных чисел');
  await expect(lessons.nth(2)).toContainText('Цифры. Десятичная запись натуральных чисел');
  await expect(lessons.nth(4)).toContainText('Цифры. Десятичная запись натуральных чисел');
  await expect(lessons.nth(5)).toContainText('Отрезок. Длина отрезка');
  await expect(lessons.nth(6)).toContainText('Отрезок. Длина отрезка');
  await expect(lessons.nth(7)).toContainText('Отрезок. Длина отрезка');
  await expect(lessons.nth(8)).toContainText('Отрезок. Длина отрезка');
  await expect(lessons.nth(9)).toContainText('Плоскость. Прямая. Луч');
  await expect(lessons.nth(10)).toContainText('Плоскость. Прямая. Луч');
  await expect(lessons.nth(11)).toContainText('Плоскость. Прямая. Луч');
  await expect(lessons.nth(12)).toContainText('Шкала. Координатный луч');
  await expect(lessons.nth(13)).toContainText('Шкала. Координатный луч');
  await expect(lessons.nth(14)).toContainText('Шкала. Координатный луч');
  await expect(lessons.nth(15)).toContainText('Сравнение натуральных чисел');
  await expect(lessons.nth(16)).toContainText('Сравнение натуральных чисел');
  await expect(lessons.nth(17)).toContainText('Сравнение натуральных чисел');
  await expect(lessons.nth(18)).toContainText('Повторение и систематизация учебного материала');
  await expect(lessons.nth(19)).toContainText('Контрольная работа № 1');
  await expect(lessons.nth(90)).toContainText('Понятие обыкновенной дроби');
  await expect(lessons.nth(108)).toContainText('Представление о десятичных дробях');
  await expect(lessons.nth(174)).toContainText('Итоговая контрольная работа');

  await expect(lessons.nth(18)).toBeEnabled();
  await expect(lessons.nth(19)).toBeDisabled();
  await expect(page.locator('body')).not.toContainText('Открытие темы');
  await expect(page.getByText('Полностью готовы первые девятнадцать интерактивных уроков.')).toBeVisible();
});
