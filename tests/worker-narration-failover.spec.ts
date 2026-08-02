import { expect,test } from '@playwright/test';
import worker from '../worker/index';

const version='ru-teacher-gemini-sulafat-v2';
const requestBody={id:'lesson-05-opening',text:'Проверка голоса Sulafat.',version};

function installCacheMock(){
  Object.defineProperty(globalThis,'caches',{configurable:true,value:{default:{match:async()=>undefined,put:async()=>undefined}}});
}

function makeRequest(){return new Request('https://mathnikita.test/api/narration',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(requestBody)})}
const env={GEMINI_API_KEY:'test-gemini-key',ASSETS:{fetch:async()=>new Response('asset')}} as any;
const ctx={waitUntil:()=>undefined,passThroughOnException:()=>undefined} as any;

test('Worker falls back from Gemini Flash TTS to Gemini Pro TTS with the same Sulafat voice',async()=>{
  installCacheMock();const originalFetch=globalThis.fetch;const calls:string[]=[];
  globalThis.fetch=(async(input:RequestInfo|URL)=>{
    const url=String(input);calls.push(url);
    if(url.includes('gemini-2.5-flash-preview-tts'))return new Response(JSON.stringify({error:{code:429,status:'RESOURCE_EXHAUSTED',details:[{'@type':'type.googleapis.com/google.rpc.RetryInfo',retryDelay:'2s'}]}}),{status:429,headers:{'content-type':'application/json'}});
    if(url.includes('gemini-2.5-pro-preview-tts'))return new Response(JSON.stringify({candidates:[{content:{parts:[{inlineData:{mimeType:'audio/L16;codec=pcm;rate=24000',data:'AQIDBA=='}}]}}]}),{status:200,headers:{'content-type':'application/json'}});
    throw new Error(`Unexpected fetch: ${url}`);
  }) as typeof fetch;
  try{
    const response=await worker.fetch(makeRequest(),env,ctx);
    expect(response.status).toBe(200);expect(response.headers.get('content-type')).toContain('audio/wav');expect(response.headers.get('x-mathnikita-provider')).toBe('gemini-pro');expect(response.headers.get('x-mathnikita-voice')).toBe('Sulafat');expect(calls).toHaveLength(2);expect(calls[0]).toContain('gemini-2.5-flash-preview-tts');expect(calls[1]).toContain('gemini-2.5-pro-preview-tts');expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(44);
  }finally{globalThis.fetch=originalFetch}
});

test('Worker preserves rate-limit backoff when both Sulafat Gemini models are busy',async()=>{
  installCacheMock();const originalFetch=globalThis.fetch;const calls:string[]=[];
  globalThis.fetch=(async(input:RequestInfo|URL)=>{const url=String(input);calls.push(url);return new Response(JSON.stringify({error:{code:429,status:'RESOURCE_EXHAUSTED'}}),{status:429,headers:{'content-type':'application/json','retry-after':'3'}})}) as typeof fetch;
  try{
    const response=await worker.fetch(makeRequest(),env,ctx);expect(response.status).toBe(429);expect(response.headers.get('retry-after')).toBe('3');const body=await response.json() as any;expect(body.voice).toBe('Sulafat');expect(body.flash.status).toBe(429);expect(body.pro.status).toBe(429);expect(calls).toHaveLength(2);expect(calls.every(url=>url.includes('generativelanguage.googleapis.com'))).toBe(true);
  }finally{globalThis.fetch=originalFetch}
});
