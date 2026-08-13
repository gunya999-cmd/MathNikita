import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

const answers:Record<string,{type:'choice'|'input';value:string}>={
  'l39-practice1':{type:'choice',value:'Два противоположных луча с общим началом'},
  'l39-practice2':{type:'input',value:'180'},
  'l39-practice3':{type:'choice',value:'С вершиной угла'},
  'l39-practice4':{type:'choice',value:'Выбрать ту, где исходная сторона угла стоит на 0°'},
  'l39-practice5':{type:'input',value:'60'},
  'l39-practice6':{type:'choice',value:'60°'},
  'l39-practice7':{type:'input',value:'120'},
  'l39-practice8':{type:'choice',value:'105°'},
  'l39-practice9':{type:'input',value:'80'},
  'l39-practice10':{type:'choice',value:'Острый'},
  'l39-practice11':{type:'choice',value:'Прямой'},
  'l39-practice12':{type:'choice',value:'Тупой'},
  'l39-practice13':{type:'choice',value:'Развёрнутый'},
  'l39-quiz1':{type:'choice',value:'острый'},
  'l39-quiz2':{type:'choice',value:'тупой'},
  'l39-quiz3':{type:'input',value:'180'},
  'l39-quiz4':{type:'choice',value:'Вершина угла'},
  'l39-quiz5':{type:'choice',value:'120°'},
  'l39-quiz6':{type:'input',value:'80'},
  'l39-challenge1':{type:'choice',value:'Тупой'},
  'l39-challenge2':{type:'input',value:'75'},
};

async function open(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 39:/}).click();
  await page.locator('.lesson-opening-start').click();
}

async function solveCurrent(page:Page,stageId:string){
  const answer=answers[stageId];if(!answer)return;
  const stage=page.locator(`.lesson-runtime:not([hidden]) [data-stage-id="${stageId}"]`);
  if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();
  else await stage.locator('.inline-answer input').fill(answer.value);
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 39 traverses every one of 35 stages with real taps and no iPad overflow',async({page})=>{
  test.setTimeout(180_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await open(page);
  const seen:string[]=[];
  for(let index=0;index<35;index+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible();
    const id=await stage.getAttribute('data-stage-id');
    expect(id).toBeTruthy();seen.push(id!);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`horizontal overflow at ${id}`).toBeLessThanOrEqual(2);
    await solveCurrent(page,id!);
    if(index===34)break;
    const next=stage.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click();
  }
  expect(new Set(seen).size).toBe(35);
  expect(seen[0]).toBe('l39-mission');
  expect(seen.at(-1)).toBe('l39-summary');
  await expect(page.locator('[data-stage-id="l39-summary"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toBeVisible();
});
