import {expect,test} from '@playwright/test';

test('lesson 93 stays usable on iPad without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:820,height:1180});
  await page.goto('/');
  await page.locator('button[aria-label^="Открыть урок 93:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:93,stageIndex:8}})));
  const stage=page.locator('.interactive-stage[data-stage-id="l93-practice-01"]');
  await expect(stage).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  const stageBox=await stage.boundingBox();
  expect(stageBox).not.toBeNull();
  expect((stageBox?.width??9999)).toBeLessThanOrEqual(820);
  await expect(stage.locator('input')).toHaveCount(6);
});