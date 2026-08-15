import {expect,test,type Page} from '@playwright/test';

type Answer={type:'choice'|'input';value:string};
const answers:Record<string,Answer>={
  'l43-practice1':{type:'choice',value:'Острый'},'l43-practice2':{type:'choice',value:'Прямой'},'l43-practice3':{type:'choice',value:'Тупой'},
  'l43-practice4':{type:'input',value:'137'},'l43-practice5':{type:'choice',value:'Тупой'},'l43-practice6':{type:'choice',value:'Тупым'},
  'l43-practice7':{type:'input',value:'63'},'l43-practice8':{type:'input',value:'65'},'l43-practice9':{type:'input',value:'43'},'l43-practice10':{type:'input',value:'113'},
  'l43-practice11':{type:'input',value:'84'},'l43-practice12':{type:'choice',value:'360°'},'l43-practice13':{type:'choice',value:'180°'},
  'l43-practice14':{type:'choice',value:'Выбрана противоположная шкала; правильный ответ 142°'},
  'l43-challenge1':{type:'input',value:'372'},'l43-challenge2':{type:'input',value:'30'},
  'l43-quiz1':{type:'choice',value:'Тупой'},'l43-quiz2':{type:'input',value:'42'},'l43-quiz3':{type:'input',value:'56'},'l43-quiz4':{type:'input',value:'102'},
  'l43-quiz5':{type:'choice',value:'Потому что 31 · 12 = 372 > 360'},
};
async function open(page:Page){await page.goto('/');const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 43:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Мастерство углов');await page.locator('.lesson-opening-start').click()}
async function solveCurrent(page:Page,id:string){const answer=answers[id];if(!answer)return;const stage=page.locator(`.lesson-runtime:not([hidden]) [data-stage-id="${id}"]`);if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer.value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 43 traverses all 36 mastery stages and reaches mandatory practice',async({page})=>{test.setTimeout(210_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await open(page);const seen:string[]=[];for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();seen.push(id!);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`horizontal overflow at ${id}`).toBeLessThanOrEqual(2);await solveCurrent(page,id!);if(index===35)break;const next=stage.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click()}expect(new Set(seen).size).toBe(36);expect(seen[0]).toBe('l43-mission');expect(seen.at(-1)).toBe('l43-summary');await expect(page.locator('[data-stage-id="l43-summary"]')).toBeVisible();await expect(page.locator('.extended-practice')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l43-extra-01"]')).toBeVisible()});
