import {expect,test} from '@playwright/test';

async function createProfile(page:any,name:string,pin:string){
  await page.getByLabel('Имя ученика').fill(name);
  await page.getByLabel('PIN · 4 цифры').fill(pin);
  await page.getByLabel('Повтори PIN').fill(pin);
  await page.getByRole('button',{name:'Создать профиль'}).click();
  await expect(page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${name}`)})).toBeVisible();
}

test('student dashboard header uses the authenticated profile name and avatar',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await createProfile(page,'Лена','4321');

  await page.getByRole('button',{name:'Кабинет'}).click();

  const profile=page.getByLabel('Профиль ученика Лена');
  await expect(profile).toBeVisible();
  await expect(profile).toContainText('Лена');
  await expect(profile.locator('.sdv4-profile-avatar')).toHaveText('🐱');
});
