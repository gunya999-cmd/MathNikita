import {expect,test} from '@playwright/test';

test('lesson 105 stays usable on iPad without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:820,height:1180});await page.goto('/');await page.locator('button[aria-label^="Открыть урок 105:"]').evaluate((node:HTMLButtonElement)=>node.click());await page.locator('.lesson-opening-start').click();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:105,stageIndex:8}})));
  const stage=page.locator('.interactive-stage[data-stage-id="l105-practice-01"]');await expect(stage).toBeVisible();const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
  const box=await stage.boundingBox();expect(box).not.toBeNull();expect((box?.width??9999)).toBeLessThanOrEqual(820);await expect(stage.locator('input')).toHaveCount(2);
});
