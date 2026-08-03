import { expect,test,type Page } from '@playwright/test';

async function createProfile(page:Page,name:string,pin:string){
  await page.getByLabel('Имя ученика').fill(name);
  await page.getByLabel('PIN · 4 цифры').fill(pin);
  await page.getByLabel('Повтори PIN').fill(pin);
  await page.getByRole('button',{name:'Создать профиль'}).click();
  await expect(page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${name}`)})).toBeVisible();
}

async function switchToChooser(page:Page,name:string){
  await page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${name}`)}).click();
  await expect(page.getByRole('heading',{name:'Выбери свой профиль'})).toBeVisible();
}

test('first simple registration adopts the existing shared progress',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('mathnikita:lesson-complete:6',JSON.stringify({completedAt:'2026-08-01T10:00:00.000Z',activeSeconds:1875}));
    localStorage.setItem('mathnikita:student-analytics:v1',JSON.stringify({version:1,lessons:{},daily:{},events:[]}));
    localStorage.setItem('mathnikita:profile-test-marker','legacy-progress');
  });
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{name:'Создать профиль ученика'})).toBeVisible();
  await expect(page.getByText('Нашёл существующий прогресс')).toBeVisible();
  await expect(page.getByText(/Почта и телефон не нужны|Никакой почты, телефона/)).toBeVisible();
  await createProfile(page,'Никита','1234');

  const stored=await page.evaluate(()=>{
    const registry=JSON.parse(localStorage.getItem('mathnikita:accounts:registry:v1')??'null');
    const profile=registry?.profiles?.[0];
    const bundleKey=Object.keys(localStorage).find(key=>key.startsWith('mathnikita:accounts:profile-data:'));
    const bundle=bundleKey?JSON.parse(localStorage.getItem(bundleKey)??'null'):null;
    return{
      profileName:profile?.name,
      hasPlainPin:JSON.stringify(profile??{}).includes('1234'),
      liveMarker:localStorage.getItem('mathnikita:profile-test-marker'),
      liveCompletion:localStorage.getItem('mathnikita:lesson-complete:6'),
      bundledMarker:bundle?.storage?.['mathnikita:profile-test-marker'],
      bundledAnalytics:Boolean(bundle?.storage?.['mathnikita:student-analytics:v1']),
    };
  });
  expect(stored.profileName).toBe('Никита');
  expect(stored.hasPlainPin).toBeFalsy();
  expect(stored.liveMarker).toBe('legacy-progress');
  expect(stored.liveCompletion).toContain('1875');
  expect(stored.bundledMarker).toBe('legacy-progress');
  expect(stored.bundledAnalytics).toBeTruthy();
});

test('two students on one device keep completely separate progress and PIN access',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await createProfile(page,'Никита','1111');
  await page.evaluate(()=>{
    localStorage.setItem('mathnikita:profile-test-marker','nikita-data');
    localStorage.setItem('mathnikita:lesson-complete:6',JSON.stringify({completedAt:'2026-08-02T09:00:00.000Z',activeSeconds:2100}));
    localStorage.setItem('mathnikita:student-analytics:v1',JSON.stringify({version:1,lessons:{'6':{lessonNumber:6,sessions:1,screenSeconds:2200,focusSeconds:1900,activeSeconds:1800,correct:12,wrong:2,firstTryCorrect:10,recoveredErrors:2,hints:1,mentorActions:1,narrationPlays:2,practiceCorrect:8,practiceWrong:1}},daily:{},events:[]}));
  });

  await switchToChooser(page,'Никита');
  await page.getByRole('button',{name:/Добавить ученика/}).click();
  await createProfile(page,'Миша','2222');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:profile-test-marker'))).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'))).toBeNull();

  await page.evaluate(()=>{
    localStorage.setItem('mathnikita:profile-test-marker','misha-data');
    localStorage.setItem('mathnikita:lesson-complete:9',JSON.stringify({completedAt:'2026-08-03T09:00:00.000Z',activeSeconds:900}));
  });
  await switchToChooser(page,'Миша');

  await page.getByRole('button',{name:/Никита/}).click();
  await page.getByLabel('PIN для Никита').fill('9999');
  await page.getByRole('button',{name:'Войти'}).click();
  await expect(page.getByRole('alert')).toHaveText(/Неверный PIN/);
  await expect(page.getByRole('heading',{name:'Никита'})).toBeVisible();

  await page.getByLabel('PIN для Никита').fill('1111');
  await page.getByRole('button',{name:'Войти'}).click();
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Никита/})).toBeVisible();
  const nikita=await page.evaluate(()=>({
    marker:localStorage.getItem('mathnikita:profile-test-marker'),
    l6:localStorage.getItem('mathnikita:lesson-complete:6'),
    l9:localStorage.getItem('mathnikita:lesson-complete:9'),
    analytics:localStorage.getItem('mathnikita:student-analytics:v1'),
  }));
  expect(nikita.marker).toBe('nikita-data');
  expect(nikita.l6).toContain('2100');
  expect(nikita.l9).toBeNull();
  expect(nikita.analytics).toContain('"correct":12');

  await switchToChooser(page,'Никита');
  await page.getByRole('button',{name:/Миша/}).click();
  await page.getByLabel('PIN для Миша').fill('2222');
  await page.getByRole('button',{name:'Войти'}).click();
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Миша/})).toBeVisible();
  const misha=await page.evaluate(()=>({
    marker:localStorage.getItem('mathnikita:profile-test-marker'),
    l6:localStorage.getItem('mathnikita:lesson-complete:6'),
    l9:localStorage.getItem('mathnikita:lesson-complete:9'),
    analytics:localStorage.getItem('mathnikita:student-analytics:v1'),
  }));
  expect(misha.marker).toBe('misha-data');
  expect(misha.l6).toBeNull();
  expect(misha.l9).toContain('900');
  expect(misha.analytics).toBeNull();
});

test('a new browser tab asks who is studying but preserves the current workspace',async({page,context})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await createProfile(page,'Лена','4321');
  await page.evaluate(()=>localStorage.setItem('mathnikita:profile-test-marker','lena-latest'));

  const second=await context.newPage();
  await second.goto('/',{waitUntil:'domcontentloaded'});
  await expect(second.getByRole('heading',{name:'Выбери свой профиль'})).toBeVisible();
  await second.getByRole('button',{name:/Лена/}).click();
  await second.getByLabel('PIN для Лена').fill('4321');
  await second.getByRole('button',{name:'Войти'}).click();
  await expect(second.getByRole('button',{name:/Сменить ученика\. Сейчас Лена/})).toBeVisible();
  expect(await second.evaluate(()=>localStorage.getItem('mathnikita:profile-test-marker'))).toBe('lena-latest');
});
