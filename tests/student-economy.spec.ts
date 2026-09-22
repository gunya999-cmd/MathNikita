import {expect,test} from '@playwright/test';

test('lesson rewards are settled once and keep an auditable balance',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const result=await page.evaluate(()=>{
    localStorage.removeItem('mathnikita:pythagoras-economy:v1');
    const api=(window as any).__mathNikitaEconomyTest;
    if(!api)throw new Error('Economy E2E bridge is unavailable');
    const input={lessonNumber:7,correct:19,wrong:1,hints:0,isControl:false,isTopicEnd:false,personalRecord:8};
    const first=api.settleLessonReward(input);
    const second=api.settleLessonReward(input);
    const state=api.loadEconomyState();
    return{first,second,balance:state.balance,earned:state.lifetimeEarned,transactions:state.transactions.length,settled:Object.keys(state.settledLessons).length};
  });
  expect(result.first.amount).toBe(35);
  expect(result.second.id).toBe(result.first.id);
  expect(result.balance).toBe(35);
  expect(result.earned).toBe(35);
  expect(result.transactions).toBe(1);
  expect(result.settled).toBe(1);
});

test('settled lesson reward opens the result overlay and cannot be paid twice',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.removeItem('mathnikita:pythagoras-economy:v1');
    const api=(window as any).__mathNikitaEconomyTest;
    if(!api)throw new Error('Economy E2E bridge is unavailable');
    api.settleLessonReward({lessonNumber:7,correct:10,wrong:0,hints:0,isControl:false,isTopicEnd:false,personalRecord:10});
  });
  const overlay=page.getByRole('dialog',{name:'Награда за урок'});
  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText('Урок 7 завершён');
  await expect(overlay).toContainText('+35');
  await page.getByRole('button',{name:'Продолжить'}).click();
  await page.evaluate(()=>{
    const api=(window as any).__mathNikitaEconomyTest;
    api.settleLessonReward({lessonNumber:7,correct:10,wrong:0,hints:0,isControl:false,isTopicEnd:false,personalRecord:10});
  });
  await expect(page.getByRole('dialog',{name:'Награда за урок'})).toHaveCount(0);
  const balance=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:pythagoras-economy:v1')??'{}').balance);
  expect(balance).toBe(35);
});

test('Pythagoras shop buys once, equips inventory and persists spend history',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('mathnikita:pythagoras-economy:v1',JSON.stringify({version:1,balance:600,lifetimeEarned:600,lifetimeSpent:0,rewardedRecordBest:0,settledLessons:{},inventory:[],equipped:{},transactions:[]}));
  });
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await expect(page.getByRole('button',{name:/Открыть Пифагора/})).toContainText('600');
  await page.getByRole('button',{name:/Открыть Пифагора/}).click();
  const dialog=page.getByRole('dialog',{name:'Пифагор'});
  await expect(dialog).toBeVisible();
  const glasses=dialog.locator('.py-items article').filter({hasText:'Очки'});
  await glasses.getByRole('button',{name:'Купить'}).click();
  await expect(glasses).toContainText('В инвентаре');
  await glasses.getByRole('button',{name:'Надеть'}).click();
  await expect(glasses.getByRole('button',{name:'Выбрано'})).toBeDisabled();
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:pythagoras-economy:v1')??'{}'));
  expect(state.balance).toBe(560);
  expect(state.inventory).toEqual(['glasses']);
  expect(state.equipped.style).toBe('glasses');
  expect(state.transactions[0].amount).toBe(-40);
});
