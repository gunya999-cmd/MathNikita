import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

type Answer={type:'choice'|'input'|'angle';value:string};
const answers:Record<string,Answer>={
  'l41-practice1':{type:'input',value:'54'},
  'l41-practice2':{type:'input',value:'72'},
  'l41-practice3':{type:'input',value:'53'},
  'l41-practice4':{type:'input',value:'52'},
  'l41-practice5':{type:'input',value:'50'},
  'l41-practice6':{type:'choice',value:'∠AOB = ∠AOC + ∠COB'},
  'l41-practice7':{type:'angle',value:'152'},
  'l41-practice8':{type:'input',value:'54'},
  'l41-practice9':{type:'input',value:'67'},
  'l41-practice10':{type:'choice',value:'90°'},
  'l41-practice11':{type:'choice',value:'Ученик сложил 152° и 98° вместо вычитания'},
  'l41-practice12':{type:'input',value:'71'},
  'l41-practice13':{type:'choice',value:'Да: 18° + 27° + 45° = 90°'},
  'l41-quiz1':{type:'input',value:'75'},
  'l41-quiz2':{type:'input',value:'66'},
  'l41-quiz3':{type:'choice',value:'34° + 72° = 106°'},
  'l41-quiz4':{type:'input',value:'70'},
  'l41-quiz5':{type:'choice',value:'180°'},
  'l41-challenge1':{type:'input',value:'67'},
  'l41-challenge2':{type:'choice',value:'Да: 52° + 38° = 90°'},
};

async function open(page:Page){await page.goto('/');const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 41:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Составные углы');await page.locator('.lesson-opening-start').click()}
async function solveCurrent(page:Page,stageId:string){const answer=answers[stageId];if(!answer)return;const stage=page.locator(`.lesson-runtime:not([hidden]) [data-stage-id="${stageId}"]`);if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();else if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);else await stage.locator('input[type="range"]').evaluate((node,value)=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;if(!setter)throw new Error('range value setter is unavailable');setter.call(node,String(value));node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}))},answer.value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 41 traverses all 36 stages, solves composite angles and reaches mandatory practice',async({page})=>{test.setTimeout(210_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await open(page);const seen:string[]=[];for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();seen.push(id!);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`horizontal overflow at ${id}`).toBeLessThanOrEqual(2);await solveCurrent(page,id!);if(index===35)break;const next=stage.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click()}expect(new Set(seen).size).toBe(36);expect(seen[0]).toBe('l41-mission');expect(seen.at(-1)).toBe('l41-summary');await expect(page.locator('[data-stage-id="l41-summary"]')).toBeVisible();await expect(page.locator('.extended-practice')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l41-extra-01"]')).toBeVisible()});