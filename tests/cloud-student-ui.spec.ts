import {expect,test,type Page} from '@playwright/test';

async function mockCloud(page:Page,options?:{studentId?:string;name?:string;code?:string;entries?:Record<string,string>;revision?:number}){
  const student={id:options?.studentId??'cloud-student-1',name:options?.name??'Никита',code:options?.code??'MN-7K4P2Q'};
  let entries={...(options?.entries??{})};let revision=options?.revision??1;
  await page.route('**/api/cloud/register',async route=>{
    const body=route.request().postDataJSON() as {studentId:string;name:string;entries:Record<string,string>};
    student.id=body.studentId;student.name=body.name;entries={...body.entries};revision=Object.keys(entries).length?1:0;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student,token:'token-cloud-registration-123456789',recoveryCode:'MN-RCV-ABCD-EFGH-JKLM',revision,entries})});
  });
  await page.route('**/api/cloud/login',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student,token:'token-cloud-login-123456789',revision,entries})}));
  await page.route('**/api/cloud/recover',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student,token:'token-cloud-recovery-123456789',recoveryCode:'MN-RCV-NEWW-CODE-2345',revision,entries})}));
  await page.route('**/api/cloud/snapshot',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student,revision,entries})}));
  await page.route('**/api/cloud/sync',async route=>{
    const body=route.request().postDataJSON() as {changes:Record<string,string|null>};revision+=1;
    Object.entries(body.changes).forEach(([key,value])=>{if(value===null)delete entries[key];else entries[key]=value});
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revision,updatedAt:new Date().toISOString()})});
  });
  return{
    setEntries(next:Record<string,string>){entries={...next}},
    setRevision(next:number){revision=next},
    student,
  };
}

async function register(page:Page,name='Никита',pin='1234'){
  await page.getByLabel('Имя ученика').fill(name);
  await page.getByLabel('PIN · 4 цифры').fill(pin);
  await page.getByLabel('Повтори PIN').fill(pin);
  await page.getByRole('button',{name:'Создать профиль'}).click();
  await expect(page.getByRole('heading',{name:'Прогресс теперь защищён'})).toBeVisible();
}

test('simple name and PIN registration creates cloud codes without email or phone',async({page})=>{
  await mockCloud(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{name:'Создать профиль ученика'})).toBeVisible();
  await expect(page.getByText(/Почта и телефон не нужны/)).toBeVisible();
  await register(page);
  await expect(page.getByText('MN-7K4P2Q',{exact:true})).toBeVisible();
  await expect(page.getByText('MN-RCV-ABCD-EFGH-JKLM',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:/Я сохранил коды/}).click();
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Никита/})).toBeVisible();
  await expect(page.getByText('MN-7K4P2Q',{exact:true})).toBeVisible();
});

test('student code and PIN restore cloud progress on a clean device',async({page})=>{
  await mockCloud(page,{studentId:'cloud-student-2',name:'Миша',code:'MN-Q7W8E9R',entries:{'mathnikita:profile-test-marker':'restored-from-cloud'},revision:8});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Уже есть код ученика/}).click();
  await page.getByLabel('Код ученика').fill('MN-Q7W8E9R');
  await page.getByLabel('PIN облачного профиля').fill('4321');
  await page.getByRole('button',{name:'Войти и загрузить прогресс'}).click();
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Миша/})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:profile-test-marker'))).toBe('restored-from-cloud');
  const registry=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:accounts:registry:v1')??'null'));
  expect(registry?.profiles?.[0]?.cloud?.studentCode).toBe('MN-Q7W8E9R');
  expect(registry?.profiles?.[0]?.cloud?.revision).toBeGreaterThanOrEqual(8);
});

test('recovery code changes the PIN, rotates recovery and restores progress',async({page})=>{
  await mockCloud(page,{studentId:'cloud-student-3',name:'Лена',code:'MN-RCV4321',entries:{'mathnikita:profile-test-marker':'recovered-progress'},revision:5});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Забыл PIN · есть код восстановления/}).click();
  await expect(page.getByRole('heading',{name:'Задать новый PIN'})).toBeVisible();
  await page.getByLabel('Код ученика для восстановления').fill('MN-RCV4321');
  await page.getByLabel('Код восстановления').fill('MN-RCV-OLD1-CODE-9999');
  await page.getByLabel('Новый PIN',{exact:true}).fill('5678');
  await page.getByLabel('Повтори новый PIN',{exact:true}).fill('5678');
  await page.getByRole('button',{name:'Сменить PIN и восстановить профиль'}).click();
  await expect(page.getByText('MN-RCV-NEWW-CODE-2345',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:/Я сохранил коды/}).click();
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Лена/})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:profile-test-marker'))).toBe('recovered-progress');
  await page.getByRole('button',{name:/Сменить ученика\. Сейчас Лена/}).click();
  await page.getByRole('button',{name:/Лена/}).click();
  await page.getByLabel('PIN для Лена').fill('5678');
  await page.getByRole('button',{name:'Войти'}).click();
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Лена/})).toBeVisible();
});

test('explicit cloud login refreshes live storage even when the same profile owns the workspace',async({page})=>{
  const cloud=await mockCloud(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await register(page);
  await page.getByRole('button',{name:/Я сохранил коды/}).click();
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Никита/})).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('mathnikita:profile-test-marker','stale-local'));
  cloud.setEntries({'mathnikita:profile-test-marker':'newer-cloud'});cloud.setRevision(9);
  await page.getByRole('button',{name:/Сменить ученика\. Сейчас Никита/}).click();
  await page.getByRole('button',{name:/Войти по коду ученика с другого устройства/}).click();
  await page.getByLabel('Код ученика').fill('MN-7K4P2Q');
  await page.getByLabel('PIN облачного профиля').fill('1234');
  await page.getByRole('button',{name:'Войти и загрузить прогресс'}).click();
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Никита/})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:profile-test-marker'))).toBe('newer-cloud');
});
