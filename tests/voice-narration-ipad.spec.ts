import { expect, test, type Page } from '@playwright/test';

const lessonEighteenStageIds=[
  'l18-mission',
  'l18-diagnostic',
  'l18-system',
  'l18-practice1',
  'l18-practice2',
  'l18-signs-model',
  'l18-practice3',
  'l18-double-model',
  'l18-practice4',
  'l18-boundaries',
  'l18-practice5',
  'l18-practice6',
  'l18-ray-model',
  'l18-units-model',
  'l18-transfer',
  'l18-error-check',
  'l18-quiz1',
  'l18-quiz2',
  'l18-quiz3',
  'l18-quiz4',
  'l18-quiz5',
  'l18-challenge',
  'l18-reflection',
  'l18-summary',
] as const;

type SpeechEntry={text:string;lang:string;voiceURI:string|null;voiceName:string|null;rate:number;pitch:number};

async function installSpeechAudit(page:Page){
  await page.addInitScript(()=>{
    const audit={log:[] as SpeechEntry[],cancelCount:0};
    const voices=[
      {name:'Ava Premium',lang:'en-US',voiceURI:'en-premium',localService:true,default:false},
      {name:'Русский Compact',lang:'ru-RU',voiceURI:'ru-compact',localService:true,default:false},
      {name:'Milena Enhanced',lang:'ru-RU',voiceURI:'ru-enhanced',localService:true,default:true},
    ];
    class MockUtterance{
      text:string;lang='';voice:(typeof voices)[number]|null=null;rate=1;pitch=1;volume=1;
      onend:(()=>void)|null=null;onerror:(()=>void)|null=null;
      constructor(text=''){this.text=text}
    }
    const listeners=new Map<string,Set<()=>void>>();
    const synthesis={
      getVoices:()=>voices,
      speak:(utterance:MockUtterance)=>audit.log.push({text:utterance.text,lang:utterance.lang,voiceURI:utterance.voice?.voiceURI??null,voiceName:utterance.voice?.name??null,rate:utterance.rate,pitch:utterance.pitch}),
      cancel:()=>{audit.cancelCount+=1},
      pause:()=>undefined,
      resume:()=>undefined,
      get speaking(){return false},get pending(){return false},get paused(){return false},
      addEventListener:(name:string,handler:()=>void)=>{const group=listeners.get(name)??new Set<()=>void>();group.add(handler);listeners.set(name,group)},
      removeEventListener:(name:string,handler:()=>void)=>listeners.get(name)?.delete(handler),
      dispatchEvent:(event:Event)=>{listeners.get(event.type)?.forEach(handler=>handler());return true},
    };
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
    (window as unknown as {__speechAudit:typeof audit}).__speechAudit=audit;
    try{localStorage.setItem('mathnikita-voice-settings-v3',JSON.stringify({engine:'system',voiceURI:'en-premium',rate:.94}))}catch{}
  });
}

async function clearSpeech(page:Page){await page.evaluate(()=>{(window as unknown as {__speechAudit:{log:SpeechEntry[]}}).__speechAudit.log=[]})}
async function speechLog(page:Page){return page.evaluate(()=>(window as unknown as {__speechAudit:{log:SpeechEntry[]}}).__speechAudit.log)}

async function assertNaturalRussianSpeech(page:Page,previousCount=0){
  await expect.poll(async()=>(await speechLog(page)).length).toBeGreaterThan(previousCount);
  const log=await speechLog(page);const entry=log.at(-1)!;
  expect(entry.voiceURI).toBe('ru-enhanced');
  expect(entry.voiceName).toBe('Milena Enhanced');
  expect(entry.lang).toBe('ru-RU');
  expect(entry.rate).toBeCloseTo(.94,5);
  expect(entry.pitch).toBe(1);
  expect(entry.text).toMatch(/[А-Яа-яЁё]/);
  expect(entry.text).not.toMatch(/[§№]/);
  return log.length;
}

async function openLesson(page:Page,lessonNumber:number){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(19);
  await lessons.nth(lessonNumber-1).click();
  await expect(page.locator('.lesson-opening-start')).toBeVisible();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-voice-settings-v3')??'{}').voiceURI)).toBe('ru-enhanced');
}

async function playNarrator(page:Page){
  const narrator=page.locator('.voice-narrator > button').first();
  await narrator.click();
  await expect(narrator).toContainText('Остановить');
  return narrator;
}

async function auditMentorExclusion(page:Page){
  const narrator=page.locator('.voice-narrator > button').first();
  const collapsed=page.locator('.cat-mentor-collapsed');
  if(await collapsed.isVisible())await collapsed.click();
  const mentor=page.locator('.cat-mentor-speak');
  await expect(mentor).toBeVisible();

  await clearSpeech(page);
  await narrator.click();
  await assertNaturalRussianSpeech(page);
  await mentor.click();
  await assertNaturalRussianSpeech(page,1);
  await expect(narrator).toContainText('Слушать');
  await expect(mentor).toHaveAttribute('aria-label','Остановить реплику');

  await narrator.click();
  await assertNaturalRussianSpeech(page,2);
  await expect(mentor).toHaveAttribute('aria-label','Озвучить реплику');
  await expect(narrator).toContainText('Остановить');
  await narrator.click();
}

test('every ready lesson uses natural Russian narration without overlapping the mentor',async({page})=>{
  test.setTimeout(540_000);
  await installSpeechAudit(page);

  for(let lessonNumber=1;lessonNumber<=19;lessonNumber+=1){
    await openLesson(page,lessonNumber);

    await clearSpeech(page);
    let narrator=await playNarrator(page);
    await assertNaturalRussianSpeech(page);
    await narrator.click();

    await page.locator('.lesson-opening-start').click();
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
    await expect(stage).toBeVisible();

    const counterText=lessonNumber===18?'':await page.locator('.lesson-runtime:not([hidden]) .stage-counter').textContent();
    const total=lessonNumber===18?lessonEighteenStageIds.length:Number(counterText?.match(/из\s+(\d+)/i)?.[1]??1);
    const indexes=lessonNumber===1?[0]:Array.from({length:total},(_,index)=>index);

    for(const stageIndex of indexes){
      if(stageIndex>0){
        await page.evaluate(({lessonNumber,stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex}})),{lessonNumber,stageIndex});
        if(lessonNumber===18)await expect(stage).toHaveAttribute('data-stage-id',lessonEighteenStageIds[stageIndex]);
        else await expect(page.locator('.lesson-runtime:not([hidden]) .stage-counter')).toContainText(`Этап ${stageIndex+1} из`);
      }
      await clearSpeech(page);
      narrator=await playNarrator(page);
      await assertNaturalRussianSpeech(page);
      await narrator.click();
    }

    await page.evaluate(({lessonNumber})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex:0}})),{lessonNumber});
    await expect(stage).toBeVisible();
    await auditMentorExclusion(page);
  }
});
