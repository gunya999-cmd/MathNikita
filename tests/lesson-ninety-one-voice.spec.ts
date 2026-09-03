import {expect,test} from '@playwright/test';

type Payload={id?:string;text?:string;version?:string};

function speechProblems(text:string){
  const problems:string[]=[];
  if(!text.trim())problems.push('empty');
  if(/[A-Za-z]/.test(text))problems.push('raw Latin');
  if(/[§№=+×*·÷<>≤≥→↔²³^%°−∠αβγδ]/i.test(text))problems.push('raw math');
  if(/\d+\s*\/\s*\d+/.test(text))problems.push('raw fraction');
  return problems;
}

test('lesson 91 sends clean Russian opening and stage narration to Sulafat',async({page})=>{
  const payloads=new Map<string,string>();
  await page.addInitScript(()=>{
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:0.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{
    const payload=(route.request().postDataJSON()??{}) as Payload;
    if(payload.id&&payload.text)payloads.set(payload.id,payload.text);
    await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-lesson-91-audit'});
  });
  await page.goto('/');
  const open=page.locator('button[aria-label^="Открыть урок 91:"]');
  await open.evaluate((node:HTMLButtonElement)=>node.click());
  const voiceButton=page.locator('.voice-narrator > button').first();
  await voiceButton.click();
  await expect.poll(()=>payloads.get('lesson-91-opening')??'').not.toBe('');
  const opening=payloads.get('lesson-91-opening')??'';
  expect(speechProblems(opening),opening).toEqual([]);
  expect(opening).toContain('обыкновенной дроби');

  await page.locator('.lesson-opening-start').click();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:91,stageIndex:9}})));
  const narrationId='lesson-91-stage-l91-practice-01';
  await expect.poll(()=>payloads.get(narrationId)??'',{timeout:5000}).not.toBe('');
  const sourcePayload=payloads.get(narrationId)??'';
  expect(speechProblems(sourcePayload),sourcePayload).toEqual([]);
  expect(sourcePayload).toContain('32 ученика');
  expect(sourcePayload).toContain('Семеро получили оценку');
  expect(sourcePayload).not.toContain('7/32');
});
