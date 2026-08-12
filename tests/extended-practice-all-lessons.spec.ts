import {expect,test,type Page} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {extendedPracticeSetResponseCount,type ExtendedPracticeTask} from '../src/data/extendedPracticeTypes';
import {extendedPracticeStorageKey} from '../src/extendedPracticeEngine';
import {practiceNarrationId} from '../src/practiceNarration';

type NarrationRequest={id:string;text:string;version:string};
type VoiceAudit={playedIds:string[];audioPlays:number};

const startLesson=Number(process.env.PRACTICE_START??1);
const endLesson=Number(process.env.PRACTICE_END??27);
const specialStageCounts:Record<number,number>={18:24,20:11,34:28,35:28,36:30,37:29};

async function installNarrationMock(page:Page){
  await page.addInitScript(()=>{
    const audit:VoiceAudit={playedIds:[],audioPlays:0};
    const blobs=new WeakMap<Blob,string>();
    const nativeFetch=window.fetch.bind(window);
    const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
      const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
      if(url.includes('/api/narration-status'))return new Response(JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'}),{status:200,headers:{'content-type':'application/json'}});
      let id='';
      if(url.includes('/api/narration')){
        let raw=init?.body;
        if(raw==null&&input instanceof Request){try{raw=await input.clone().text()}catch{}}
        if(typeof raw==='string'){try{id=(JSON.parse(raw) as NarrationRequest).id??''}catch{}}
        const blob=new Blob(['RIFF-practice'],{type:'audio/wav'});if(id)blobs.set(blob,id);
        return new Response(blob,{status:200,headers:{'content-type':'audio/wav'}});
      }
      return nativeFetch(input,init);
    };
    URL.createObjectURL=(blob:Blob|MediaSource)=>{if(blob instanceof Blob){const id=blobs.get(blob);if(id)return`blob:practice/${encodeURIComponent(id)}`}return nativeCreateObjectURL(blob)};
    class MockAudio{src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(source=''){this.src=source}pause(){}play(){const prefix='blob:practice/';const id=this.src.startsWith(prefix)?decodeURIComponent(this.src.slice(prefix.length)):this.src;audit.playedIds.push(id);audit.audioPlays+=1;window.setTimeout(()=>this.onended?.(),5);return Promise.resolve()}}
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__practiceVoiceAudit:VoiceAudit}).__practiceVoiceAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(',', '.').replace(/−/g,'-').replace(/×|·/g,'*')}
function firstAccepted(task:ExtendedPracticeTask){if(task.type==='choice')return task.answer;if(task.type==='input')return task.answers[0]??'';return''}

async function answerCurrentTask(page:Page,task:ExtendedPracticeTask){
  const practice=page.locator('.extended-practice');
  if(task.type==='choice'){
    await practice.getByRole('button',{name:task.answer,exact:true}).click();
  }else if(task.type==='input'){
    await practice.locator('.extended-practice-input input').fill(firstAccepted(task));
  }else{
    for(const field of task.fields){const input=practice.locator(`[data-field-id="${field.id}"] input`);await input.fill(field.answers[0]??'')}
  }
  await practice.locator('.extended-practice-check').click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();
}

for(let lessonNumber=startLesson;lessonNumber<=endLesson;lessonNumber+=1){
  if(lessonNumber===20||lessonNumber===33)continue;
  test(`lesson ${lessonNumber} completes every mandatory-practice task with Sulafat, persistence and final completion`,async({page})=>{
    test.setTimeout(180_000);
    const practiceSet=extendedPracticeByLesson[lessonNumber];
    expect(practiceSet).toBeTruthy();
    expect(practiceSet.tasks).toHaveLength(20);
    expect(practiceSet.tasks.reduce((total,task)=>total+extendedPracticeSetResponseCount(task),0)).toBeGreaterThanOrEqual(20);
    await installNarrationMock(page);
    await page.goto('/');
    const chapter=page.locator('.course-chapter-group').filter({has:page.getByRole('button',{name:new RegExp(`Открыть урок ${lessonNumber}:`)})});
    if(await chapter.count()){const details=chapter.first();if(!(await details.evaluate(element=>(element as HTMLDetailsElement).open)))await details.locator('summary').click()}
    await page.getByRole('button',{name:new RegExp(`Открыть урок ${lessonNumber}:`)}).click();
    await page.locator('.lesson-opening-start').click();
    const stageCount=specialStageCounts[lessonNumber];
    if(stageCount){await page.evaluate(({lessonNumber,stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex}})),{lessonNumber,stageIndex:stageCount-1})}
    else{
      const summary=page.locator('.stage-summary,.block-summary,.summary-card').first();
      for(let guard=0;guard<60&&!(await summary.isVisible().catch(()=>false));guard+=1){const next=page.locator('.lesson-runtime:not([hidden]) .lesson-controls button:not(:disabled)').last();if(!(await next.isVisible().catch(()=>false)))break;await next.click()}
    }
    await expect(page.locator('.extended-practice')).toBeVisible();
    for(let index=0;index<practiceSet.tasks.length;index+=1){
      const task=practiceSet.tasks[index];
      await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',task.id);
      await answerCurrentTask(page,task);
      const stored=await page.evaluate(key=>localStorage.getItem(key),extendedPracticeStorageKey(lessonNumber));
      expect(stored).toBeTruthy();
      if(index<practiceSet.tasks.length-1)await page.locator('.extended-practice-next').click();
    }
    await expect(page.locator('.extended-practice')).toContainText('Практика завершена');
    const audit=await page.evaluate(()=>(window as unknown as {__practiceVoiceAudit:VoiceAudit}).__practiceVoiceAudit);
    expect(audit.audioPlays).toBeGreaterThan(0);
    const expectedPracticeIds=practiceSet.tasks.map((task,index)=>practiceNarrationId(lessonNumber,task.id,index));
    expect(audit.playedIds.some(id=>expectedPracticeIds.includes(id))).toBeTruthy();
    const finalStored=await page.evaluate(key=>localStorage.getItem(key),extendedPracticeStorageKey(lessonNumber));
    expect(finalStored).toBeTruthy();
    const parsed=JSON.parse(finalStored??'{}') as {completed?:boolean;responses?:Record<string,unknown>};
    expect(parsed.completed).toBe(true);
    expect(Object.keys(parsed.responses??{}).length).toBeGreaterThanOrEqual(20);
    for(const task of practiceSet.tasks){if(task.type==='choice')expect(normalize(String((parsed.responses??{})[task.id]??''))).toBe(normalize(task.answer))}
  });
}
