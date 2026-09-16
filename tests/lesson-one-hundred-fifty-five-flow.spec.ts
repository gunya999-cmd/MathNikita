import {expect,test,type Page} from '@playwright/test';

async function open155(page:Page){
 await page.goto('/');
 const button=page.locator('button[aria-label^="Открыть урок 155:"]');
 await expect(button).toBeEnabled();
 await button.evaluate((node:HTMLButtonElement)=>node.click());
 await expect(page.getByText('Урок 155 из 175')).toBeVisible();
 await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
 await expect(page.locator('[aria-label="Урок 155: генеральная репетиция контрольной работы номер 9"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:155,stageIndex:index}})),stageIndex)}

test('lesson 155 opens first rehearsal card and persists progress',async({page})=>{
 await open155(page);await jump(page,7);
 const stage=page.locator('.interactive-stage[data-stage-id="l155-practice-01"]');
 await expect(stage).toContainText('13, 17, 21 и 25');
 const inputs=stage.locator('input');await expect(inputs).toHaveCount(3);
 await inputs.nth(0).fill('076.0');await inputs.nth(1).fill('019,00');await inputs.nth(2).fill('012');
 await stage.getByRole('button',{name:'Проверить'}).click();
 await expect(stage.locator('.instant-feedback.good')).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-155-progress-v1')??'null'));
 expect(saved?.stageIndex).toBe(7);expect(saved?.responses?.['l155-practice-01:a']).toBe('076.0');
 await page.reload();
 await page.locator('button[aria-label^="Открыть урок 155:"]').evaluate((node:HTMLButtonElement)=>node.click());
 await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
 await expect(page.locator('.interactive-stage[data-stage-id="l155-practice-01"]')).toBeVisible();
});

test('lesson 155 rejects a close but incorrect decimal',async({page})=>{
 await open155(page);await jump(page,7);
 const stage=page.locator('.interactive-stage[data-stage-id="l155-practice-01"]');
 await stage.locator('input').nth(0).fill('76');await stage.locator('input').nth(1).fill('19,000001');await stage.locator('input').nth(2).fill('12');
 await stage.getByRole('button',{name:'Проверить'}).click();
 await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 155 covers direct inverse changing-base models and summary',async({page})=>{
 await open155(page);
 await jump(page,2);await expect(page.locator('.interactive-stage[data-stage-id="l155-direct"]')).toContainText('135%=1,35');
 await jump(page,3);await expect(page.locator('.interactive-stage[data-stage-id="l155-inverse"]')).toContainText('восстанови 100%');
 await jump(page,5);await expect(page.locator('.interactive-stage[data-stage-id="l155-base"]')).toContainText('Проценты нельзя просто складывать');
 await jump(page,27);await expect(page.locator('.interactive-stage[data-stage-id="l155-summary"]')).toContainText('20 карточек · 50 ответов');
});
