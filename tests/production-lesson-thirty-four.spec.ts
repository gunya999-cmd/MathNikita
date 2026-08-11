import {expect,test} from '@playwright/test';

const EXPECTED_SHA='ea169958a5f96e4c1b4461a99f53cfe9e1c014fb';
const BASE='https://mathnikita.gunya999.workers.dev';

test('production serves exact lesson 34 release with cloud profile and responsive course flow',async({page,request,browserName})=>{
  test.setTimeout(120_000);
  const versionResponse=await request.get(`${BASE}/api/version`);
  expect(versionResponse.ok()).toBeTruthy();
  const version=await versionResponse.json() as {gitSha?:string;workerVersion?:{id?:string;timestamp?:string}};
  expect(version.gitSha).toBe(EXPECTED_SHA);
  expect(version.workerVersion?.id).toBeTruthy();
  expect(version.workerVersion?.timestamp).toBeTruthy();

  const narrationStatusResponse=await request.get(`${BASE}/api/narration-status`);
  expect(narrationStatusResponse.ok()).toBeTruthy();
  const narrationStatus=await narrationStatusResponse.json() as {studioConfigured?:boolean;voice?:string};
  expect(narrationStatus.studioConfigured).toBe(true);
  expect(narrationStatus.voice).toBe('Sulafat');

  await page.goto('/',{waitUntil:'domcontentloaded'});
  const suffix=`${browserName}-${Date.now().toString().slice(-6)}`;
  await page.getByLabel('Имя ученика').fill(`QA34-${suffix}`);
  const pins=page.locator('.account-pin-row input');
  await pins.nth(0).fill('3434');
  await pins.nth(1).fill('3434');
  await page.getByRole('button',{name:'Создать профиль'}).click();

  await expect.poll(async()=>await page.locator('.app-shell').count()+await page.locator('.cloud-ready-card').count(),{timeout:30_000}).toBeGreaterThan(0);
  if(await page.locator('.cloud-ready-card').isVisible().catch(()=>false)){
    await page.getByRole('button',{name:'Я сохранил коды · продолжить'}).click();
  }
  await expect(page.locator('.app-shell')).toBeVisible({timeout:20_000});

  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson34=page.getByRole('button',{name:/Открыть урок 34:/});
  const lesson35=page.locator('.course-lesson-grid > button').nth(34);
  await expect(lesson34).toBeEnabled();
  await expect(lesson35).toBeDisabled();
  await lesson34.click();
  await expect(page.locator('.lesson-opening')).toContainText('Уравнение: как найти неизвестное число');
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l34-mission"]')).toBeVisible();
  await expect(page.locator('.lesson-runtime:not([hidden]) .lesson-controls')).toContainText('Этап 1 из 28');
  await expect(page.locator('.cat-mentor-panel,.cat-mentor-collapsed')).toHaveCount(1);

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:34,stageIndex:27}})));
  await expect(page.locator('[data-stage-id="l34-summary"]')).toBeVisible();
  await expect(page.locator('.lesson-reflection')).toHaveCount(1);
  await expect(page.locator('.extended-practice')).toHaveCount(1);
  await expect(page.locator('.extended-practice[data-practice-task="l34-extra-01"]')).toBeVisible();

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});