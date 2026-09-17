import {expect,test,type Page} from '@playwright/test';

async function open156(page:Page){
 await page.goto('/');
 const button=page.locator('button[aria-label^="Открыть урок 156:"]');
 await expect(button).toBeEnabled();
 await button.evaluate((node:HTMLButtonElement)=>node.click());
 await expect(page.getByText('Урок 156 из 175')).toBeVisible();
 await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
 await expect(page.locator('.control-nine-page')).toBeVisible();
}
async function reopen156(page:Page){
 await page.reload();
 const button=page.locator('button[aria-label^="Открыть урок 156:"]');
 await expect(button).toBeEnabled();
 await button.evaluate((node:HTMLButtonElement)=>node.click());
 await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
 await expect(page.locator('.control-nine-page')).toBeVisible();
}
async function jump(page:Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:156,stageIndex}})),index)}
const stageValues:Record<number,string>={1:'35,1',2:'54',3:'300',4:'12,9',5:'10,2',6:'600'};
async function fillAll(page:Page,wrongFirst=false){for(let stageIndex=1;stageIndex<=6;stageIndex++){await jump(page,stageIndex);const stage=page.locator('.interactive-stage[data-stage-id]').first();const input=stage.locator('input');await expect(input).toHaveCount(1);await input.fill(wrongFirst&&stageIndex===1?'35,100001':stageValues[stageIndex])}}
async function submit(page:Page){await jump(page,7);await page.getByRole('button',{name:'Сдать работу'}).click();await expect(page.locator('.interactive-stage[data-stage-id="l156-summary"]')).toBeVisible();return page.locator('.control-result-card')}

test('lesson 156 hides answers, accepts exact variant and freezes perfect primary result',async({page})=>{
 await open156(page);
 await expect(page.locator('.cat-mentor')).toBeHidden();
 await expect(page.locator('.progressive-hint-coach')).toBeHidden();
 await expect(page.locator('.lesson-reflection')).toBeHidden();
 await jump(page,1);
 const first=page.locator('.interactive-stage[data-stage-id="l156-task1"]');
 await expect(first.locator('.control-explanation')).toHaveCount(0);
 await expect(first).not.toContainText('Ответ:');
 await fillAll(page);
 await jump(page,7);
 await expect(page.getByText('Заполнено 6 из 6')).toBeVisible();
 let result=await submit(page);
 await expect(result).toContainText('Первичный результат: 6/6');
 await expect(result).toContainText('оценка 5');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-156-control-v1')??'null'));
 expect(saved?.submitted).toBe(true);
 expect(saved?.submittedResponses?.['l156-1']).toBe('35,1');
 const completion=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:lesson-complete:156')??'null'));
 expect(completion?.completedAt).toBeTruthy();
 await reopen156(page);
 result=page.locator('.control-result-card');
 await expect(result).toContainText('Первичный результат: 6/6');
});

test('lesson 156 gives 4 for 5/6 and correction cannot change frozen primary score',async({page})=>{
 await open156(page);
 await fillAll(page,true);
 let result=await submit(page);
 await expect(result).toContainText('Первичный результат: 5/6');
 await expect(result).toContainText('оценка 4');
 await expect(result).toContainText('Ошибок: 1. Первичный балл уже сохранён.');
 await page.getByRole('button',{name:'Исправить ошибки'}).click();
 const correction=page.locator('.interactive-stage[data-stage-id="l156-task1"]');
 await expect(correction.locator('input')).toHaveCount(1);
 await correction.locator('input').fill('035,100');
 await page.getByRole('button',{name:'Завершить коррекцию'}).click();
 result=page.locator('.control-result-card');
 await expect(result).toContainText('Первичный результат: 5/6');
 await expect(result).toContainText('Коррекция завершена. Первичный результат не изменён.');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-156-control-v1')??'null'));
 expect(saved?.submittedResponses?.['l156-1']).toBe('35,100001');
 expect(saved?.responses?.['l156-1']).toBe('035,100');
 await reopen156(page);
 await expect(page.locator('.control-result-card')).toContainText('Первичный результат: 5/6');
});
