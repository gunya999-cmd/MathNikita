import { expect,test,type Page } from '@playwright/test';

async function mockNarration(page:Page){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '}));
}

async function openLessonFifteen(page:Page){
  await mockNarration(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 15:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l15-mission"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:15,stageIndex}})),{stageIndex});
  await expect(page.locator(`[data-stage-id="${stageId}"]`)).toBeVisible();
}

async function expectReadingRay(page:Page,stageId:string,labels:string[]){
  const stage=page.locator(`[data-stage-id="${stageId}"]`);
  await expect(stage.getByTestId('l15-coordinate-reading-ray')).toBeVisible();
  await expect(stage.locator('[data-point-label]')).toHaveCount(labels.length);
  for(const label of labels)await expect(stage.locator(`[data-point-label="${label}"]`)).toBeVisible();
  await expect(stage.locator('.visual-config-error')).toHaveCount(0);
}

test('lesson 15 reading tasks always show a solvable coordinate ray without exposing the answer',async({page})=>{
  await openLessonFifteen(page);

  await jump(page,6,'l15-guided');
  await expectReadingRay(page,'l15-guided',['A','B','C','D','E','F']);
  const guided=page.locator('[data-stage-id="l15-guided"]');
  await expect(guided.locator('.l15-reading-exercise')).not.toContainText('125');
  await guided.locator('.inline-answer input').fill('10, 90, 50, 140, 190, 125');
  await guided.locator('.check-button').click();
  await expect(guided.locator('.instant-feedback.good')).toBeVisible();

  await jump(page,8,'l15-practice3');
  await expectReadingRay(page,'l15-practice3',['M','N','P','T','K','S']);
  const practice=page.locator('[data-stage-id="l15-practice3"]');
  await expect(practice.locator('.l15-reading-exercise')).not.toContainText('155');

  await jump(page,17,'l15-quiz2');
  await expectReadingRay(page,'l15-quiz2',['A','B','C','D','E','F']);
  const quiz=page.locator('[data-stage-id="l15-quiz2"]');
  await expect(quiz.locator('.l15-reading-exercise')).not.toContainText('125');
  await quiz.locator('.inline-answer input').fill('125');
  await quiz.locator('.check-button').click();
  await expect(quiz.locator('.instant-feedback.good')).toBeVisible();
});

test('lesson 15 coordinate ray remains usable at iPad viewport',async({page})=>{
  await page.setViewportSize({width:768,height:1024});
  await openLessonFifteen(page);
  await jump(page,6,'l15-guided');
  await expectReadingRay(page,'l15-guided',['A','B','C','D','E','F']);
  const scroller=page.locator('[data-stage-id="l15-guided"] .l15-reading-exercise > div').last();
  await expect(scroller).toBeVisible();
});
