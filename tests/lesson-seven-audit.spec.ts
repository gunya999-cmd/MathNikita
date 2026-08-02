import { expect,test,type Page } from '@playwright/test';

async function openLessonSeven(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 7:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l7-story"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:7,stageIndex}})),{stageIndex});
  await expect(page.locator(`[data-stage-id="${stageId}"]`)).toBeVisible();
}

function mockNarration(page:Page,counter:{value:number}){
  return Promise.all([
    page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})})),
    page.route('**/api/narration',route=>{counter.value+=1;return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-lesson-seven-mock'})}),
  ]);
}

test('lesson 7 uses correct geometry and task 75 derivation',async({page})=>{
  await openLessonSeven(page);

  await jump(page,9,'l7-practice3');
  await expect(page.locator('.l7-chain-model > span')).toHaveText(['A','M','K','B']);
  await expect(page.locator('.l7-chain-model strong')).toHaveText('AB = AM + MK + KB');

  await jump(page,10,'l7-practice4');
  await expect(page.locator('.l7-chain-model > span')).toHaveText(['A','C','B']);

  await jump(page,14,'l7-half-model');
  await expect(page.locator('.stage-copy')).toContainText('QB + BM + KD + DR');
  await expect(page.locator('.l7-half-model span')).toHaveText(['A','Q','B','M','C','K','D','R','E']);

  await jump(page,16,'l7-quiz2');
  await expect(page.locator('.l7-chain-model > span')).toHaveText(['C','B','D']);

  await jump(page,19,'l7-quiz5');
  await expect(page.locator('.l6-ruler b')).toHaveText(['0','1','2','3','4','5','6','7','8','9','10','11','12']);

  await jump(page,20,'l7-challenge');
  await expect(page.locator('.stage-copy')).toContainText('QB + BM + KD + DR = AE ÷ 2 = 6 см');
  await page.locator('.inline-answer input').fill('10');
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.good')).toContainText('QR = QB + BM + MK + KD + DR');
  await expect(page.locator('.instant-feedback.good')).toContainText('= 6 + 4 = 10 см');
});

test('lesson 7 summary is not a false completion and restart clears completion',async({page})=>{
  await openLessonSeven(page);
  await jump(page,22,'l7-summary');

  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
  await expect(page.locator('.extended-practice')).toBeVisible();

  await page.evaluate(()=>{
    localStorage.setItem('mathnikita:reflection:7','старый ответ');
    localStorage.setItem('mathnikita:lesson-complete:7',JSON.stringify({completedAt:new Date().toISOString(),activeSeconds:600}));
  });
  await page.getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l7-story"]')).toBeVisible();
  const values=await page.evaluate(()=>({reflection:localStorage.getItem('mathnikita:reflection:7'),completion:localStorage.getItem('mathnikita:lesson-complete:7')}));
  expect(values.reflection).toBeNull();
  expect(values.completion).toBeNull();
});

test('lesson 7 exposes AI narration in main lesson, practice and Pythagoras',async({page})=>{
  const requests={value:0};
  await mockNarration(page,requests);
  await openLessonSeven(page);

  const narrator=page.locator('.voice-narrator').getByRole('button',{name:/Слушать|Повторить/}).first();
  await expect(narrator).toBeVisible();
  const beforeMain=requests.value;
  await narrator.click();
  await expect.poll(()=>requests.value).toBeGreaterThan(beforeMain);

  await jump(page,22,'l7-summary');
  await expect(page.locator('.extended-practice-voice button')).toBeVisible();
  await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  await expect(page.locator('.practice-pythagoras')).toContainText('тот же AI-голос Sulafat');

  const beforePractice=requests.value;
  await page.locator('.extended-practice-voice button').click();
  await expect.poll(()=>requests.value).toBeGreaterThan(beforePractice);

  const beforeMentor=requests.value;
  await page.getByRole('button',{name:'✦ Подсказка'}).click();
  await expect.poll(()=>requests.value).toBeGreaterThan(beforeMentor);
});
