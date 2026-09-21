import { expect,test,type Page } from '@playwright/test';

function dateKey(date:Date){const y=date.getFullYear();const m=String(date.getMonth()+1).padStart(2,'0');const d=String(date.getDate()).padStart(2,'0');return`${y}-${m}-${d}`}
async function mockNarration(page:Page){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-dashboard-mock'}));
}

async function seedDashboard(page:Page){
  await page.addInitScript(()=>{
    const now=new Date();const yesterday=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1);const before=new Date(now.getFullYear(),now.getMonth(),now.getDate()-2);const previousWeek=new Date(now.getFullYear(),now.getMonth(),now.getDate()-8);const stale=new Date(now.getFullYear(),now.getMonth(),now.getDate()-30);
    const key=(date:Date)=>{const y=date.getFullYear();const m=String(date.getMonth()+1).padStart(2,'0');const d=String(date.getDate()).padStart(2,'0');return`${y}-${m}-${d}`};
    localStorage.setItem('mathnikita:lesson-complete:5',JSON.stringify({completedAt:before.toISOString(),activeSeconds:1800}));
    localStorage.setItem('mathnikita:lesson-complete:6',JSON.stringify({completedAt:yesterday.toISOString(),activeSeconds:2100}));
    localStorage.setItem('mathnikita:lesson-timing:5:v1',JSON.stringify({version:1,activeSeconds:1900,sessions:2,updatedAt:before.toISOString()}));
    localStorage.setItem('mathnikita:lesson-timing:6:v1',JSON.stringify({version:1,activeSeconds:2200,sessions:2,updatedAt:yesterday.toISOString()}));
    localStorage.setItem('math-course-state-v3',JSON.stringify({
      version:3,diagnosticDone:true,currentLessonIndex:6,currentSessionTaskIds:['d-ar-1'],currentTaskIndex:0,xp:140,completedSessions:4,completedTaskIds:[],
      skills:{
        arithmetic:{mastery:82,attempts:4,correct:4,firstTryCorrect:3,streak:4,hintUses:0,needsReview:false,lastSeenLesson:6},
        expressions:{mastery:67,attempts:3,correct:2,firstTryCorrect:2,streak:1,hintUses:0,needsReview:false,lastSeenLesson:5},
        wordProblems:{mastery:73,attempts:3,correct:3,firstTryCorrect:2,streak:3,hintUses:1,needsReview:false,lastSeenLesson:6},
        fractions:{mastery:76,attempts:4,correct:4,firstTryCorrect:3,streak:4,hintUses:0,needsReview:false,lastSeenLesson:6},
        geometry:{mastery:54,attempts:2,correct:1,firstTryCorrect:1,streak:0,hintUses:1,needsReview:true,lastSeenLesson:4},
        logic:{mastery:62,attempts:2,correct:2,firstTryCorrect:1,streak:2,hintUses:0,needsReview:false,lastSeenLesson:5},
        combinatorics:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0}
      },
      attempts:[
        {taskId:'a1',skill:'fractions',correct:true,firstTry:true,usedHint:false,atLesson:5,createdAt:before.toISOString()},
        {taskId:'a2',skill:'fractions',correct:true,firstTry:false,usedHint:false,atLesson:6,createdAt:yesterday.toISOString()},
        {taskId:'a3',skill:'arithmetic',correct:true,firstTry:true,usedHint:false,atLesson:6,createdAt:yesterday.toISOString()},
        {taskId:'a4',skill:'wordProblems',correct:true,firstTry:false,usedHint:true,atLesson:6,createdAt:yesterday.toISOString()}
      ]
    }));
    localStorage.setItem('mathnikita:student-analytics:v1',JSON.stringify({version:1,lessons:{
      '5':{lessonNumber:5,sessions:2,screenSeconds:2000,focusSeconds:1750,activeSeconds:1650,correct:16,wrong:4,firstTryCorrect:13,recoveredErrors:3,hints:2,mentorActions:3,narrationPlays:4,practiceCorrect:10,practiceWrong:2,completedAt:before.toISOString(),firstSeenAt:before.toISOString(),lastSeenAt:before.toISOString()},
      '6':{lessonNumber:6,sessions:2,screenSeconds:2400,focusSeconds:2150,activeSeconds:2000,correct:18,wrong:2,firstTryCorrect:16,recoveredErrors:2,hints:1,mentorActions:2,narrationPlays:3,practiceCorrect:12,practiceWrong:1,completedAt:yesterday.toISOString(),firstSeenAt:yesterday.toISOString(),lastSeenAt:yesterday.toISOString()},
      '7':{lessonNumber:7,sessions:1,screenSeconds:7200,focusSeconds:7000,activeSeconds:7200,correct:0,wrong:0,firstTryCorrect:0,recoveredErrors:0,hints:0,mentorActions:0,narrationPlays:0,practiceCorrect:0,practiceWrong:0,firstSeenAt:stale.toISOString(),lastSeenAt:stale.toISOString()}
    },daily:{
      [key(stale)]:{screenSeconds:7200,focusSeconds:7000,activeSeconds:7200,correct:0,wrong:0,completedLessons:0},
      [key(previousWeek)]:{screenSeconds:700,focusSeconds:650,activeSeconds:600,correct:8,wrong:2,completedLessons:0},
      [key(before)]:{screenSeconds:2000,focusSeconds:1750,activeSeconds:1650,correct:16,wrong:4,completedLessons:1},
      [key(yesterday)]:{screenSeconds:2400,focusSeconds:2150,activeSeconds:2000,correct:18,wrong:2,completedLessons:1},
      [key(now)]:{screenSeconds:900,focusSeconds:820,activeSeconds:760,correct:5,wrong:0,completedLessons:0}
    },events:[
      {id:'wrong-1',at:new Date(yesterday.getTime()-120_000).toISOString(),lessonNumber:6,type:'answer_wrong',area:'practice',key:'practice:l6-source-47',label:'Построй отрезок 6 см 3 мм'},
      {id:'correct-1',at:new Date(yesterday.getTime()-60_000).toISOString(),lessonNumber:6,type:'answer_correct',area:'practice',key:'practice:l6-source-47',label:'Построй отрезок 6 см 3 мм',recovered:true},
      {id:'correct-2',at:yesterday.toISOString(),lessonNumber:6,type:'answer_correct',area:'practice',key:'practice:l6-source-48',label:'Следующая задача'}
    ]}));
  });
}

