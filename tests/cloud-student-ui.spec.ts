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
  await page.route('**/api/cloud/snapshot',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student,revision,entries})}));
  await page.route('**/api/cloud/sync',async route=>{
    const body=route.request().postDataJSON() as {changes:Record<string,string|null>};revision+=1;
    Object.entries(body.changes).forEach(([key,value])=>{if(value===null)delete entries[key];else entries[key]=value});
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revision,updatedAt:new Date().toISOString()})});
  });
}

test('simple name and PIN registration creates cloud codes without email or phone',async({page})=>{
  await mockCloud(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{name:'Создать профиль ученика'})).toBeVisible();
  await expect(page.getByText(/Почта и телефон не нужны/)).toBeVisible();
  await page.getByLabel('Имя ученика').fill('Никита');
  await page.getByLabel('PIN · 4 цифры').fill('1234');
  await page.getByLabel('Повтори PIN').fill('1234');
  await page.getByRole('button',{name:'Создать профиль'}).click();
  await expect(page.getByRole('heading',{name:'Прогресс теперь защищён'})).toBeVisible();
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
  expect(registry?.profiles?.[0]?.cloud?.revision).toBe(8);
});
