import {expect,test} from '@playwright/test';

test.use({viewport:{width:820,height:1180}});

test('student dashboard keeps the focused 1+2+3+5 structure readable on iPad',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await expect(page.getByText('Сегодня',{exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Мой рост'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Твой маршрут'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Мои навыки'})).toBeVisible();
  await expect(page.getByRole('button',{name:/Продолжить урок/})).toBeVisible();
  await expect(page.locator('.sdv4-sidebar')).toHaveCount(0);
  await expect(page.locator('.sdv4-topnav')).toBeVisible();
  await expect(page.locator('.sdv4-topnav button')).toHaveCount(3);
  await expect(page.locator('.sdv4-companion')).toBeVisible();
  await page.getByRole('button',{name:/Весь курс/}).click();
  await expect(page.locator('.sdv4-lesson')).toHaveCount(175);
  const sizes=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,dashboardWidth:document.querySelector('.sdv4')?.getBoundingClientRect().width??0}));
  expect(sizes.scrollWidth-sizes.clientWidth).toBeLessThanOrEqual(2);
  expect(sizes.dashboardWidth).toBeLessThanOrEqual(820);
});

test('Pythagoras wallet, room and shop fit iPad without horizontal overflow',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('mathnikita:pythagoras-economy:v1',JSON.stringify({version:1,balance:240,lifetimeEarned:480,lifetimeSpent:240,rewardedRecordBest:0,settledLessons:{},inventory:['glasses','desk'],equipped:{style:'glasses',room:'desk'},transactions:[]}));
  });
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await page.getByRole('button',{name:/Открыть Пифагора/}).click();
  await expect(page.getByRole('dialog',{name:'Пифагор'})).toBeVisible();
  await expect(page.getByRole('region',{name:'Комната Пифагора'})).toBeVisible();
  await expect(page.locator('.py-world-style')).toContainText('👓');
  await expect(page.locator('.py-room-desk')).toContainText('🗄️');
  await expect(page.getByRole('heading',{name:'Магазин'})).toBeVisible();
  const sizes=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,panelWidth:document.querySelector('.py-panel')?.getBoundingClientRect().width??0,worldWidth:document.querySelector('.py-world')?.getBoundingClientRect().width??0}));
  expect(sizes.scrollWidth-sizes.clientWidth).toBeLessThanOrEqual(2);
  expect(sizes.panelWidth).toBeLessThanOrEqual(820);
  expect(sizes.worldWidth).toBeLessThanOrEqual(sizes.panelWidth);
});
