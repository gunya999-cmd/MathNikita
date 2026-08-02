import { expect,test,type Page } from '@playwright/test';
import { extendedPracticeByLesson } from '../src/data/extendedPracticeData';
import { extendedPracticeSetResponseCount } from '../src/data/extendedPracticeTypes';

async function clickCss(page:Page,selector:string){const clicked=await page.evaluate(selector=>{const element=document.querySelector<HTMLElement>(selector);if(!element)return false;element.click();return true},selector);expect(clicked,`Expected ${selector} to be clickable`).toBe(true)}
async function openLessonSix(page:Page){const opened=await page.evaluate(()=>{const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('.course-lesson-grid > button.is-interactive'));const button=buttons[5];if(!button)return false;button.click();return true});expect(opened).toBe(true);await expect(page.getByRole('heading',{name:'Отрезок. Длина отрезка'}).first()).toBeVisible();await clickCss(page,'.lesson-opening-start')}

const mainResults={
  'l6-a1':true,'l6-a2':true,'l6-a3':true,'l6-a4':true,'l6-a5':true,
  'l6-p1':true,'l6-p2':true,'l6-p3':true,'l6-p4':true,'l6-p5':true,'l6-p6':true,
  'l6-q1':true,'l6-q2':true,'l6-q3':true,'l6-q4':true,'l6-q5':true,'l6-star':true,
};

test('lesson 6 mandatory practice is source-aligned and has the required workload',async()=>{
  const practice=extendedPracticeByLesson[6];
  expect(practice.tasks).toHaveLength(18);
  expect(extendedPracticeSetResponseCount(practice)).toBe(48);
  expect(practice.tasks.map(task=>task.id)).toEqual([
    'l6-p1','l6-p2','l6-p3','l6-p4','l6-p5','l6-p6','l6-p7','l6-p8',
    'l6-mastery-1','l6-mastery-2','l6-mastery-3','l6-mastery-4','l6-mastery-5','l6-mastery-6','l6-mastery-7','l6-mastery-8','l6-mastery-9','l6-mastery-10',
  ]);
  const text=practice.tasks.map(task=>`${task.prompt} ${task.explanation}`).join(' ');
  expect(text).toContain('8 см 9 мм');
  expect(text).toContain('4 точки');
  expect(text).toContain('расстояние');
  expect(text).toContain('совпадают при наложении');
  expect(text).not.toContain('28 см');
  expect(text).not.toContain('упражнение 65');
  const task49=practice.tasks.find(task=>task.id==='l6-mastery-5');
  expect(task49?.type).toBe('multi-input');
  if(task49?.type==='multi-input')expect(task49.fields.map(item=>item.answers[0])).toEqual(['89','34','55','5см5мм']);
});

test('lesson 6 is complete only after mandatory practice and reflection',async({page})=>{
  await page.goto('/');
  await page.evaluate(results=>{
    localStorage.setItem('mathnikita-selected-lesson','6');
    localStorage.setItem('mathnikita-lesson-6-progress-v2',JSON.stringify({version:2,stageIndex:23,responses:{},orders:{},checked:{},results}));
    localStorage.setItem('mathnikita:extended-practice:6:v2','17');
    localStorage.removeItem('mathnikita:reflection:6');
    localStorage.removeItem('mathnikita:lesson-complete:6');
  },mainResults);
  await page.reload();
  await openLessonSix(page);
  await expect(page.locator('.lesson-opening-plan > div strong')).toHaveText('измеряется');

  const summary=page.locator('[data-stage-id="l6-summary"] .summary-card');
  await expect(summary).toContainText('Основная часть ✓');
  await expect(summary).not.toContainText('Завершён');
  await expect(page.locator('[data-lesson-completion-gate="6"]')).toContainText('Урок ещё не завершён');
  await expect(page.locator('[data-practice-task="l6-mastery-10"]')).toBeVisible();
  await expect(page.locator('.extended-practice-header')).toContainText('18 заданий · 48 проверяемых ответов');
  await expect(page.locator('.reflection-final-step')).toBeHidden();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'))).toBeNull();

  const task=page.locator('[data-practice-task="l6-mastery-10"]');
  await task.getByLabel('CB в миллиметрах').fill('45');
  await task.getByLabel('AB в миллиметрах').fill('71');
  await task.getByLabel('AB в сантиметрах и миллиметрах').fill('7 см 1 мм');
  await task.getByLabel('Расстояние между A и B в миллиметрах').fill('71');
  await clickCss(page,'[data-practice-task="l6-mastery-10"] .extended-practice-check');
  await expect(task.locator('.extended-practice-feedback.is-correct')).toBeVisible();
  await clickCss(page,'[data-practice-task="l6-mastery-10"] .extended-practice-next');

  const finished=page.locator('.extended-practice.is-finished');
  await expect(finished).toContainText('18 заданий');
  await expect(finished).toContainText('48 проверяемых ответов');
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Отрезок однозначно задаётся двумя концами, а его длина — это расстояние между этими точками. Если C лежит между A и B, то AB = AC + CB; измерять и строить отрезки нужно в указанной единице длины.');
  await clickCss(page,'.reflection-save');
  await expect(finalStep).toContainText('Урок завершён ✓');
  const completion=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:lesson-complete:6')??'null') as {completedAt?:string;activeSeconds?:number}|null);
  expect(completion?.completedAt).toBeTruthy();
  expect(typeof completion?.activeSeconds).toBe('number');
});
