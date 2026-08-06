import { expect,test,type Page } from '@playwright/test';

type NarrationCapture={ids:string[]};

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

function mockNarration(page:Page,capture:NarrationCapture){
  return Promise.all([
    page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})})),
    page.route('**/api/narration',route=>{
      try{const body=route.request().postDataJSON() as {id?:string};if(body.id)capture.ids.push(body.id)}catch{/* keep test focused on narration availability */}
      return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-lesson-seven-mock'});
    }),
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
  const capture:NarrationCapture={ids:[]};
  await mockNarration(page,capture);
  await openLessonSeven(page);

  await expect(page.locator('.voice-narrator').getByRole('button',{name:/Слушать|Повторить/}).first()).toBeVisible();
  await expect(page.locator('.voice-ai-disclosure')).toContainText('AI-голос');
  await expect.poll(()=>capture.ids.includes('lesson-07-stage-l7-story')).toBeTruthy();

  await jump(page,22,'l7-summary');
  await expect(page.locator('.extended-practice-voice button')).toBeVisible();
  await expect.poll(()=>capture.ids.some(id=>id.startsWith('lesson-07-practice-'))).toBeTruthy();
  await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  await expect(page.locator('.practice-pythagoras')).toContainText('тот же AI-голос Sulafat');

  const hintRequests=()=>capture.ids.filter(id=>id.startsWith('mentor-practice-7-')&&id.endsWith('-hint')).length;
  expect(hintRequests()).toBe(0);
  await page.getByRole('button',{name:/Подсказка/}).last().click();
  await expect(page.locator('.practice-pythagoras-message')).not.toBeEmpty();
  await expect.poll(hintRequests,{timeout:3_000}).toBe(1);
});