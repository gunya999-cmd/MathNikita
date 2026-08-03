import { expect,test } from '@playwright/test';

test('lesson 16 mandatory task 144 identifies hundreds as the first differing place',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 16:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l16-mission"]')).toBeVisible();

  await page.evaluate(()=>localStorage.setItem('mathnikita:extended-practice:16:v2','1'));
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:16,stageIndex:24}})));

  const practice=page.locator('.extended-practice');
  await expect(practice).toHaveAttribute('data-practice-task','l16-extra-2');
  await expect(practice).toContainText('6 235 □ 6 196');
  await practice.locator('.extended-practice-input input').fill('>');
  await practice.locator('.extended-practice-check').click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toContainText('в разряде сотен 2 > 1');

  await practice.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect(practice.locator('.practice-pythagoras-message')).toContainText('Первая разница уже в сотнях');
});
