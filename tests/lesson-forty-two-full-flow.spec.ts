import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

type Answer={type:'choice'|'input';value:string};
const answers:Record<string,Answer>={
  'l42-practice1':{type:'input',value:'46'},
  'l42-practice2':{type:'input',value:'35'},
  'l42-practice3':{type:'input',value:'112'},
  'l42-practice4':{type:'input',value:'96'},
  'l42-practice5':{type:'choice',value:'Нет: например, 100° меньше тупого угла 120°, но 100° тоже тупой'},
  'l42-practice6':{type:'choice',value:'Нет: 60° меньше 180°, но он острый'},
  'l42-practice7':{type:'choice',value:'Да: половина числа между 90° и 180° лежит между 45° и 90°'},
  'l42-practice8':{type:'choice',value:'Нет: 20° + 30° = 50°'},
  'l42-practice9':{type:'choice',value:'Нет: развёрнутый угол 180° больше 90°, но не тупой'},
  'l42-practice10':{type:'input',value:'90'},
  'l42-practice11':{type:'input',value:'180'},
  'l42-practice12':{type:'input',value:'120'},
  'l42-practice13':{type:'input',value:'30'},
  'l42-practice14':{type:'input',value:'150'},
  'l42-practice15':{type:'choice',value:'α + β − 90°'},
  'l42-practice16':{type:'input',value:'67'},
  'l42-practice17':{type:'input',value:'38'},
  'l42-practice18':{type:'input',value:'137'},
  'l42-quiz1':{type:'input',value:'46'},
  'l42-quiz2':{type:'choice',value:'Острый: 75°'},
  'l42-challenge1':{type:'input',value:'64'},
  'l42-challenge2':{type:'choice',value:'20° + 30° = 50°'},
};

async function open(page:Page){await page.goto('/');const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 42:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Геометрические задачи на градусную меру');await page.locator('.lesson-opening-start').click()}
async function solveCurrent(page:Page,stageId:string){const answer=answers[stageId];if(!answer)return;const stage=page.locator(`.lesson-runtime:not([hidden]) [data-stage-id="${stageId}"]`);if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer.value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 42 traverses all 36 stages, solves overlapping-angle problems and reaches mandatory practice',async({page})=>{test.setTimeout(210_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await open(page);const seen:string[]=[];for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();seen.push(id!);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`horizontal overflow at ${id}`).toBeLessThanOrEqual(2);await solveCurrent(page,id!);if(index===35)break;const next=stage.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click()}expect(new Set(seen).size).toBe(36);expect(seen[0]).toBe('l42-mission');expect(seen.at(-1)).toBe('l42-summary');await expect(page.locator('[data-stage-id="l42-summary"]')).toBeVisible();await expect(page.locator('.extended-practice')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l42-extra-01"]')).toBeVisible()});
