import {expect,test,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';

const FROM=Math.max(1,Number(process.env.SOLVABILITY_FROM??1));
const TO=Math.min(175,Number(process.env.SOLVABILITY_TO??175));
const REPORT_DIR='test-results/student-solvability';

type StageSnapshot={
  lesson:number;
  stageIndex:number;
  stageId:string;
  stageText:string;
  taskText:string;
  activityVisible:boolean;
  answerControlCount:number;
  unlabeledInputCount:number;
  visualCount:number;
  preSubmitFeedbackCount:number;
  preSubmitAnswerLeak:boolean;
};

type Violation={code:string;lesson:number;stageIndex:number;stageId:string;detail:string};

const strongVisualDependencyPatterns=[
  /(?:по|на)\s+(?:рисунк(?:е|у)|чертеж(?:е|у)|схем(?:е|у)|диаграмм(?:е|у)|график(?:е|у)|изображени(?:ю|и)|картинк(?:е|у)|шкал(?:е|у))/i,
  /(?:по|на)\s+координатн(?:ом|ой)\s+луч(?:е|у)?/i,
  /рис\.?\s*№?\s*\d+/i,
  /рисунк(?:а|е|у)\s*№?\s*\d+/i,
  /показанн(?:ый|ая|ое|ые|ого|ой|ую)\s+(?:угол|фигур|отрез|луч|точк|шкал|диаграмм)/i,
  /(?:измерь|определи|найди|прочитай)\s+[^.]{0,80}(?:по рисунку|на рисунке|по шкале|на шкале|на координатном луче)/i,
];

function needsVisual(text:string){return strongVisualDependencyPatterns.some(pattern=>pattern.test(text));}

async function mockNarration(page:Page){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '}));
}

async function openLesson(page:Page,lesson:number){
  await mockNarration(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(value=>localStorage.setItem('mathnikita-selected-lesson',String(value)),lesson);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Перейти к уроку →'}).click();
  const start=page.locator('.lesson-opening-start');
  await expect(start).toBeVisible();
  await start.click();
  await expect(page.locator('.lesson-runtime')).toBeVisible();
}

async function readStageCount(page:Page){
  const texts=await page.locator('.lesson-controls span,.stage-counter span').allInnerTexts();
  let max=0;
  for(const text of texts){
    const match=text.match(/(?:этап\s*)?(\d+)\s+из\s+(\d+)/i);
    if(match)max=Math.max(max,Number(match[2]));
  }
  return max||1;
}

async function jumpToStage(page:Page,lesson:number,stageIndex:number){
  await page.evaluate(({lesson,stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:lesson,stageIndex}})),{lesson,stageIndex});
  await page.waitForFunction(({stageIndex})=>{
    const stage=document.querySelector('.lesson-runtime .interactive-stage') as HTMLElement|null;
    if(!stage)return false;
    const index=stage.getAttribute('data-stage-index');
    if(index!==null)return Number(index)===stageIndex;
    const texts=Array.from(document.querySelectorAll('.lesson-controls span,.stage-counter span')).map(node=>node.textContent??'');
    return texts.some(text=>new RegExp(`(?:этап\\s*)?${stageIndex+1}\\s+из\\s+\\d+`,'i').test(text));
  },{stageIndex},{timeout:5000}).catch(async()=>{await page.waitForTimeout(120)});
}

async function snapshotStage(page:Page,lesson:number,stageIndex:number):Promise<StageSnapshot>{
  const stage=page.locator('.lesson-runtime .interactive-stage').filter({visible:true}).first();
  await expect(stage).toBeVisible();
  return stage.evaluate((element,{lesson,stageIndex})=>{
    const root=element as HTMLElement;
    const visible=(node:Element)=>{
      const el=node as HTMLElement;
      const style=getComputedStyle(el);
      const rect=el.getBoundingClientRect();
      return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>0&&rect.width>8&&rect.height>8;
    };
    const activity=Array.from(root.querySelectorAll('.activity-area')).find(visible) as HTMLElement|undefined;
    const prompt=(activity?.querySelector('h3')?.textContent??'').trim();
    const stageCopy=root.querySelector('.stage-copy');
    const title=(stageCopy?.querySelector('h2')?.textContent??'').trim();
    const body=Array.from(stageCopy?.querySelectorAll('p')??[]).map(node=>node.textContent??'').join(' ').trim();
    const taskText=(prompt||`${title} ${body}`).replace(/\s+/g,' ').trim();
    const controls=activity?Array.from(activity.querySelectorAll('input,textarea,select,button,[role="radio"],[role="option"]')).filter(visible):[];
    const unlabeledInputs=activity?Array.from(activity.querySelectorAll('input,textarea,select')).filter(visible).filter(node=>{
      const input=node as HTMLInputElement;
      const label=input.closest('label');
      const labelText=(label?.textContent??'').trim();
      return !labelText&&!input.getAttribute('aria-label')&&!input.getAttribute('aria-labelledby')&&!input.getAttribute('placeholder');
    }):[];
    const visualSelector='svg,img,canvas,picture,[role="img"],[data-visual],[class*="visual"],[class*="diagram"],[class*="figure"],[class*="drawing"],[class*="protractor"],[class*="coordinate"],[class*="geometry"],[class*="plot"],[class*="ray"],[class*="scale"],[class*="shape"]';
    const visuals=Array.from(new Set(Array.from(root.querySelectorAll(visualSelector)))).filter(visible).filter(node=>!node.closest('.lesson-progress,.control-progress,.mini-bar,.year-bar'));
    const feedback=activity?Array.from(activity.querySelectorAll('.instant-feedback.good,.instant-feedback.bad,.control-explanation')).filter(visible):[];
    const activityText=(activity?.innerText??'').replace(/\s+/g,' ').trim();
    const answerLeak=Boolean(activity&&/(?:^|\s)Ответ\s*:\s*[^\s]+/iu.test(activityText));
    return {
      lesson,
      stageIndex,
      stageId:root.getAttribute('data-stage-id')??`stage-${stageIndex+1}`,
      stageText:(root.innerText??'').replace(/\s+/g,' ').trim(),
      taskText,
      activityVisible:Boolean(activity),
      answerControlCount:controls.length,
      unlabeledInputCount:unlabeledInputs.length,
      visualCount:visuals.length,
      preSubmitFeedbackCount:feedback.length,
      preSubmitAnswerLeak:answerLeak,
    };
  },{lesson,stageIndex});
}

