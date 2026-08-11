import {expect,test} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

test('authenticated iPad catalog stays inside the viewport with lesson 32 ready',async({page})=>{
  const student={id:'ipad-layout-student',name:'Никита',code:'MN-IPAD32'};
  let revision=12;
  let entries:Record<string,string>={'mathnikita:ipad-layout-marker':'cloud-restored'};

  await page.route('**/api/cloud/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,configured:true})}));
  await page.route('**/api/cloud/login',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student,token:'token-ipad-layout-123456789',revision,entries})}));
  await page.route('**/api/cloud/snapshot',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student,revision,entries})}));
  await page.route('**/api/cloud/sync',async route=>{
    const body=route.request().postDataJSON() as {changes?:Record<string,string|null>};
    for(const[key,value]of Object.entries(body.changes??{})){if(value===null)delete entries[key];else entries[key]=value}
    revision+=1;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revision,updatedAt:new Date().toISOString()})});
  });

  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Уже есть код ученика/}).click();
  await page.getByLabel('Код ученика').fill('MN-IPAD32');
  await page.getByLabel('PIN облачного профиля').fill('4321');
  await page.getByRole('button',{name:'Войти и загрузить прогресс'}).click();
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Никита/})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:ipad-layout-marker'))).toBe('cloud-restored');

  await expect(page.getByText('Полностью готовы 32 интерактивных урока.')).toBeVisible();
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await expect(page.getByRole('button',{name:/Открыть урок 32:/})).toBeEnabled();
  await expect(page.locator('.course-lesson-grid > button').nth(32)).toBeDisabled();

  const layout=await page.evaluate(()=>{
    const viewport=document.documentElement.clientWidth;
    const topbar=document.querySelector('.topbar')?.getBoundingClientRect();
    const offenders=Array.from(document.querySelectorAll<HTMLElement>('body *')).map(element=>{
      const rect=element.getBoundingClientRect();
      return{tag:element.tagName,className:typeof element.className==='string'?element.className:'',left:rect.left,right:rect.right,width:rect.width};
    }).filter(item=>item.right>viewport+2||item.left<-2).slice(0,12);
    return{overflow:document.documentElement.scrollWidth-viewport,viewport,topbarRight:topbar?.right??0,offenders};
  });
  expect(layout.overflow,JSON.stringify(layout.offenders)).toBeLessThanOrEqual(2);
  expect(layout.topbarRight).toBeLessThanOrEqual(layout.viewport+2);
});
