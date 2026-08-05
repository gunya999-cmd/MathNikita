import {expect,test,type Browser,type Page} from '@playwright/test';

type CloudStudent={
  id:string;
  name:string;
  code:string;
  pin:string;
  token:string;
  recoveryCode:string;
  revision:number;
  entries:Record<string,string>;
};

type CloudStore={students:CloudStudent[];nextCode:number};

function studentByToken(store:CloudStore,authorization:string|null){
  const token=(authorization??'').replace(/^Bearer\s+/i,'');
  return store.students.find(student=>student.token===token);
}

async function installCloud(page:Page,store:CloudStore){
  await page.route('**/api/cloud/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,configured:true})}));
  await page.route('**/api/cloud/register',async route=>{
    const body=route.request().postDataJSON() as {studentId:string;name:string;pin:string;entries:Record<string,string>};
    let student=store.students.find(item=>item.id===body.studentId);
    if(!student){
      const suffix=String(store.nextCode++).padStart(5,'0');
      student={id:body.studentId,name:body.name,code:`MN-QA${suffix}`,pin:body.pin,token:`token-${body.studentId}`,recoveryCode:`MN-RCV-QA${suffix}-TEST-CODE`,revision:Object.keys(body.entries??{}).length?1:0,entries:{...(body.entries??{})}};
      store.students.push(student);
    }
    if(student.pin!==body.pin){
      await route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'Student id already exists'})});
      return;
    }
    student.name=body.name;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:student.id,name:student.name,code:student.code},token:student.token,recoveryCode:student.recoveryCode,revision:student.revision,entries:student.entries,resumed:true})});
  });
  await page.route('**/api/cloud/login',async route=>{
    const body=route.request().postDataJSON() as {code:string;pin:string};
    const student=store.students.find(item=>item.code===String(body.code??'').trim().toUpperCase());
    if(!student||student.pin!==body.pin){
      await route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'Неверный код ученика или PIN.'})});
      return;
    }
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:student.id,name:student.name,code:student.code},token:student.token,revision:student.revision,entries:student.entries})});
  });
  await page.route('**/api/cloud/snapshot',async route=>{
    const student=studentByToken(store,route.request().headers()['authorization']??null);
    if(!student){await route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'Unauthorized'})});return}
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:student.id,name:student.name,code:student.code},revision:student.revision,entries:student.entries})});
  });
  await page.route('**/api/cloud/sync',async route=>{
    const student=studentByToken(store,route.request().headers()['authorization']??null);
    if(!student){await route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'Unauthorized'})});return}
    const body=route.request().postDataJSON() as {baseRevision:number;changes:Record<string,string|null>};
    if(body.baseRevision!==student.revision){
      await route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'revision_conflict',revision:student.revision,entries:student.entries})});
      return;
    }
    for(const[key,value]of Object.entries(body.changes??{})){if(value===null)delete student.entries[key];else student.entries[key]=value}
    student.revision+=1;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revision:student.revision,updatedAt:new Date().toISOString()})});
  });
  await page.route('**/api/cloud/recover',async route=>{
    const body=route.request().postDataJSON() as {code:string;recoveryCode:string;newPin:string};
    const student=store.students.find(item=>item.code===String(body.code??'').trim().toUpperCase());
    if(!student||student.recoveryCode!==body.recoveryCode){await route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'Неверный код восстановления.'})});return}
    student.pin=body.newPin;student.recoveryCode=`${student.recoveryCode}-NEW`;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:student.id,name:student.name,code:student.code},token:student.token,recoveryCode:student.recoveryCode,revision:student.revision,entries:student.entries})});
  });
}

async function createProfile(page:Page,store:CloudStore,name:string,pin:string){
  await page.getByLabel('Имя ученика').fill(name);
  await page.getByLabel('PIN · 4 цифры').fill(pin);
  await page.getByLabel('Повтори PIN').fill(pin);
  await page.getByRole('button',{name:'Создать профиль'}).click();
  await expect(page.getByRole('heading',{name:'Прогресс теперь защищён'})).toBeVisible();
  const student=store.students.find(item=>item.name===name);
  expect(student,`cloud profile for ${name} should be created`).toBeTruthy();
  await page.getByRole('button',{name:/Я сохранил коды/}).click();
  await expect(page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${name}`)})).toBeVisible();
  await expect(page.getByLabel(/Облако: Прогресс сохранён/)).toBeVisible();
  return student!;
}

async function seedStudentData(page:Page,input:{marker:string;lesson:number;correct:number;wrong:number;mistake:string}){
  await page.evaluate(({marker,lesson,correct,wrong,mistake})=>{
    const now=new Date();
    const key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const iso=now.toISOString();
    localStorage.setItem('mathnikita:profile-test-marker',marker);
    localStorage.setItem(`mathnikita:lesson-complete:${lesson}`,JSON.stringify({completedAt:iso,activeSeconds:1200+lesson}));
    localStorage.setItem('mathnikita:student-analytics:v1',JSON.stringify({version:1,lessons:{[String(lesson)]:{lessonNumber:lesson,sessions:1,screenSeconds:1500,focusSeconds:1400,activeSeconds:1300,correct,wrong,firstTryCorrect:Math.max(0,correct-1),recoveredErrors:Math.min(1,wrong),hints:wrong?1:0,mentorActions:1,narrationPlays:2,practiceCorrect:Math.max(0,correct-2),practiceWrong:wrong,completedAt:iso,firstSeenAt:iso,lastSeenAt:iso}},daily:{[key]:{screenSeconds:1500,focusSeconds:1400,activeSeconds:1300,correct,wrong,completedLessons:1}},events:wrong?[{id:`wrong-${lesson}`,at:iso,lessonNumber:lesson,type:'answer_wrong',area:'practice',key:`qa:${lesson}`,label:mistake}]:[]}));
  },input);
}

async function switchToChooser(page:Page,name:string){
  await page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${name}`)}).click();
  await expect(page.getByRole('heading',{name:'Выбери свой профиль'})).toBeVisible();
}

