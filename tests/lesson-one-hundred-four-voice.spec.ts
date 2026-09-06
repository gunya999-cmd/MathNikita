import {expect,test} from '@playwright/test';
type Payload={id?:string;text?:string};
function speechProblems(text:string){const problems:string[]=[];if(!text.trim())problems.push('empty');if(/[A-Za-z]/.test(text))problems.push('raw Latin');if(/[§№=+×*·÷<>≤≥→↔²³^%°−∠αβγδ]/i.test(text))problems.push('raw math');if(/\d+\s*\/\s*\d+/.test(text))problems.push('raw fraction');if(text.includes('\uFFFD'))problems.push('replacement character');if(/ {2,}/.test(text))problems.push('repeated spaces');return problems}
async function jump(page:import('@playwright/test').Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:104,stageIndex:index}})),stageIndex)}

test('lesson 104 sends clean Russian opening and all 29 stage payloads to Sulafat',async({page})=>{
  const payloads=new Map<string,string>();
  await page.addInitScript(()=>{localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:0.94}));localStorage.setItem('mathnikita-mentor-auto-guide','false')});
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{const payload=(route.request().postDataJSON()??{}) as Payload;if(payload.id&&payload.text)payloads.set(payload.id,payload.text);await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-lesson-104-audit'})});
  await page.goto('/');await page.locator('button[aria-label^="Открыть урок 104:"]').evaluate((node:HTMLButtonElement)=>node.click());await page.locator('.voice-narrator > button').first().click();
  await expect.poll(()=>payloads.get('lesson-104-opening')??'').not.toBe('');const opening=payloads.get('lesson-104-opening')??'';expect(speechProblems(opening),opening).toEqual([]);
  await page.locator('.lesson-opening-start').click();const active=page.locator('.interactive-stage[data-stage-id]').first();await expect(active).toBeVisible();const seen=new Set<string>();const violations:string[]=[];let previous='';
  for(let index=0;index<50;index+=1){await jump(page,index);if(index>0){try{await expect.poll(async()=>await active.getAttribute('data-stage-id'),{timeout:1200,intervals:[25,50,100]}).not.toBe(previous)}catch{break}}const stageId=await active.getAttribute('data-stage-id');if(!stageId||seen.has(stageId))break;seen.add(stageId);previous=stageId;const narrationId=`lesson-104-stage-${stageId}`;await expect.poll(()=>payloads.get(narrationId)??'',{timeout:5000,intervals:[50,100,200]}).not.toBe('');const text=payloads.get(narrationId)??'';const problems=speechProblems(text);if(problems.length)violations.push(`${stageId}: ${problems.join(', ')} :: ${text}`)}
  expect(seen.size).toBe(29);expect(violations.join('\n')).toBe('');
});
