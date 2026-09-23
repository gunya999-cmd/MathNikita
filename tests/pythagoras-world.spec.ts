import {expect,test} from '@playwright/test';

test('Pythagoras world reflects equipped items, collection and Catmobile goal',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('mathnikita:pythagoras-economy:v1',JSON.stringify({
      version:1,balance:250,lifetimeEarned:490,lifetimeSpent:240,rewardedRecordBest:8,settledLessons:{},
      inventory:['glasses','desk'],
      equipped:{style:'glasses',room:'desk'},
      transactions:[]
    }));
  });
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await page.getByRole('button',{name:/Открыть Пифагора/}).click();

  const dialog=page.getByRole('dialog',{name:'Пифагор'});
  await expect(dialog).toBeVisible();
  const world=dialog.getByRole('region',{name:'Комната Пифагора'});
  await expect(world).toBeVisible();
  await expect(world).toContainText('Котомобиль');
  await expect(world.locator('.py-world-style')).toContainText('👓');
  await expect(world.locator('.py-room-desk')).toContainText('🗄️');
  await expect(world.locator('.py-collection-grid article')).toHaveCount(10);
  await expect(world.locator('.py-collection-grid article.is-owned')).toHaveCount(2);
  await expect(world.locator('.py-collection-grid article.is-active')).toHaveCount(2);
  await expect(world).toContainText('Осталось 250');
});