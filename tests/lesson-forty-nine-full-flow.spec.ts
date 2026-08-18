import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l49-quad-recall':'Четырёхугольник','l49-right-angle-gate':'Все четыре угла прямые','l49-side-vocabulary':'AB и BC — соседние; AB и CD — противолежащие','l49-opposite-pair-gate':'CD','l49-name-order':'Обходить вершины по порядку вокруг границы','l49-square-gate':'Прямоугольник, у которого все стороны равны','l49-shape-hierarchy':'Каждый квадрат — прямоугольник',
  'l49-source359-sides':'2','l49-source359-perimeter':'12','l49-source359-square-perimeter':'12','l49-source360-units':'2 см 5 мм и 3 см 5 мм','l49-source360-perimeter':'120','l49-source361-rectangle':'130','l49-source361-square':'32','l49-source362':'60',
  'l49-fold-gate':'После складывания половины полностью совпадают','l49-diagonal-gate':'Нет, диагонали не совмещают прямоугольник с самим собой','l49-square-axis-gate':'4','l49-source363-letters':'А, В, Е, Т','l49-source364-polygons':'2,1,6','l49-axis-count-gate':'Прямоугольник — 2, квадрат — 4','l49-error-check':'Сначала проверить четыре прямых угла','l49-control-gate':'46'
};

async function openLesson49(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 49:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Прямоугольник и ось симметрии');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 49 completes all 36 rectangle and symmetry stages and reaches mandatory practice',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson49(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible();
    const id=await stage.getAttribute('data-stage-id');
    expect(id).toBeTruthy();
    visited.push(id!);
    await expect(stage.locator('.lesson-controls')).toContainText(`Этап ${index+1} из 36`);
    const answer=answers[id!];
    if(answer){
      if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();
      else await stage.locator('.inline-answer input').fill(answer);
      await stage.locator('.check-button').click();
      await expect(stage.locator('.instant-feedback.good')).toBeVisible();
    }
    if(index<35)await stage.locator('.lesson-controls .primary').click();
  }
  expect(new Set(visited).size).toBe(36);
  expect(visited[0]).toBe('l49-mission');
  expect(visited[35]).toBe('l49-summary');
  expect(Object.keys(answers)).toHaveLength(23);
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l49-extra-01"]')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-49-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);
  expect(saved?.results?.['l49-p23']).toBe(true);
});
