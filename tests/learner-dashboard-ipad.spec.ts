import {expect,test} from '@playwright/test';

test.use({viewport:{width:820,height:1180}});

test('student dashboard reference layout stays readable on iPad',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await expect(page.getByText('Сегодня',{exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Мой рост'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Твой маршрут'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Мои навыки'})).toBeVisible();
  await expect(page.getByRole('button',{name:/Продолжить/})).toBeVisible();
  await page.getByRole('button',{name:/Весь курс/}).click();
  await expect(page.locator('.sdv4-lesson')).toHaveCount(175);
  const sizes=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,dashboardWidth:document.querySelector('.sdv4')?.getBoundingClientRect().width??0}));
  expect(sizes.scrollWidth-sizes.clientWidth).toBeLessThanOrEqual(2);
  expect(sizes.dashboardWidth).toBeLessThanOrEqual(820);
});
