import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

type Answer={type:'choice';value:string}|{type:'input';value:string};
const answers:Record<string,Answer>={
  'l28-round':{type:'input',value:'6500'},
  'l28-practice1':{type:'input',value:'1000'},
  'l28-practice2':{type:'input',value:'4000'},
  'l28-practice3':{type:'choice',value:'700 110'},
  'l28-practice4':{type:'choice',value:'Ответ подозрителен: ожидаем около 40 000'},
  'l28-practice5':{type:'input',value:'8073'},
  'l28-practice6':{type:'choice',value:'От 40 000 до 41 000'},
  'l28-mistake':{type:'choice',value:'801'},
  'l28-quiz1':{type:'input',value:'500'},
  'l28-quiz2':{type:'input',value:'3000'},
  'l28-quiz3':{type:'choice',value:'100'},
  'l28-quiz4':{type:'choice',value:'Неверно: ожидаем около 20 000'},
  'l28-quiz5':{type:'input',value:'4218'},
  'l28-challenge':{type:'choice',value:'Больше 8 000'},
};

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else await stage.getByRole('button',{name:answer.value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

function boxesIntersect(a:{x:number;y:number;width:number;height:number},b:{x:number;y:number;width:number;height:number}){
  return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
}

test('collapsed Pythagoras never intercepts lesson 28 forward navigation on iPad',async({page})=>{
  test.setTimeout(180_000);
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson28=page.getByRole('button',{name:/Открыть урок 28:/});
  await expect(lesson28).toBeEnabled();
  await lesson28.click();

  const panel=page.locator('.cat-mentor-panel');
  const collapsed=page.locator('.cat-mentor-collapsed');
  if(await panel.isVisible())await panel.getByRole('button',{name:'Свернуть наставника'}).click();
  await expect(collapsed).toBeVisible();
  await page.locator('.lesson-opening-start').click();

  const visited=new Set<string>();
  for(let step=0;step<23;step+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
    const stageId=await stage.getAttribute('data-stage-id');
    expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();
    visited.add(stageId!);

    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`Horizontal overflow at ${stageId}`).toBeLessThanOrEqual(2);

    if(await stage.locator('.activity-area').count()){
      const answer=answers[stageId!];
      expect(answer,`Missing answer fixture for ${stageId}`).toBeTruthy();
      await answerStage(page,answer);
    }
    if(stageId==='l28-summary')break;

    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.evaluate(element=>element.scrollIntoView({block:'end',inline:'nearest'}));
    const mentorBox=await collapsed.boundingBox();
    const nextBox=await next.boundingBox();
    expect(mentorBox,`Collapsed mentor must remain measurable at ${stageId}`).toBeTruthy();
    expect(nextBox,`Forward button must remain measurable at ${stageId}`).toBeTruthy();
    expect(boxesIntersect(mentorBox!,nextBox!),`Pythagoras overlaps the forward button at ${stageId}`).toBeFalsy();

    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }

  await expect(page.locator('[data-stage-id="l28-summary"]')).toBeVisible();
  expect(visited.size).toBe(23);
});
