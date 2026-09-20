import {expect,test} from '@playwright/test';

test.use({viewport:{width:820,height:1180}});

test('lesson 175 final control remains usable on iPad',async({page})=>{
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 175:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:175,stageIndex:1}})));
  const stage=page.locator('.interactive-stage[data-stage-id="l175-task-01"]');
  await expect(stage).toBeVisible();
  await expect(stage.locator('input')).toHaveCount(3);
  await expect(stage.locator('input').first()).toHaveAttribute('inputmode','decimal');
  const sizes=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,stageWidth:document.querySelector('.interactive-stage')?.getBoundingClientRect().width??0}));
  expect(sizes.scrollWidth-sizes.clientWidth).toBeLessThanOrEqual(2);
  expect(sizes.stageWidth).toBeLessThanOrEqual(820);
});
