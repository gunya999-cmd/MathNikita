import {expect,test} from '@playwright/test';
async function jump(page:import('@playwright/test').Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:108,stageIndex:index}})),stageIndex)}

test('lesson 108 control work fits iPad and hides mentor assistance',async({page})=>{
  await page.setViewportSize({width:820,height:1180});
  await page.goto('/');await page.locator('button[aria-label^="Открыть урок 108:"]').evaluate((node:HTMLButtonElement)=>node.click());await page.locator('.lesson-opening-start').click();await jump(page,1);
  const stage=page.locator('[data-stage-id="l108-task1"]');await expect(stage).toBeVisible();await expect(stage.locator('input')).toHaveCount(4);
  const metrics=await stage.evaluate(node=>({scrollWidth:(node as HTMLElement).scrollWidth,clientWidth:(node as HTMLElement).clientWidth,right:node.getBoundingClientRect().right}));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth+2);expect(metrics.right).toBeLessThanOrEqual(820);
  const mentor=page.locator('.cat-mentor');if(await mentor.count())await expect(mentor).toBeHidden();
});
