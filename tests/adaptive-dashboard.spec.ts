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
