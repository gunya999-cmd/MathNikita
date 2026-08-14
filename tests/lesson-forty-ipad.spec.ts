import {expect,test,type Locator,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson40(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson40=page.getByRole('button',{name:/Открыть урок 40:/});
  const lesson41=page.locator('.course-lesson-grid > button').nth(40);
  await expect(lesson40).toBeVisible();await expect(lesson40).toBeEnabled();await expect(lesson41).toBeDisabled();
  await lesson40.click();await expect(page.locator('.lesson-opening')).toContainText('Транспортир без ошибок');await page.locator('.lesson-opening-start').click();
}

async function nextStage(page:Page,currentId:string,nextId:string){
  const stage=page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${currentId}"]`);await expect(stage).toBeVisible();await stage.locator('.lesson-controls button').last().click();await expect(page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${nextId}"]`)).toBeVisible();
}

async function setRange(range:Locator,value:string){await range.evaluate((node,next)=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;if(!setter)throw new Error('range value setter is unavailable');setter.call(node,String(next));node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}))},value)}

async function movingRayDirection(builder:Locator){return builder.locator('.angle-builder .angle-ray').nth(1).evaluate(node=>{const line=node as SVGLineElement;const matrix=line.getScreenCTM();if(!matrix)throw new Error('missing SVG screen matrix');const p1=new DOMPoint(Number(line.getAttribute('x1')),Number(line.getAttribute('y1'))).matrixTransform(matrix);const p2=new DOMPoint(Number(line.getAttribute('x2')),Number(line.getAttribute('y2'))).matrixTransform(matrix);return{x1:p1.x,x2:p2.x}})}

test('lesson 40 keeps protractor installation, persistence, angle builder and mandatory practice stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson40(page);
  await expect(page.locator('[data-stage-id="l40-mission"]')).toBeVisible();
  await expect(page.locator('.lesson-runtime:not([hidden]) .lesson-controls')).toContainText('Этап 1 из 36');
  await expect(page.locator('.lesson-runtime:not([hidden]) .angle-diagram svg')).toBeVisible();
  await nextStage(page,'l40-mission','l40-algorithm');
  await nextStage(page,'l40-algorithm','l40-practice1');
  const practice1=page.locator('[data-stage-id="l40-practice1"]');
  await practice1.getByRole('button',{name:'Совместить центр транспортира с вершиной угла',exact:true}).click();await practice1.locator('.check-button').click();await expect(practice1.locator('.instant-feedback.good')).toBeVisible();await practice1.locator('.lesson-controls button').last().click();
  await expect(page.locator('[data-stage-id="l40-center-error"]')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-40-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(3);expect(saved?.results?.['l40-p1']).toBe(true);
  await page.getByRole('button',{name:/Все уроки/}).click();await page.getByRole('button',{name:/Открыть урок 40:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l40-center-error"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:40,stageIndex:18}})));
  const builder=page.locator('[data-stage-id="l40-practice9"]');await expect(builder).toBeVisible();const range=builder.locator('input[type="range"]');await expect(range).toHaveValue('90');
  await setRange(range,'40');await expect(builder.locator('output')).toHaveText('40°');const acuteRay=await movingRayDirection(builder);expect(acuteRay.x2,'40° ray must point to the right of the vertex').toBeGreaterThan(acuteRay.x1);await builder.locator('.check-button').click();await expect(builder.locator('.instant-feedback.good')).toBeVisible();
  await expect(page.locator('.cat-mentor')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:40,stageIndex:35}})));
  await expect(page.locator('[data-stage-id="l40-summary"]')).toBeVisible();await expect(page.locator('.lesson-reflection')).toHaveCount(1);await expect(page.locator('.extended-practice')).toHaveCount(1);await expect(page.locator('.extended-practice[data-practice-task="l40-extra-01"]')).toBeVisible();
  const practice=page.locator('.extended-practice');await practice.getByRole('button',{name:'Центр транспортира совпадает с вершиной угла',exact:true}).click();await practice.locator('.extended-practice-check').click();await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();
  await expect(practice.locator('.practice-pythagoras')).toBeVisible();await expect(practice.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});