import {expect,test} from '@playwright/test';
test.use({viewport:{width:820,height:1180}});

test('lesson 156 control remains usable on iPad without answer leakage or overflow',async({page})=>{
 await page.goto('/');
 const button=page.locator('button[aria-label^="Открыть урок 156:"]');
 await expect(button).toBeEnabled();
 await button.evaluate((node:HTMLButtonElement)=>node.click());
 await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:156,stageIndex:1}})));
 const stage=page.locator('.interactive-stage[data-stage-id="l156-task1"]');
 await expect(stage).toBeVisible();
 await expect(stage.locator('input')).toHaveCount(1);
 await expect(stage.locator('.control-explanation')).toHaveCount(0);
 await expect(stage).not.toContainText('Ответ:');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(2);
 const box=await stage.boundingBox();
 expect(box).not.toBeNull();
 expect((box?.width??9999)).toBeLessThanOrEqual(820);
});
