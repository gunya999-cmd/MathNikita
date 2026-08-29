import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l55-swap-fact':'7·8',
  'l55-neighbor-plus':'56',
  'l55-neighbor-minus':'54',
  'l55-fact-link':'7·8=7·7+7',
  'l55-table-check':'72',
  'l55-times-ten':'2140',
  'l55-hundred-first':'32800',
  'l55-place-check':'Каждая цифра переходит на два разряда влево',
  'l55-round-first':'11200',
  'l55-zero-lab-check':'92000',
  'l55-round-second':'139200',
  'l55-round-third':'810000',
  'l55-zero-error':'После 46·18 дописать три нуля',
  'l55-estimate-check':'От 100 000 до 200 000',
  'l55-first-partial':'1032',
  'l55-column-total':'16512',
  'l55-alignment-check':'Оно соответствует умножению на 30',
  'l55-ex387':'50000',
  'l55-parentheses':'1216',
  'l55-ex389':'1418',
  'l55-mastery-gate':'758700'
};

async function openLesson55(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 55:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Умножение без потерянных нулей');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 55 completes all 36 stages and the full multiplication-practice route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson55(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible();
    const id=await stage.getAttribute('data-stage-id');
    expect(id).toBeTruthy();visited.push(id!);
    await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');
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
  expect(visited[0]).toBe('l55-mission');expect(visited[35]).toBe('l55-summary');
  expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.multiplication-practice-player')).toHaveAttribute('data-source-exercise-range','385-392');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l55-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-55-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l55-p21']).toBe(true);
});
