import {expect,test} from '@playwright/test';

function skill(mastery:number,attempts:number,correct:number,needsReview=false){
  return{mastery,attempts,correct,firstTryCorrect:correct,streak:correct,hintUses:0,needsReview,lastSeenLesson:1};
}

async function seedActiveError(page:any){
  await page.addInitScript(()=>{
    const now=new Date().toISOString();
    localStorage.setItem('math-course-state-v3',JSON.stringify({
      version:3,diagnosticDone:true,currentLessonIndex:1,currentSessionTaskIds:['r-ar-1'],currentTaskIndex:0,xp:12,completedSessions:1,completedTaskIds:[],
      skills:{
        arithmetic:{mastery:33,attempts:1,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:true,lastSeenLesson:1},
        expressions:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0},
        wordProblems:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0},
        fractions:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0},
        geometry:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0},
        logic:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0},
        combinatorics:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0}
      },
      attempts:[{taskId:'d-ar-1',skill:'arithmetic',correct:false,firstTry:true,usedHint:false,atLesson:1,createdAt:now}]
    }));
  });
}

async function seedWeeklyGrowth(page:any){
  await page.addInitScript(()=>{
    const now=new Date();
    const attempt=(correct:boolean,daysAgo:number,hour=12,minute=0)=>({
      taskId:'d-ar-1',skill:'arithmetic',correct,firstTry:correct,usedHint:false,atLesson:1,
      createdAt:new Date(now.getFullYear(),now.getMonth(),now.getDate()-daysAgo,hour,minute,0,0).toISOString()
    });
    localStorage.setItem('math-course-state-v3',JSON.stringify({
      version:3,diagnosticDone:true,currentLessonIndex:1,currentSessionTaskIds:['r-ar-1'],currentTaskIndex:0,xp:36,completedSessions:1,completedTaskIds:[],
      skills:{
        arithmetic:{mastery:55,attempts:8,correct:5,firstTryCorrect:5,streak:1,hintUses:0,needsReview:false,lastSeenLesson:1},
        expressions:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0},
        wordProblems:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0},
        fractions:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0},
        geometry:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0},
        logic:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0},
        combinatorics:{mastery:40,attempts:0,correct:0,firstTryCorrect:0,streak:0,hintUses:0,needsReview:false,lastSeenLesson:0}
      },
      attempts:[
        attempt(true,10),attempt(false,9),attempt(true,8),attempt(false,7,23,59),
        attempt(true,6),attempt(true,4),attempt(false,2),attempt(true,1)
      ]
    }));
  });
}

async function seedWeeklyRhythm(page:any){
  await page.addInitScript(()=>{
    const now=new Date();
    const key=(daysAgo:number)=>{
      const date=new Date(now.getFullYear(),now.getMonth(),now.getDate()-daysAgo);
      const year=date.getFullYear();const month=String(date.getMonth()+1).padStart(2,'0');const day=String(date.getDate()).padStart(2,'0');
      return`${year}-${month}-${day}`;
    };
    const studyDay={screenSeconds:1200,focusSeconds:900,activeSeconds:900,correct:4,wrong:1,completedLessons:0};
    localStorage.setItem('mathnikita:student-analytics:v1',JSON.stringify({
      version:1,
      lessons:{},
      daily:{[key(0)]:studyDay,[key(1)]:studyDay,[key(3)]:studyDay},
      events:[]
    }));
  });
}

test('dashboard prioritizes an unresolved error and removes it after correction',async({page})=>{
  await seedActiveError(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();

  const plan=page.getByRole('region',{name:'План на сегодня'});
  await expect(plan).toContainText('Исправить 1 ошибку');
  await expect(page.getByRole('region',{name:'Работа над ошибками'})).toContainText('Быстрый счёт');

  await plan.getByRole('button',{name:'Исправить ошибки'}).click();
  await expect(page.getByText('Исправляем ошибки',{exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Вычисли: 48 + 27'})).toBeVisible();
  await page.getByPlaceholder('Введи ответ').fill('75');
  await page.getByRole('button',{name:'Проверить'}).click();
  await expect(page.getByText('Ошибка исправлена')).toBeVisible();
  await page.getByRole('button',{name:'Завершить тренировку'}).click();
  await expect(page.getByRole('heading',{name:'Активных ошибок нет'})).toBeVisible();
  await page.getByRole('button',{name:'Вернуться в кабинет'}).click();

  await expect(page.getByRole('region',{name:'Работа над ошибками'})).toHaveCount(0);
  await expect(page.getByRole('region',{name:'План на сегодня'})).toContainText('Активных ошибок нет');
});

test('weekly growth compares weekly accuracy instead of lifetime mastery',async({page})=>{
  await seedWeeklyGrowth(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();

  const card=page.locator('.sdv4-growth-cards article').filter({hasText:'Вычисления'}).first();
  await expect(card).toBeVisible();
  await expect(card.locator('.sdv4-growth-value small')).toHaveText('50%');
  await expect(card.locator('.sdv4-growth-value b')).toHaveText('75%');
  await expect(card).toContainText('+25 п.п.');
  await expect(card).toContainText('4 ответов за 7 дней');
  await expect(card.locator('.sdv4-growth-value')).not.toContainText('55%');
});

test('weekly rhythm shows real active minutes, study days and current streak',async({page})=>{
  await seedWeeklyRhythm(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Кабинет'}).click();

  const rhythm=page.getByRole('region',{name:'Ритм недели'});
  await expect(rhythm).toBeVisible();
  await expect(rhythm).toContainText('45 мин');
  await expect(rhythm).toContainText('3 / 7');
  await expect(rhythm).toContainText('2 дня');
  const chart=rhythm.getByLabel('Активные минуты по дням');
  await expect(chart.locator('article')).toHaveCount(7);
  await expect(chart.locator('article[aria-label$="15 мин"]')).toHaveCount(3);
});
