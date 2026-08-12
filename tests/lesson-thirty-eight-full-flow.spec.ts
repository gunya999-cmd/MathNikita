import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

const answers:Record<string,{type:'choice'|'input';value:string}>={
  'l38-practice1':{type:'choice',value:'OB и OC'},
  'l38-practice2':{type:'choice',value:'Когда они совпадают при наложении'},
  'l38-practice3':{type:'choice',value:'Один рисунок повёрнут относительно другого'},
  'l38-practice4':{type:'choice',value:'Лучи OA и OB совпадают'},
  'l38-practice5':{type:'choice',value:'∠AOC и ∠BOC'},
  'l38-practice6':{type:'input',value:'6'},
  'l38-practice7':{type:'choice',value:'∠BOD'},
  'l38-practice8':{type:'choice',value:'∠AOB, ∠AOC, ∠AOD, ∠BOC, ∠BOD, ∠COD'},
  'l38-practice9':{type:'choice',value:'OB'},
  'l38-practice10':{type:'choice',value:'Ничего из перечисленного'},
  'l38-practice11':{type:'choice',value:'P принадлежит лучу OA'},
  'l38-practice12':{type:'choice',value:'∠AOB и ∠BOC'},
  'l38-error-check':{type:'choice',value:'∠AOB и ∠BOA — два разных угла'},
  'l38-quiz1':{type:'choice',value:'они совпадают при наложении'},
  'l38-quiz2':{type:'choice',value:'OA и OB — один луч'},
  'l38-quiz3':{type:'input',value:'6'},
  'l38-quiz4':{type:'choice',value:'OM'},
  'l38-quiz5':{type:'choice',value:'∠AOC и ∠BOC'},
  'l38-quiz6':{type:'choice',value:'∠BOA'},
  'l38-challenge1':{type:'input',value:'10'},
  'l38-challenge2':{type:'choice',value:'∠AOC, ∠AOD, ∠BOC, ∠BOD'},
};

async function open(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 38:/}).click();
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

test('lesson 38 traverses every one of 35 stages with real taps and no iPad overflow',async({page})=>{
  test.setTimeout(180_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await open(page);
  const seen:string[]=[];
  for(let index=0;index<35;index+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible();
    const id=await stage.getAttribute('data-stage-id');
    expect(id).toBeTruthy();
    seen.push(id!);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`horizontal overflow at ${id}`).toBeLessThanOrEqual(2);
    await solveCurrent(page,id!);
    if(index===34)break;
    const next=stage.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
  }
  expect(new Set(seen).size).toBe(35);
  expect(seen[0]).toBe('l38-mission');
  expect(seen.at(-1)).toBe('l38-summary');
  await expect(page.locator('[data-stage-id="l38-summary"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toBeVisible();
});
