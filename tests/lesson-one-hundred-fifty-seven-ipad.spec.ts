import {expect,test} from '@playwright/test';

test.use({viewport:{width:820,height:1180}});

test('lesson 157 remains usable on iPad without horizontal overflow',async({page})=>{
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 157:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:157,stageIndex:6}})));
  const stage=page.locator('.interactive-stage[data-stage-id="l157-practice-01"]');
  await expect(stage).toBeVisible();
  await expect(stage.locator('input')).toHaveCount(3);
  const sizes=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,stageWidth:document.querySelector('.interactive-stage')?.getBoundingClientRect().width??0}));
  expect(sizes.scrollWidth-sizes.clientWidth).toBeLessThanOrEqual(2);
  expect(sizes.stageWidth).toBeLessThanOrEqual(820);
});
