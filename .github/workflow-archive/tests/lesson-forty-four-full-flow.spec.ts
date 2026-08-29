import {expect,test,type Page} from '@playwright/test';

type Answer={type:'choice'|'input';value:string};
const answers:Record<string,Answer>={
  'l44-practice1':{type:'choice',value:'Замкнутая ломаная без самопересечений'},
  'l44-practice2':{type:'choice',value:'Нет, потому что стороны пересекаются'},
  'l44-practice3':{type:'input',value:'5'},'l44-practice4':{type:'input',value:'6'},'l44-practice5':{type:'choice',value:'BC'},
  'l44-practice6':{type:'choice',value:'ABCD'},'l44-practice7':{type:'choice',value:'DCBA'},
  'l44-practice8':{type:'input',value:'22'},'l44-practice9':{type:'input',value:'7'},'l44-practice10':{type:'input',value:'25'},
  'l44-practice11':{type:'choice',value:'Равны'},'l44-practice12':{type:'choice',value:'Не обязательно равны'},'l44-practice13':{type:'choice',value:'Не обязательно равны'},
  'l44-textbook321':{type:'choice',value:'Только левая'},'l44-textbook322':{type:'input',value:'5'},'l44-textbook323':{type:'choice',value:'ABCDE'},
  'l44-textbook325a':{type:'input',value:'26'},'l44-textbook325b':{type:'choice',value:'Фигуры равны'},
  'l44-error-analysis':{type:'choice',value:'Перепутал замкнутую ломаную с границей многоугольника'},
  'l44-world-model':{type:'choice',value:'Контур треугольного дорожного знака'},'l44-challenge1':{type:'input',value:'9'},
  'l44-quiz1':{type:'choice',value:'Она замкнута и не самопересекается'},'l44-quiz2':{type:'input',value:'30'},
};
async function open(page:Page){await page.goto('/');const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 44:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Многоугольники: граница');await page.locator('.lesson-opening-start').click()}
async function solveCurrent(page:Page,id:string){const answer=answers[id];if(!answer)return;const stage=page.locator(`.lesson-runtime:not([hidden]) [data-stage-id="${id}"]`);if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer.value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 44 traverses all 36 polygon stages and reaches mandatory practice',async({page})=>{test.setTimeout(210_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await open(page);const seen:string[]=[];for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();seen.push(id!);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`horizontal overflow at ${id}`).toBeLessThanOrEqual(2);await solveCurrent(page,id!);if(index===35)break;const next=stage.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click()}expect(new Set(seen).size).toBe(36);expect(seen[0]).toBe('l44-mission');expect(seen.at(-1)).toBe('l44-summary');await expect(page.locator('[data-stage-id="l44-summary"]')).toBeVisible();await expect(page.locator('.extended-practice')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l44-extra-01"]')).toBeVisible()});
