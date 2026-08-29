import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l51-source375-pieces':'4','l51-source375-assembly':'Совместить четыре прямых угла в одной точке','l51-source376-halves':'4 и 4','l51-source376-pieces':'4','l51-source376-assembly':'Четыре равные гипотенузы',
  'l51-source377-midpoint':'В середину верхней стороны','l51-source377-pieces':'Треугольник и четырёхугольник','l51-source378-segments':'3,2,3','l51-source378-rectangle':'9 см × 4 см','l51-workbook163-impossible':'Шестиугольник',
  'l51-workbook161-rule':'Отложить по перпендикуляру к оси такое же расстояние','l51-workbook161-count':'8','l51-workbook162-lake':'30','l51-workbook162-garden':'50','l51-workbook162-playground':'160','l51-workbook165-parts':'4',
  'l51-workbook166-vertices':'B(3;5) и D(5;1)','l51-source379-condition':'PS пересекает AB и MK; MK не пересекает AB','l51-source380-remain':'205','l51-source380-masses':'260,241,239','l51-source381-fastest':'Электропоезд — 74 мин','l51-source382-sums':'239 и 259','l51-source383-jug':'4 л'
};

async function openLesson51(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 51:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Разрезания, симметрия и итог § 15');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 51 completes all 36 source-grounded stages and reaches mandatory practice',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson51(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible();
    const id=await stage.getAttribute('data-stage-id');
    expect(id).toBeTruthy();visited.push(id!);
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
  expect(visited[0]).toBe('l51-mission');expect(visited[35]).toBe('l51-summary');
  expect(Object.keys(answers)).toHaveLength(23);
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l51-extra-01"]')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-51-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l51-p23']).toBe(true);
});
