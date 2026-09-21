import {expect,test} from '@playwright/test';

test.use({viewport:{width:820,height:1180}});

test('student dashboard v4 stays readable on iPad and keeps the full course secondary',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await expect(page.getByRole('heading',{name:'Твой курс'})).toBeVisible();
  await expect(page.getByRole('button',{name:/Продолжить урок/})).toBeVisible();
  await page.getByText('Все уроки и подробный прогресс').click();
  await expect(page.locator('.sdv4-lesson')).toHaveCount(175);
  const sizes=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,dashboardWidth:document.querySelector('.sdv4')?.getBoundingClientRect().width??0}));
  expect(sizes.scrollWidth-sizes.clientWidth).toBeLessThanOrEqual(2);
  expect(sizes.dashboardWidth).toBeLessThanOrEqual(820);
});
