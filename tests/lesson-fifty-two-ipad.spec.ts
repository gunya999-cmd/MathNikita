import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson52(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson52=page.getByRole('button',{name:/Открыть урок 52:/});
  const lesson53=page.locator('.course-lesson-grid > button').nth(52);
  const lesson54=page.locator('.course-lesson-grid > button').nth(53);
  await expect(lesson52).toBeEnabled();await expect(lesson53).toBeEnabled();await expect(lesson54).toBeDisabled();
  await lesson52.click();await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,index:number,id:string){await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:52,stageIndex:index}})),{index});await expect(page.locator(`[data-stage-id="${id}"]`)).toBeVisible()}

test('lesson 52 keeps all 12 source items, exact figures, retry gates and persistence stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson52(page);
  const player=page.locator('.chapter-two-review-player');
  await expect(player).toHaveAttribute('data-test-item-count','12');
  await expect(player).toHaveAttribute('data-source-reference',/с\. 102–105/);
  await expect(page.locator('[data-stage-id="l52-mission"] .lesson-controls')).toContainText('Этап 1 из 36');

  for(let item=1;item<=12;item+=1){
    await jump(page,19+item,`l52-test-${String(item).padStart(2,'0')}`);
    await expect(page.locator('.interactive-stage[data-source-test-item]')).toHaveAttribute('data-source-test-item',String(item));
  }

  await jump(page,25,'l52-test-06');
  const angle=page.locator('[data-source-test-figure="2-6"]');
  await expect(angle).toHaveAttribute('data-angle-mkb','115');await expect(angle).toHaveAttribute('data-angle-akp','94');await expect(angle).toHaveAttribute('data-result-angle-akb','29');
  const rayAngles=await angle.locator('[data-ray-angle]').evaluateAll(lines=>lines.map(line=>{const x1=Number(line.getAttribute('x1'));const y1=Number(line.getAttribute('y1'));const x2=Number(line.getAttribute('x2'));const y2=Number(line.getAttribute('y2'));return Math.atan2(y1-y2,x2-x1)*180/Math.PI}));
  expect(rayAngles[0]).toBeCloseTo(94,1);expect(rayAngles[1]).toBeCloseTo(65,1);expect(rayAngles[0]-rayAngles[1]).toBeCloseTo(29,1);
  await jump(page,26,'l52-test-07');
  const triangles=page.locator('[data-source-test-figure="2-7"]');
  await expect(triangles).toHaveAttribute('data-triangle-sides','5|8|11;4|6|6;5|12|13');await expect(triangles).toHaveAttribute('data-isosceles-perimeter','16');
  const sideRatios=await triangles.locator('polygon').evaluateAll(polygons=>polygons.map(polygon=>{const points=(polygon.getAttribute('points')??'').trim().split(/\s+/).map(pair=>pair.split(',').map(Number));const distance=(a:number[],b:number[])=>Math.hypot(a[0]-b[0],a[1]-b[1]);return[distance(points[0],points[1]),distance(points[1],points[2]),distance(points[2],points[0])].sort((a,b)=>a-b)}));
  for(const [index,expected] of [[0,[5,8,11]],[1,[4,6,6]],[2,[5,12,13]]] as const){const scale=sideRatios[index][0]/expected[0];for(let side=0;side<3;side+=1)expect(sideRatios[index][side]/expected[side]).toBeCloseTo(scale,1)}

  await jump(page,3,'l52-addition-check');const retry=page.locator('[data-stage-id="l52-addition-check"]');
  for(let attempt=0;attempt<2;attempt+=1){await retry.getByRole('button',{name:'Только переместительное свойство',exact:true}).click();await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');

  await jump(page,14,'l52-polygon-check');const polygon=page.locator('[data-stage-id="l52-polygon-check"]');
  await polygon.locator('.inline-answer input').fill('40');await polygon.locator('.check-button').click();await expect(polygon.locator('.instant-feedback.good')).toBeVisible();
  await polygon.locator('.inline-answer input').fill('41');await expect(polygon.locator('.instant-feedback')).toHaveCount(0);await expect(polygon.locator('.lesson-controls .primary')).toBeDisabled();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-52-progress-v1')??'null')?.results?.['l52-p7'])).toBe(false);
  await polygon.locator('.inline-answer input').fill('40');await polygon.locator('.check-button').click();await polygon.locator('.lesson-controls .primary').click();
  await page.getByRole('button',{name:/Все уроки/}).click();await page.getByRole('button',{name:/Открыть урок 52:/}).click();await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l52-triangle-model"]')).toBeVisible();const collapsed=page.locator('.cat-mentor-collapsed');await expect(collapsed).toBeVisible();await collapsed.click();await expect(page.locator('.cat-mentor-actions button')).toHaveCount(4);

  await jump(page,35,'l52-summary');await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l52-extra-01"]')).toBeVisible();await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});
