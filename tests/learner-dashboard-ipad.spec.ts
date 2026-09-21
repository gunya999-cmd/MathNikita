import {expect,test} from '@playwright/test';

test.use({viewport:{width:820,height:1180}});

test('student dashboard v4 stays readable on iPad and keeps full results accessible',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await expect(page.locator('.student-dashboard-v4')).toBeVisible();
  await expect(page.getByText('Пифагор растёт вместе с тобой')).toBeVisible();
  await page.locator('.sdv4-all-lessons summary').click();
  await expect(page.locator('.sdv4-lesson-list button')).toHaveCount(175);
  const sizes=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,primaryWidth:document.querySelector('.sdv4-primary')?.getBoundingClientRect().width??0}));
  expect(sizes.scrollWidth-sizes.clientWidth).toBeLessThanOrEqual(2);
  expect(sizes.primaryWidth).toBeLessThanOrEqual(820);
});
