import { expect,test } from '@playwright/test';

const finishedMain={
  version:1,stageIndex:23,responses:{},orders:{},checked:{},
  results:{'l5-p1':true,'l5-p2':true,'l5-p3':true,'l5-p4':true,'l5-p5':true,'l5-p6':true,'l5-q1':true,'l5-q2':true,'l5-q3':true,'l5-q4':true,'l5-q5':true},
  completedAt:new Date().toISOString(),
};

async function openLessonFive(page:import('@playwright/test').Page){
  await page.getByRole('button',{name:/Открыть урок 5:/}).click();
  await page.locator('.lesson-opening-start').click();
}

test('restarting finished mandatory practice relocks the final reflection',async({page})=>{
  await page.goto('/');
  await page.evaluate(progress=>{
    localStorage.setItem('mathnikita-selected-lesson','5');
    localStorage.setItem('mathnikita-lesson-5-progress-v1',JSON.stringify(progress));
    localStorage.setItem('mathnikita:extended-practice:5:v2','20');
    localStorage.removeItem('mathnikita:lesson-complete:5');
  },finishedMain);
  await page.reload();
  await openLessonFive(page);

  await expect(page.locator('.extended-practice.is-finished')).toBeVisible();
  await expect(page.locator('.reflection-final-step')).toBeVisible();
  await page.getByRole('button',{name:'Пройти ещё раз'}).click();
  await expect(page.locator('[data-practice-task="l5-p1"]')).toBeVisible();
  await expect(page.locator('.reflection-final-step')).toBeHidden();
});

test('lesson 5 Start over clears mastery, reflection and true completion state',async({page})=>{
  await page.goto('/');
  await page.evaluate(progress=>{
    localStorage.setItem('mathnikita-selected-lesson','5');
    localStorage.setItem('mathnikita-lesson-5-progress-v1',JSON.stringify(progress));
    localStorage.setItem('mathnikita:extended-practice:5:v2','20');
    localStorage.setItem('mathnikita:extended-practice:5:v2:draft',JSON.stringify({taskId:'x',response:'x',multiResponse:{}}));
    localStorage.setItem('mathnikita:reflection:5','Готовый ответ');
    localStorage.setItem('mathnikita:lesson-complete:5',JSON.stringify({completedAt:new Date().toISOString(),activeSeconds:999}));
  },finishedMain);
  await page.reload();
  await openLessonFive(page);

  await page.locator('.stage-counter').getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l5-story"]')).toBeVisible();
  const state=await page.evaluate(()=>({
    practice:localStorage.getItem('mathnikita:extended-practice:5:v2'),
    draft:localStorage.getItem('mathnikita:extended-practice:5:v2:draft'),
    reflection:localStorage.getItem('mathnikita:reflection:5'),
    completion:localStorage.getItem('mathnikita:lesson-complete:5'),
  }));
  expect(state).toEqual({practice:null,draft:null,reflection:null,completion:null});
});
