import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {prepareRussianSpeechText} from '../src/voiceQuality';

// Isolate the module's shared caches and control every network settlement.
const compiled=ts.transpileModule(readFileSync(new URL('../src/studioVoice.ts',import.meta.url),'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText;
type Voice=typeof import('../src/studioVoice');
type Request={id:string;text:string;signal:AbortSignal;resolve:()=>void;reject:(error:Error)=>void};
function fixture(){
  const events=new EventTarget();
  const requests:Request[]=[];
  let blobs=0;
  const exports={} as Voice;
  runInNewContext(compiled,{
    exports,
    require:()=>({prepareRussianSpeechText}),
    window:Object.assign(events,{setTimeout,clearTimeout}),
    AbortController,
    URL:{createObjectURL:()=>`blob:test-${++blobs}`},
    fetch:(_url:string,init:RequestInit)=>new Promise<Response>((resolve,reject)=>{
      requests.push({...JSON.parse(init.body as string),signal:init.signal as AbortSignal,
        resolve:()=>resolve(new Response(new Blob(['audio'],{type:'audio/wav'}),{headers:{'content-type':'audio/wav'}})),reject});
    }),
  });
  return{voice:exports,requests,
    stop:()=>events.dispatchEvent(new Event('mathnikita-stop-narration')),
    foreground:(id:string,source='narrator')=>events.dispatchEvent(new CustomEvent('mathnikita-audio-request',{detail:{source,narrationId:id}})),
  };
}
const flush=()=>new Promise<void>(resolve=>setImmediate(resolve));

test('playback stop keeps the exact normalized warm request available to foreground',async()=>{
  const {voice,requests,stop,foreground}=fixture();
  const id='lesson-79-stage-l79-mission';
  voice.prefetchStudioAudioUrl(id,'  Текущий текст.  ');
  await flush();
  stop();foreground(id);
  const playback=voice.getStudioAudioUrl(id,'Текущий текст.');
  await flush();
  expect(requests).toHaveLength(1);
  expect(requests[0].signal.aborted).toBe(false);
  requests[0].resolve();
  expect(await playback).toBe('blob:test-1');
  expect(await voice.getStudioAudioUrl(id,'Текущий текст.')).toBe('blob:test-1');
  expect(requests).toHaveLength(1);
});

for(const settlement of ['reject','resolve'] as const){
  test(`late ${settlement} of cancelled generation cannot evict or overwrite its replacement`,async()=>{
    const {voice,requests,foreground}=fixture();
    const id='lesson-79-stage-l79-mission';
    const old=voice.getStudioAudioUrl(id,'Текст').catch(error=>error.name);
    await flush();
    foreground('lesson-79-stage-next');
    expect(requests[0].signal.aborted).toBe(true);
    const replacement=voice.getStudioAudioUrl(id,'Текст');
    await flush();
    expect(requests).toHaveLength(2);
    if(settlement==='reject')requests[0].reject(Object.assign(new Error('cancelled'),{name:'AbortError'}));
    else requests[0].resolve(); // Some transports finish the body after cancellation.
    expect(await old).toBe('AbortError');
    expect(voice.peekStudioAudioUrl(id,'Текст')).toBeUndefined();
    const joined=voice.getStudioAudioUrl(id,'Текст');
    await flush();
    expect(requests).toHaveLength(2);
    requests[1].resolve();
    expect(await replacement).toBe('blob:test-1');
    expect(await joined).toBe('blob:test-1');
    expect(voice.peekStudioAudioUrl(id,'Текст')).toBe('blob:test-1');
  });
}

test('same id with changed text has a separate cache entry and audio groups stay independent',async()=>{
  const {voice,requests,foreground,stop}=fixture();
  const id='mentor-visible-hint';
  voice.prefetchVisibleMentorAudioUrl(id,'Первая подсказка');
  await flush();
  foreground('lesson-79-stage-l79-mission');stop();
  const changed=voice.getStudioAudioUrl(id,'Другая подсказка',true);
  await flush();
  expect(requests).toHaveLength(2);
  expect(requests[0].signal.aborted).toBe(false);
  requests[0].resolve();requests[1].resolve();
  const changedUrl=await changed;
  expect(await voice.getStudioAudioUrl(id,'Первая подсказка',true)).not.toBe(changedUrl);
  expect(requests).toHaveLength(2);
});