function evaluateSnapshot(snapshot:StageSnapshot):Violation[]{
  const violations:Violation[]=[];
  const add=(code:string,detail:string)=>violations.push({code,lesson:snapshot.lesson,stageIndex:snapshot.stageIndex,stageId:snapshot.stageId,detail});
  if(snapshot.activityVisible&&snapshot.answerControlCount===0)add('NO_ANSWER_CONTROL','На экране есть activity-area, но нет доступного элемента для ответа ученика.');
  if(snapshot.unlabeledInputCount>0)add('UNLABELED_INPUT',`Найдено полей без подписи/aria-label/placeholder: ${snapshot.unlabeledInputCount}.`);
  if(snapshot.activityVisible&&needsVisual(snapshot.taskText)&&snapshot.visualCount===0)add('MISSING_REQUIRED_VISUAL',`Условие требует рисунок/шкалу/схему, но на этом же экране нет видимого визуального элемента. Условие: «${snapshot.taskText.slice(0,260)}»`);
  if(snapshot.activityVisible&&snapshot.preSubmitFeedbackCount>0)add('PRE_SUBMIT_FEEDBACK','До ответа ученика уже показан feedback/разбор.');
  if(snapshot.activityVisible&&snapshot.preSubmitAnswerLeak)add('PRE_SUBMIT_ANSWER_LEAK','В activity-area до ответа ученика виден текст вида «Ответ: …».');
  return violations;
}

mkdirSync(REPORT_DIR,{recursive:true});
test.describe.configure({mode:'serial'});

for(let lesson=FROM;lesson<=TO;lesson++){
  test(`student solvability · lesson ${lesson}`,async({page})=>{
    const pageErrors:string[]=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    await openLesson(page,lesson);
    const stageCount=await readStageCount(page);
    expect(stageCount,`Урок ${lesson}: не удалось определить количество этапов`).toBeGreaterThan(0);

    const snapshots:StageSnapshot[]=[];
    const violations:Violation[]=[];
    const stageIds=new Set<string>();

    for(let stageIndex=0;stageIndex<stageCount;stageIndex++){
      await jumpToStage(page,lesson,stageIndex);
      const snapshot=await snapshotStage(page,lesson,stageIndex);
      snapshots.push(snapshot);
      violations.push(...evaluateSnapshot(snapshot));
      if(stageIds.has(snapshot.stageId))violations.push({code:'DUPLICATE_OR_UNREACHABLE_STAGE',lesson,stageIndex,stageId:snapshot.stageId,detail:`Этап ${stageIndex+1} не дал нового stage-id; возможна недоступная страница или неработающий переход.`});
      stageIds.add(snapshot.stageId);
    }

    if(stageIds.size!==stageCount)violations.push({code:'STAGE_COVERAGE_MISMATCH',lesson,stageIndex:-1,stageId:'lesson',detail:`Заявлено ${stageCount} этапов, уникально просмотрено ${stageIds.size}.`});
    for(const message of pageErrors)violations.push({code:'RUNTIME_PAGE_ERROR',lesson,stageIndex:-1,stageId:'lesson',detail:message});

    const report={lesson,stageCount,uniqueStages:stageIds.size,activities:snapshots.filter(item=>item.activityVisible).length,visualDependentActivities:snapshots.filter(item=>item.activityVisible&&needsVisual(item.taskText)).length,violations,snapshots};
    writeFileSync(`${REPORT_DIR}/lesson-${String(lesson).padStart(3,'0')}.json`,JSON.stringify(report,null,2));

    expect(violations,`Student Solvability Audit обнаружил проблемы в уроке ${lesson}:\n${violations.map(v=>`[${v.code}] этап ${v.stageIndex+1} ${v.stageId}: ${v.detail}`).join('\n')}`).toEqual([]);
  });
}
