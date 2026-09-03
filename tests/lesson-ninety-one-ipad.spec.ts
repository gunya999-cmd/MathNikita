import {expect,test} from '@playwright/test';

test('lesson 91 stays usable on iPad without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:820,height:1180});
  await page.goto('/');
  const open=page.locator('button[aria-label^="Открыть урок 91:"]');
  await open.evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:91,stageIndex:9}})));
  await expect(page.locator('.interactive-stage[data-stage-id="l91-practice-01"]')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  const stageBox=await page.locator('.interactive-stage[data-stage-id="l91-practice-01"]').boundingBox();
  expect(stageBox).not.toBeNull();
  expect((stageBox?.width??9999)).toBeLessThanOrEqual(820);
  await expect(page.locator('.interactive-stage[data-stage-id="l91-practice-01"] input')).toHaveCount(3);
});
