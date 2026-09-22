import {expect,test} from '@playwright/test';

test('lesson rewards are settled once and keep an auditable balance',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const result=await page.evaluate(async()=>{
    localStorage.removeItem('mathnikita:pythagoras-economy:v1');
    const economy=await import('/src/studentEconomy.ts');
    const input={lessonNumber:7,correct:19,wrong:1,hints:0,isControl:false,isTopicEnd:false,personalRecord:8};
    const first=economy.settleLessonReward(input);
    const second=economy.settleLessonReward(input);
    const state=economy.loadEconomyState();
    return{first,second,balance:state.balance,earned:state.lifetimeEarned,transactions:state.transactions.length,settled:Object.keys(state.settledLessons).length};
  });
  expect(result.first.amount).toBe(35);
  expect(result.second.id).toBe(result.first.id);
  expect(result.balance).toBe(35);
  expect(result.earned).toBe(35);
  expect(result.transactions).toBe(1);
  expect(result.settled).toBe(1);
});

test('real lesson completion creates a reward overlay and does not pay twice',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(async()=>{
    localStorage.removeItem('mathnikita:pythagoras-economy:v1');
    localStorage.removeItem('mathnikita:student-analytics:v1');
    const analytics=await import('/src/studentAnalytics.ts');
    for(let index=0;index<10;index+=1)analytics.recordAnalyticsEvent({lessonNumber:7,type:'answer_correct',area:'practice',firstTry:true});
    analytics.recordAnalyticsEvent({lessonNumber:7,type:'lesson_completed',area:'practice'});
  });
  await expect(page.getByRole('dialog',{name:'Награда за урок'})).toBeVisible();
  await expect(page.getByRole('dialog',{name:'Награда за урок'})).toContainText('Урок 7 завершён');
  await expect(page.getByRole('dialog',{name:'Награда за урок'})).toContainText('+35');
  await page.getByRole('button',{name:'Продолжить'}).click();
  await page.evaluate(async()=>{
    const analytics=await import('/src/studentAnalytics.ts');
    analytics.recordAnalyticsEvent({lessonNumber:7,type:'lesson_completed',area:'practice'});
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
