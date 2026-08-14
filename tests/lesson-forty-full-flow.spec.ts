import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

type Answer={type:'choice'|'input'|'angle';value:string};
const answers:Record<string,Answer>={
  'l40-practice1':{type:'choice',value:'Совместить центр транспортира с вершиной угла'},
  'l40-practice2':{type:'choice',value:'Нет, сначала нужно совместить центр с вершиной'},
  'l40-practice3':{type:'choice',value:'Нет'},
  'l40-practice4':{type:'choice',value:'42°'},
  'l40-practice5':{type:'input',value:'35'},
  'l40-practice6':{type:'input',value:'145'},
  'l40-practice7':{type:'choice',value:'68°'},
  'l40-practice8':{type:'choice',value:'Он прочитал противоположную шкалу вместо 128°'},
  'l40-practice9':{type:'angle',value:'40'},
  'l40-practice10':{type:'angle',value:'118'},
  'l40-practice11':{type:'choice',value:'Повторно измерить его транспортиром'},
  'l40-practice12':{type:'choice',value:'Перейти на другую шкалу, где исходный луч стоит на 0°'},
  'l40-practice13':{type:'choice',value:'Тупой'},
  'l40-quiz1':{type:'choice',value:'в вершине угла'},
  'l40-quiz2':{type:'input',value:'153'},
  'l40-quiz3':{type:'choice',value:'Совместить первый луч с 0° нужной шкалы'},
  'l40-quiz4':{type:'choice',value:'Проверить, не нужна ли встречная шкала 44°'},
  'l40-quiz5':{type:'choice',value:'Тупой'},
  'l40-challenge1':{type:'input',value:'180'},
  'l40-challenge2':{type:'choice',value:'Разделить прямой угол на две равные части'},
};

async function open(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 40:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Транспортир без ошибок');
  await page.locator('.lesson-opening-start').click();
}

async function solveCurrent(page:Page,stageId:string){
  const answer=answers[stageId];if(!answer)return;
  const stage=page.locator(`.lesson-runtime:not([hidden]) [data-stage-id="${stageId}"]`);
  if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();
  else if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else await stage.locator('input[type="range"]').evaluate((node,value)=>{const input=node as HTMLInputElement;input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))},answer.value);
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 40 traverses all 36 stages, including real angle construction, and reaches mandatory practice',async({page})=>{
  test.setTimeout(210_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await open(page);
  const seen:string[]=[];
  for(let index=0;index<36;index+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible();
    const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();seen.push(id!);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`horizontal overflow at ${id}`).toBeLessThanOrEqual(2);
    await solveCurrent(page,id!);
    if(index===35)break;
    const next=stage.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click();
  }
  expect(new Set(seen).size).toBe(36);
  expect(seen[0]).toBe('l40-mission');expect(seen.at(-1)).toBe('l40-summary');
  await expect(page.locator('[data-stage-id="l40-summary"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l40-extra-01"]')).toBeVisible();
});