test('student dashboard matches the focused reference structure and uses real progress',async({page})=>{
  await seedDashboard(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await expect(page.getByText('Сегодня',{exact:true})).toBeVisible();
  await expect(page.getByText('Урок 7',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:/Продолжить/})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Мой рост'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Твой маршрут'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Мои навыки'})).toBeVisible();
  await expect(page.locator('.sdv4-growth-cards')).toContainText('Дроби');
  await expect(page.locator('.sdv4-growth-cards')).toContainText('76%');
  await expect(page.locator('.sdv4-motivation')).toContainText('2 подряд');
  await expect(page.locator('.sdv4-motivation')).toContainText('правильных ответов без ошибки');
  await expect(page.locator('.sdv4-route-track article')).toHaveCount(6);
  const sizes=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  expect(sizes.scrollWidth-sizes.clientWidth).toBeLessThanOrEqual(2);
});

test('student dashboard keeps the full 175-lesson course one action away',async({page})=>{
  await seedDashboard(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();
  await expect(page.locator('.sdv4-course-list')).toHaveCount(0);
  await page.getByRole('button',{name:/Весь курс/}).click();
  await expect(page.locator('.sdv4-course-list')).toBeVisible();
  await expect(page.locator('.sdv4-lesson')).toHaveCount(175);
});

test('parent dashboard shows KPI, recovered errors and compares the same seven-day window',async({page})=>{
  await seedDashboard(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Родителям'}).click();
  await expect(page.getByRole('heading',{name:'Обзор обучения'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Учебный KPI'})).toBeVisible();
  await expect(page.getByText(/Быстрое прохождение само по себе не повышает KPI/)).toBeVisible();
  await expect(page.getByRole('heading',{name:'На что обратить внимание'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Продвижение по урокам'})).toBeVisible();
  await expect(page.getByText('34 верно · 6 ошибок')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Где возникали трудности'})).toBeVisible();
  await expect(page.getByText('Построй отрезок 6 см 3 мм')).toBeVisible();
  await expect(page.getByText('Исправлено',{exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Последние занятия'})).toBeVisible();
  const week=page.locator('.ld-parent-week-foot');
  await expect(week).toContainText('Активно 1 ч 13 мин');
  await expect(week).toContainText('Экран 1 ч 28 мин');
  await expect(week).toContainText('Вовлечённость 83%');
  await expect(week).not.toContainText('3 ч 13 мин');
  await expect(page.locator('.ld-week-compare')).toContainText('+640%');
  await expect(page.locator('.ld-week-compare')).toContainText('+7 п.п.');
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
  await expect(firstHistory).toContainText('С первой');
  await expect(firstHistory).toContainText('Подсказки');
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
