import {expect,test,type Page} from '@playwright/test';

type Answer={type:'choice'|'input';value:string};
const answers:Record<string,Answer>={
  'l45-practice1':{type:'choice',value:'Контур замкнут и несоседние стороны не пересекаются'},
  'l45-practice2':{type:'choice',value:'AC'},
  'l45-practice3':{type:'input',value:'2'},'l45-practice4':{type:'input',value:'3'},'l45-practice5':{type:'input',value:'5'},
  'l45-practice6':{type:'choice',value:'Каждую диагональ посчитали от двух её концов'},
  'l45-practice7':{type:'input',value:'5'},'l45-practice8':{type:'input',value:'9'},'l45-practice9':{type:'input',value:'14'},'l45-practice10':{type:'input',value:'20'},
  'l45-practice11':{type:'input',value:'9'},'l45-practice12':{type:'input',value:'12'},'l45-practice13':{type:'input',value:'54'},'l45-practice14':{type:'input',value:'12'},
  'l45-practice15':{type:'choice',value:'Фигуры равны'},'l45-practice16':{type:'choice',value:'Нет'},
  'l45-error-analysis':{type:'choice',value:'Соединять вершины последовательно по границе'},
  'l45-practice17':{type:'input',value:'28'},'l45-challenge1':{type:'input',value:'54'},
  'l45-quiz1':{type:'input',value:'35'},'l45-quiz2':{type:'input',value:'11'},'l45-quiz3':{type:'choice',value:'Нет, только длины сторон границы'},
  'l45-final-challenge':{type:'input',value:'28'},
};
async function open(page:Page){await page.goto('/');const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 45:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Многоугольники: строим');await page.locator('.lesson-opening-start').click()}
async function solveCurrent(page:Page,id:string){const stage=page.locator(`.lesson-runtime:not([hidden]) [data-stage-id="${id}"]`);if(id==='l45-builder'){for(const vertex of ['B','C','D','E'])await stage.getByRole('button',{name:`Вершина ${vertex}`,exact:true}).click();await expect(stage.locator('.polygon-builder')).toHaveAttribute('data-builder-valid','true');return}const answer=answers[id];if(!answer)return;if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer.value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 45 traverses all 36 construction and diagonal stages and reaches mandatory practice',async({page})=>{test.setTimeout(230_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await open(page);const seen:string[]=[];for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();seen.push(id!);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`horizontal overflow at ${id}`).toBeLessThanOrEqual(2);await solveCurrent(page,id!);if(index===35)break;const next=stage.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click()}expect(new Set(seen).size).toBe(36);expect(seen[0]).toBe('l45-mission');expect(seen.at(-1)).toBe('l45-summary');await expect(page.locator('[data-stage-id="l45-summary"]')).toBeVisible();await expect(page.locator('.extended-practice')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l45-extra-01"]')).toBeVisible()});