async function localLogin(page:Page,name:string,pin:string){
  await page.getByRole('button',{name:new RegExp(name)}).click();
  await page.getByLabel(`PIN для ${name}`).fill(pin);
  await page.getByRole('button',{name:'Войти'}).click();
  await expect(page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${name}`)})).toBeVisible();
}

async function cleanDeviceLogin(browser:Browser,store:CloudStore,student:CloudStudent,pin:string){
  const context=await browser.newContext();
  const page=await context.newPage();
  await installCloud(page,store);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Уже есть код ученика/}).click();
  await page.getByLabel('Код ученика').fill(student.code);
  await page.getByLabel('PIN облачного профиля').fill(pin);
  await page.getByRole('button',{name:'Войти и загрузить прогресс'}).click();
  await expect(page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${student.name}`)})).toBeVisible();
  return{context,page};
}

async function expectParentIsolation(page:Page,present:string,absent:string){
  await page.getByRole('button',{name:'Родителям'}).click();
  await expect(page.getByRole('heading',{name:'Обзор обучения'})).toBeVisible();
  await expect(page.getByText(present)).toBeVisible();
  await expect(page.getByText(absent)).toHaveCount(0);
}

test('immediate account switching flushes each student to cloud before another device logs in',async({page,browser})=>{
  const store:CloudStore={students:[],nextCode:1};
  await installCloud(page,store);
  await page.goto('/',{waitUntil:'domcontentloaded'});

  const nikita=await createProfile(page,store,'Никита','1111');
  await seedStudentData(page,{marker:'nikita-latest',lesson:6,correct:17,wrong:1,mistake:'Никита · уникальная ошибка с отрезком'});
  await switchToChooser(page,'Никита');

  const nikitaDevice=await cleanDeviceLogin(browser,store,nikita,'1111');
  expect(await nikitaDevice.page.evaluate(()=>localStorage.getItem('mathnikita:profile-test-marker'))).toBe('nikita-latest');
  expect(await nikitaDevice.page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'))).toContain('activeSeconds');
  await expectParentIsolation(nikitaDevice.page,'Никита · уникальная ошибка с отрезком','Миша · уникальная ошибка с дробями');
  await nikitaDevice.context.close();

  await page.getByRole('button',{name:/Добавить ученика/}).click();
  const misha=await createProfile(page,store,'Миша','2222');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:profile-test-marker'))).toBeNull();
  await seedStudentData(page,{marker:'misha-latest',lesson:9,correct:8,wrong:2,mistake:'Миша · уникальная ошибка с дробями'});
  await switchToChooser(page,'Миша');

  const mishaDevice=await cleanDeviceLogin(browser,store,misha,'2222');
  expect(await mishaDevice.page.evaluate(()=>localStorage.getItem('mathnikita:profile-test-marker'))).toBe('misha-latest');
  expect(await mishaDevice.page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:9'))).toContain('activeSeconds');
  expect(await mishaDevice.page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'))).toBeNull();
  await expectParentIsolation(mishaDevice.page,'Миша · уникальная ошибка с дробями','Никита · уникальная ошибка с отрезком');
  await mishaDevice.context.close();
});

test('same-device switching keeps analytics, lesson history and parent view isolated',async({page})=>{
  const store:CloudStore={students:[],nextCode:1};
  await installCloud(page,store);
  await page.goto('/',{waitUntil:'domcontentloaded'});

  await createProfile(page,store,'Никита','1111');
  await seedStudentData(page,{marker:'nikita-local',lesson:6,correct:19,wrong:1,mistake:'Никита · только его ошибка'});
  await switchToChooser(page,'Никита');
  await page.getByRole('button',{name:/Добавить ученика/}).click();
  await createProfile(page,store,'Миша','2222');
  await seedStudentData(page,{marker:'misha-local',lesson:9,correct:7,wrong:3,mistake:'Миша · только его ошибка'});
  await switchToChooser(page,'Миша');

  await localLogin(page,'Никита','1111');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:profile-test-marker'))).toBe('nikita-local');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'))).not.toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:9'))).toBeNull();
  await expectParentIsolation(page,'Никита · только его ошибка','Миша · только его ошибка');

  await switchToChooser(page,'Никита');
  await localLogin(page,'Миша','2222');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:profile-test-marker'))).toBe('misha-local');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'))).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:9'))).not.toBeNull();
  await expectParentIsolation(page,'Миша · только его ошибка','Никита · только его ошибка');
});
