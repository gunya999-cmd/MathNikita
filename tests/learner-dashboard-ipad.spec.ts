import {expect,test} from '@playwright/test';

test.use({viewport:{width:820,height:1180}});

test('student dashboard v3 stays readable on iPad and exposes the full course map',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await expect(page.getByRole('heading',{name:'Все 175 уроков'})).toBeVisible();
  await expect(page.locator('.sdv3-lesson-node')).toHaveCount(175);
  const sizes=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,detailWidth:document.querySelector('.sdv3-lesson-detail')?.getBoundingClientRect().width??0}));
  expect(sizes.scrollWidth-sizes.clientWidth).toBeLessThanOrEqual(2);
  expect(sizes.detailWidth).toBeLessThanOrEqual(820);
});
