import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson53(page:Page){
  await page.goto('/');const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson53=page.getByRole('button',{name:/Открыть урок 53:/});const lesson54=page.locator('.course-lesson-grid > button').nth(53);const lesson55=page.locator('.course-lesson-grid > button').nth(54);const lesson56=page.locator('.course-lesson-grid > button').nth(55);const lesson57=page.locator('.course-lesson-grid > button').nth(56);
  await expect(lesson53).toBeEnabled();await expect(lesson53).toHaveClass(/is-control-ready/);await expect(lesson54).toBeEnabled();await expect(lesson55).toBeEnabled();await expect(lesson56).toBeEnabled();await expect(lesson57).toBeDisabled();
  await lesson53.click();await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,index:number,id:string){await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:53,stageIndex:index}})),{index});await expect(page.locator(`[data-stage-id="${id}"]`)).toBeVisible()}

test('lesson 53 preserves exact geometry, persistence and the control-only contract on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson53(page);
  await expect(page.locator('.lesson-controls')).toContainText('Этап 1 из 9');
  await expect(page.locator('.cat-mentor,.progressive-hint-coach,.lesson-reflection,.extended-practice')).toHaveCount(0);

  await jump(page,1,'l53-task1');const task1=page.locator('[data-stage-id="l53-task1"]');const construction=task1.locator('[data-source-control="3-1"]');
  const slider=construction.getByRole('slider',{name:'Положение луча KC'});for(let step=0;step<6;step+=1)await slider.press('ArrowRight');
  await expect(construction).toHaveAttribute('data-total-angle','74');await expect(construction).toHaveAttribute('data-angle-mkc','37');await expect(construction).toHaveAttribute('data-angle-cka','37');
  const rayAngle=await construction.locator('line[data-ray-angle]').evaluate(line=>{const x1=Number(line.getAttribute('x1'));const y1=Number(line.getAttribute('y1'));const x2=Number(line.getAttribute('x2'));const y2=Number(line.getAttribute('y2'));return Math.atan2(y1-y2,x2-x1)*180/Math.PI});expect(rayAngle).toBeCloseTo(37,1);
  await task1.locator('#l53-1a').fill('∠CKA, ∠MKC');await task1.locator('#l53-1b-mkc').fill('37');await task1.locator('#l53-1b-cka').fill('37');
  await page.locator('.lesson-controls .primary').click();await expect(page.locator('[data-stage-id="l53-task2"]')).toBeVisible();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-53-control-v1')??'null')?.responses?.['l53-1a'])).toBe('∠CKA, ∠MKC');
  await page.getByRole('button',{name:/Все уроки/}).click();await page.getByRole('button',{name:/Открыть урок 53:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l53-task2"]')).toBeVisible();

  await jump(page,5,'l53-task5');const figure=page.locator('[data-source-figure="21"]');await expect(figure).toHaveAttribute('data-angle-abe','154');await expect(figure).toHaveAttribute('data-angle-dbc','128');await expect(figure).toHaveAttribute('data-angle-dbe','102');
  const angles=await figure.locator('line[data-ray-angle]').evaluateAll(lines=>lines.map(line=>{const x1=Number(line.getAttribute('x1'));const y1=Number(line.getAttribute('y1'));const x2=Number(line.getAttribute('x2'));const y2=Number(line.getAttribute('y2'));return Math.atan2(y1-y2,x2-x1)*180/Math.PI}));expect(angles[0]).toBeCloseTo(128,1);expect(angles[1]).toBeCloseTo(26,1);expect(angles[0]-angles[1]).toBeCloseTo(102,1);
  await expect(page.locator('.instant-feedback.good,.instant-feedback.bad')).toHaveCount(0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});
