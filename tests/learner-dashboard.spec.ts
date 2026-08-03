import { expect,test,type Page } from '@playwright/test';

function dateKey(date:Date){const y=date.getFullYear();const m=String(date.getMonth()+1).padStart(2,'0');const d=String(date.getDate()).padStart(2,'0');return`${y}-${m}-${d}`}
async function mockNarration(page:Page){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-dashboard-mock'}));
}

async function seedDashboard(page:Page){
  await page.addInitScript(()=>{
    const now=new Date();const yesterday=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1);const before=new Date(now.getFullYear(),now.getMonth(),now.getDate()-2);const stale=new Date(now.getFullYear(),now.getMonth(),now.getDate()-30);
    const key=(date:Date)=>{const y=date.getFullYear();const m=String(date.getMonth()+1).padStart(2,'0');const d=String(date.getDate()).padStart(2,'0');return`${y}-${m}-${d}`};
    localStorage.setItem('mathnikita:lesson-complete:5',JSON.stringify({completedAt:before.toISOString(),activeSeconds:1800}));
    localStorage.setItem('mathnikita:lesson-complete:6',JSON.stringify({completedAt:yesterday.toISOString(),activeSeconds:2100}));
    localStorage.setItem('mathnikita:lesson-timing:5:v1',JSON.stringify({version:1,activeSeconds:1900,sessions:2,updatedAt:before.toISOString()}));
    localStorage.setItem('mathnikita:lesson-timing:6:v1',JSON.stringify({version:1,activeSeconds:2200,sessions:2,updatedAt:yesterday.toISOString()}));
    localStorage.setItem('mathnikita:student-analytics:v1',JSON.stringify({version:1,lessons:{
      '5':{lessonNumber:5,sessions:2,screenSeconds:2000,focusSeconds:1750,activeSeconds:1650,correct:16,wrong:4,firstTryCorrect:13,recoveredErrors:3,hints:2,mentorActions:3,narrationPlays:4,practiceCorrect:10,practiceWrong:2,completedAt:before.toISOString(),firstSeenAt:before.toISOString(),lastSeenAt:before.toISOString()},
      '6':{lessonNumber:6,sessions:2,screenSeconds:2400,focusSeconds:2150,activeSeconds:2000,correct:18,wrong:2,firstTryCorrect:16,recoveredErrors:2,hints:1,mentorActions:2,narrationPlays:3,practiceCorrect:12,practiceWrong:1,completedAt:yesterday.toISOString(),firstSeenAt:yesterday.toISOString(),lastSeenAt:yesterday.toISOString()},
      '7':{lessonNumber:7,sessions:1,screenSeconds:7200,focusSeconds:7000,activeSeconds:7200,correct:0,wrong:0,firstTryCorrect:0,recoveredErrors:0,hints:0,mentorActions:0,narrationPlays:0,practiceCorrect:0,practiceWrong:0,firstSeenAt:stale.toISOString(),lastSeenAt:stale.toISOString()}
    },daily:{
      [key(stale)]:{screenSeconds:7200,focusSeconds:7000,activeSeconds:7200,correct:0,wrong:0,completedLessons:0},
      [key(before)]:{screenSeconds:2000,focusSeconds:1750,activeSeconds:1650,correct:16,wrong:4,completedLessons:1},
      [key(yesterday)]:{screenSeconds:2400,focusSeconds:2150,activeSeconds:2000,correct:18,wrong:2,completedLessons:1},
      [key(now)]:{screenSeconds:900,focusSeconds:820,activeSeconds:760,correct:5,wrong:0,completedLessons:0}
    },events:[{id:'wrong-1',at:yesterday.toISOString(),lessonNumber:6,type:'answer_wrong',area:'practice',key:'practice:l6-source-47',label:'Построй отрезок 6 см 3 мм'}]}));
  });
}

test('student dashboard leads with next action and keeps detailed analytics secondary',async({page})=>{
  await seedDashboard(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await expect(page.getByRole('heading',{name:'Продолжим с урока 7'})).toBeVisible();
  await expect(page.getByText('Учебный импульс')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Где ты сейчас'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Что получается и что подтянуть'})).toBeVisible();
  await expect(page.getByText('Подробная статистика')).toBeVisible();
  await page.getByText('Подробная статистика').click();
  await expect(page.getByText('Время на экране')).toBeVisible();
  await page.getByRole('button',{name:'Продолжить обучение'}).click();
  await expect(page.getByRole('button',{name:/Открыть урок 7:/})).toBeVisible();
});

test('parent dashboard prioritizes attention and uses the same seven-day window for chart totals',async({page})=>{
  await seedDashboard(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Родителям'}).click();
  await expect(page.getByRole('heading',{name:'Обзор обучения'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'На что обратить внимание'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Продвижение по урокам'})).toBeVisible();
  await expect(page.getByText('34 верно · 6 ошибок')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Где возникали трудности'})).toBeVisible();
  await expect(page.getByText('Построй отрезок 6 см 3 мм')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Последние занятия'})).toBeVisible();
  const week=page.locator('.ld-parent-week-foot');
  await expect(week).toContainText('Активно 1 ч 13 мин');
  await expect(week).toContainText('Экран 1 ч 28 мин');
  await expect(week).toContainText('Фокус 83%');
  await expect(week).not.toContainText('3 ч 13 мин');
  await expect(page.getByText(/Историческое завершение и накопленное время/)).toBeVisible();
});

test('parent latest activity ignores an older unfinished lesson',async({page})=>{
  await seedDashboard(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Родителям'}).click();
  const footer=page.locator('.ld-parent-footer');
  await expect(footer).toContainText('Последнее занятие');
  await expect(footer).toContainText(/Урок 6 ·/);
  await expect(footer).not.toContainText(/Урок 7 ·/);
  const firstHistory=page.locator('.ld-history article').first();
  await expect(firstHistory).toContainText('Урок 6 ·');
});

test('lesson session starts writing detailed screen and focus telemetry',async({page})=>{
  await mockNarration(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 6:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l6-story"]')).toBeVisible();
  await page.waitForTimeout(1300);
  const store=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:student-analytics:v1')??'null'));
  expect(store?.version).toBe(1);
  expect(store?.lessons?.['6']?.sessions).toBeGreaterThanOrEqual(1);
  expect(store?.events?.some((event:{lessonNumber:number;type:string})=>event.lessonNumber===6&&event.type==='lesson_started')).toBeTruthy();
  expect(dateKey(new Date())).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
