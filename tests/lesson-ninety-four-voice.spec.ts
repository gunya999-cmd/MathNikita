import {expect,test} from '@playwright/test';

type Payload={id?:string;text?:string;version?:string};

function speechProblems(text:string){
  const problems:string[]=[];
  if(!text.trim())problems.push('empty');
  if(/[A-Za-z]/.test(text))problems.push('raw Latin');
  if(/[§№=+×*·÷<>≤≥→↔²³^%°−∠αβγδ]/i.test(text))problems.push('raw math');
  if(/\d+\s*\/\s*\d+/.test(text))problems.push('raw fraction');
  if(text.includes('\uFFFD'))problems.push('replacement character');
  if(/ {2,}/.test(text))problems.push('repeated spaces');
  return problems;
}

async function dispatchStage(page:import('@playwright/test').Page,stageIndex:number){
  await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:94,stageIndex:index}})),stageIndex);
}

test('lesson 94 sends clean Russian opening and every internal stage narration to Sulafat',async({page})=>{
  const payloads=new Map<string,string>();
  await page.addInitScript(()=>{
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:0.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{
    const payload=(route.request().postDataJSON()??{}) as Payload;
    if(payload.id&&payload.text)payloads.set(payload.id,payload.text);
    await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-lesson-94-audit'});
  });

  await page.goto('/');
  await page.locator('button[aria-label^="Открыть урок 94:"]').evaluate((node:HTMLButtonElement)=>node.click());
  const voiceButton=page.locator('.voice-narrator > button').first();
  await voiceButton.click();
  await expect.poll(()=>payloads.get('lesson-94-opening')??'').not.toBe('');
  const opening=payloads.get('lesson-94-opening')??'';
  expect(speechProblems(opening),opening).toEqual([]);
  expect(opening.toLocaleLowerCase('ru-RU')).toContain('дроб');

  await page.locator('.lesson-opening-start').click();
  const activeStage=page.locator('.interactive-stage[data-stage-id]').first();
  await expect(activeStage).toBeVisible();
  const seen=new Set<string>();
  const violations:string[]=[];
  let previous='';
  for(let index=0;index<60;index+=1){
    await dispatchStage(page,index);
    if(index===0)await expect(activeStage).toHaveAttribute('data-stage-id',/.+/);
    else{
      try{await expect.poll(async()=>await activeStage.getAttribute('data-stage-id'),{timeout:1200,intervals:[25,50,100]}).not.toBe(previous)}catch{
        const clamped=await activeStage.getAttribute('data-stage-id');
        await dispatchStage(page,index+1);await page.waitForTimeout(120);
        expect(await activeStage.getAttribute('data-stage-id'),'out-of-range jumps must clamp to final stage').toBe(clamped);
        break;
      }
    }
    const stageId=await activeStage.getAttribute('data-stage-id');
    expect(stageId).toBeTruthy();
    if(!stageId||seen.has(stageId))break;
    seen.add(stageId);previous=stageId;
    const narrationId=`lesson-94-stage-${stageId}`;
    await expect.poll(()=>payloads.get(narrationId)??'',{timeout:5000,intervals:[50,100,200]}).not.toBe('');
    const text=payloads.get(narrationId)??'';
    const problems=speechProblems(text);
    if(problems.length)violations.push(`${stageId}: ${problems.join(', ')} :: ${text}`);
  }
  expect(seen.size,'lesson 94 must expose all 30 internal stages').toBe(30);
  expect(violations.join('\n')).toBe('');
  const source701=payloads.get('lesson-94-stage-l94-practice-01')??'';
  expect(source701.toLocaleLowerCase('ru-RU')).toContain('прямого угла');
  expect(source701).not.toContain('7/18');
  const source703=payloads.get('lesson-94-stage-l94-practice-02')??'';
  expect(source703.toLocaleLowerCase('ru-RU')).toContain('яхта');
});
