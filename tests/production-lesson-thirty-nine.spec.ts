import {expect,test} from '@playwright/test';

const EXPECTED_SHA='b8d148a85ae573fa3f287dcfb3a2c2a7376c8a50';
const BASE='https://mathnikita.gunya999.workers.dev';

test('production serves exact lesson 39 release with cloud profile, protractor flow and responsive layout',async({page,request,browserName})=>{
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
  await page.getByLabel('Имя ученика').fill(`QA39-${suffix}`);
  const pins=page.locator('.account-pin-row input');
  await pins.nth(0).fill('3939');
  await pins.nth(1).fill('3939');
  await page.getByRole('button',{name:'Создать профиль'}).click();

  await expect.poll(async()=>await page.locator('.app-shell').count()+await page.locator('.cloud-ready-card').count(),{timeout:30_000}).toBeGreaterThan(0);
  if(await page.locator('.cloud-ready-card').isVisible().catch(()=>false))await page.getByRole('button',{name:'Я сохранил коды · продолжить'}).click();
  await expect(page.locator('.app-shell')).toBeVisible({timeout:20_000});

  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await expect(page.getByText('Полностью готовы 39 интерактивных уроков.')).toBeVisible();
  const lesson39=page.getByRole('button',{name:/Открыть урок 39:/});
  const lesson40=page.locator('.course-lesson-grid > button').nth(39);
  await expect(lesson39).toBeEnabled();
  await expect(lesson40).toBeDisabled();
  await lesson39.click();
  await expect(page.locator('.lesson-opening')).toContainText('Виды углов. Измерение углов');
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l39-mission"]')).toBeVisible();
  await expect(page.locator('.lesson-runtime:not([hidden]) .lesson-controls')).toContainText('Этап 1 из 35');
  await expect(page.locator('.lesson-runtime:not([hidden]) .angle-diagram svg')).toBeVisible();
  await expect(page.locator('.cat-mentor-panel,.cat-mentor-collapsed')).toHaveCount(1);

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:39,stageIndex:34}})));
  await expect(page.locator('[data-stage-id="l39-summary"]')).toBeVisible();
  await expect(page.locator('.lesson-reflection')).toHaveCount(1);
  await expect(page.locator('.extended-practice')).toHaveCount(1);
  await expect(page.locator('.extended-practice[data-practice-task="l39-extra-01"]')).toBeVisible();

  const practice=page.locator('.extended-practice');
  await practice.getByRole('button',{name:'Угол, стороны которого — противоположные лучи',exact:true}).click();
  await practice.locator('.extended-practice-check').click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
