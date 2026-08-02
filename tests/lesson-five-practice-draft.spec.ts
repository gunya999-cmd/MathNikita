import { expect,test } from '@playwright/test';

const mainProgress={
  version:1,stageIndex:23,responses:{},orders:{},checked:{},
  results:{'l5-p1':true,'l5-p2':true,'l5-p3':true,'l5-p4':true,'l5-p5':true,'l5-p6':true,'l5-q1':true,'l5-q2':true,'l5-q3':true,'l5-q4':true,'l5-q5':true},
  completedAt:new Date().toISOString(),
};

async function openLessonFive(page:import('@playwright/test').Page){
  await page.getByRole('button',{name:/Открыть урок 5:/}).click();
  await page.locator('.lesson-opening-start').click();
}

test('lesson 5 restores an unfinished multi-field practice task after reload',async({page})=>{
  await page.goto('/');
  await page.evaluate(progress=>{
    localStorage.setItem('mathnikita-selected-lesson','5');
    localStorage.setItem('mathnikita-lesson-5-progress-v1',JSON.stringify(progress));
    localStorage.setItem('mathnikita:extended-practice:5:v2','10');
    localStorage.removeItem('mathnikita:extended-practice:5:v2:draft');
  },mainProgress);
  await page.reload();
  await openLessonFive(page);

  let task=page.locator('[data-practice-task="l5-master-1"]');
  await expect(task).toBeVisible();
  await task.getByLabel('Сколько классов в записи?').fill('3');
  await task.getByLabel('Цифра сотен тысяч').fill('3');

  await expect.poll(async()=>page.evaluate(()=>localStorage.getItem('mathnikita:extended-practice:5:v2:draft'))).not.toBeNull();
  await page.reload();
  await openLessonFive(page);

  task=page.locator('[data-practice-task="l5-master-1"]');
  await expect(task.getByLabel('Сколько классов в записи?')).toHaveValue('3');
  await expect(task.getByLabel('Цифра сотен тысяч')).toHaveValue('3');
  await expect(task.getByLabel('Какое значение имеет цифра 5?')).toHaveValue('');
  await expect(task.getByLabel('Сколько полных тысяч?')).toHaveValue('');
});
