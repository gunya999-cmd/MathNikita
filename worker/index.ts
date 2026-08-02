type TutorRequest={message?:string;profile?:unknown;diagnosticSummary?:unknown};
type NarrationRequest={id?:string;text?:string;version?:string};
type Env={ASSETS:Fetcher;OPENAI_API_KEY?:string;GEMINI_API_KEY?:string};
type AiResult={ok:boolean;provider?:'gemini'|'openai';answer?:string;status?:number;error?:string};
type NarrationProvider='gemini-flash'|'gemini-pro';
type NarrationAudio={ok:true;provider:NarrationProvider;body:ArrayBuffer;contentType:string}|{ok:false;provider:NarrationProvider;status?:number;error:string;retryAfterMs?:number};

const TUTOR_SYSTEM_PROMPT=[
  'Ты AI-репетитор по математике для школьника.',
  'Отвечай по-русски, спокойно, коротко и пошагово.',
  'Главный приоритет — последнее сообщение ученика в поле message.',
  'diagnosticSummary и profile используй только как вторичный контекст: не меняй тему на слабую тему диагностики, если ученик спросил о другом.',
  'Если сообщение очень короткое, например "%", считай, что ученик просит объяснить проценты.',
  'Не давай просто ответ: объясни ход решения и задай один проверочный вопрос.',
  'Не начинай длинные лекции не по теме вопроса.',
].join(' ');

const GEMINI_TTS_MODEL='gemini-2.5-flash-preview-tts';
const GEMINI_TTS_FALLBACK_MODEL='gemini-2.5-pro-preview-tts';
const GEMINI_TTS_VOICE='Sulafat';
const NARRATION_VERSION='ru-teacher-gemini-sulafat-v2';
const NARRATION_MAX_CHARS=3500;
const NARRATION_ID=/^(?:lesson-\d{2}-(?:opening|reflection|stage-[a-z0-9-]+|practice-[a-z0-9-]+)|mentor-[a-z0-9-]+)$/i;
const GEMINI_FALLBACK_STATUSES=new Set([408,425,429,500,502,503,504]);
const NARRATION_STYLE=[
  'Синтезируй только приведённый ниже текст. Не произноси эти инструкции вслух.',
  'Говори по-русски как живой, спокойный и доброжелательный преподаватель математики для ребёнка 10–12 лет.',
  'Голос тёплый, естественный и уверенный, без роботизированной манеры, без рекламы и без театральности.',
  'Темп умеренный. Интонация разговорная. Дикция ясная.',
  'Числа, математические действия и обозначения произноси особенно отчётливо.',
  'Между смысловыми частями делай короткие естественные паузы.',
].join(' ');

function json(data:unknown,init:ResponseInit={}){
  return new Response(JSON.stringify(data),{...init,headers:{'content-type':'application/json; charset=utf-8',...init.headers}});
}

function fallbackTutor(message:string){
  const normalized=message.toLowerCase();
  if(normalized.includes('дроб')||normalized.includes('fraction'))return'Разберём дроби по шагам. Дробь показывает часть целого. Например, 8/12 можно сократить: 8 и 12 делятся на 4, значит 8/12 = 2/3. Попробуй сам: сократи 10/15.';
  if(normalized.includes('процент')||normalized.includes('%')||normalized.includes('скид'))return'Процент — это часть от 100. Например, 25% = 1/4. Если цена 120 ₪ и скидка 25%, то скидка 120 / 4 = 30, новая цена 120 − 30 = 90.';
  if(normalized.includes('уравн')||normalized.includes('x'))return'В уравнении нужно оставить x один. Например: x + 9 = 20. Вычитаем 9 из обеих частей: x = 20 − 9 = 11.';
  return'Я готов помочь. Напиши задачу по математике, и я объясню её коротко, по шагам, с примером и проверочным вопросом.';
}

function normalizeTutorMessage(message:string){const trimmed=message.trim();return trimmed==='%'?'Объясни проценты: что значит процент и как найти 25% от 120.':trimmed}
function makeTutorInput(message:string,profile:unknown,diagnosticSummary:unknown){return JSON.stringify({message:normalizeTutorMessage(message),originalMessage:message,profile,diagnosticSummary,instruction:'Ответь именно на message. Диагностику используй только для выбора простоты объяснения.'})}

async function askGemini(env:Env,message:string,profile:unknown,diagnosticSummary:unknown):Promise<AiResult>{
  if(!env.GEMINI_API_KEY)return{ok:false,provider:'gemini',error:'missing_gemini_key'};
  try{
    const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',{
      method:'POST',headers:{'x-goog-api-key':env.GEMINI_API_KEY,'content-type':'application/json'},
      body:JSON.stringify({systemInstruction:{parts:[{text:TUTOR_SYSTEM_PROMPT}]},contents:[{parts:[{text:makeTutorInput(message,profile,diagnosticSummary)}]}],generationConfig:{temperature:.3,maxOutputTokens:700}}),
    });
    const rawText=await response.text();
    if(!response.ok)return{ok:false,provider:'gemini',status:response.status,error:rawText.slice(0,500)};
    const data=JSON.parse(rawText) as any;const answer=data?.candidates?.[0]?.content?.parts?.map((part:any)=>part?.text??'').join('').trim();
    return answer?{ok:true,provider:'gemini',answer}:{ok:false,provider:'gemini',status:response.status,error:'empty_gemini_answer'};
  }catch(error){return{ok:false,provider:'gemini',error:error instanceof Error?error.message:'unknown_gemini_error'}}
}

async function askOpenAi(env:Env,message:string,profile:unknown,diagnosticSummary:unknown):Promise<AiResult>{
  if(!env.OPENAI_API_KEY)return{ok:false,provider:'openai',error:'missing_openai_key'};
  try{
    const response=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',headers:{authorization:`Bearer ${env.OPENAI_API_KEY}`,'content-type':'application/json'},
      body:JSON.stringify({model:'gpt-4.1-mini',temperature:.3,messages:[{role:'system',content:TUTOR_SYSTEM_PROMPT},{role:'user',content:makeTutorInput(message,profile,diagnosticSummary)}]}),
    });
    const rawText=await response.text();
    if(!response.ok)return{ok:false,provider:'openai',status:response.status,error:rawText.slice(0,500)};
    const data=JSON.parse(rawText) as any;const answer=data?.choices?.[0]?.message?.content;
    return answer?{ok:true,provider:'openai',answer}:{ok:false,provider:'openai',status:response.status,error:'empty_openai_answer'};
  }catch(error){return{ok:false,provider:'openai',error:error instanceof Error?error.message:'unknown_openai_error'}}
}

async function askBestProvider(env:Env,message:string,profile:unknown,diagnosticSummary:unknown):Promise<AiResult>{
  const gemini=await askGemini(env,message,profile,diagnosticSummary);if(gemini.ok)return gemini;
  const openai=await askOpenAi(env,message,profile,diagnosticSummary);if(openai.ok)return openai;
  return{ok:false,error:`gemini:${gemini.status??gemini.error}; openai:${openai.status??openai.error}`};
}

async function handleTutor(request:Request,env:Env){
  if(request.method!=='POST')return json({error:'Method not allowed'},{status:405});
  let body:TutorRequest;try{body=await request.json() as TutorRequest}catch{return json({error:'Invalid JSON'},{status:400})}
  const message=String(body.message??'').trim();if(!message)return json({error:'Message is required'},{status:400});
  const ai=await askBestProvider(env,message,body.profile??null,body.diagnosticSummary??null);
  if(!ai.ok)return json({answer:fallbackTutor(message),mode:'fallback',warning:ai.error});
  return json({answer:ai.answer,mode:'ai',provider:ai.provider});
}

async function sha256(value:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('')}
function decodeBase64(value:string){const binary=atob(value);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i+=1)bytes[i]=binary.charCodeAt(i);return bytes}
function writeAscii(view:DataView,offset:number,value:string){for(let i=0;i<value.length;i+=1)view.setUint8(offset+i,value.charCodeAt(i))}
function pcm16MonoToWav(pcm:Uint8Array,sampleRate=24000){
  const buffer=new ArrayBuffer(44+pcm.byteLength);const view=new DataView(buffer);const channels=1;const bits=16;const bytesPerSample=bits/8;const byteRate=sampleRate*channels*bytesPerSample;
  writeAscii(view,0,'RIFF');view.setUint32(4,36+pcm.byteLength,true);writeAscii(view,8,'WAVE');writeAscii(view,12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,sampleRate,true);view.setUint32(28,byteRate,true);view.setUint16(32,channels*bytesPerSample,true);view.setUint16(34,bits,true);writeAscii(view,36,'data');view.setUint32(40,pcm.byteLength,true);new Uint8Array(buffer,44).set(pcm);return buffer;
}
function geminiNarrationPrompt(text:string){return `${NARRATION_STYLE}\n\nТЕКСТ ДЛЯ ОЗВУЧКИ — прочитай дословно и только его:\n${text}`}
function narrationProvider(model:string):NarrationProvider{return model===GEMINI_TTS_FALLBACK_MODEL?'gemini-pro':'gemini-flash'}
function retryAfterFromResponse(response:Response,rawText:string){
  const header=Number(response.headers.get('retry-after'));const headerMs=Number.isFinite(header)&&header>0?header*1000:0;
  const match=rawText.match(/"retryDelay"\s*:\s*"([0-9.]+)s"/i);const bodyMs=match?Number(match[1])*1000:0;
  return Math.max(headerMs,Number.isFinite(bodyMs)?bodyMs:0)||undefined;
}

async function generateGeminiNarration(env:Env,text:string,model:string):Promise<NarrationAudio>{
  const provider=narrationProvider(model);if(!env.GEMINI_API_KEY)return{ok:false,provider,error:'missing_gemini_key'};
  try{
    const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:'POST',headers:{'x-goog-api-key':env.GEMINI_API_KEY,'content-type':'application/json'},
      body:JSON.stringify({contents:[{parts:[{text:geminiNarrationPrompt(text)}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:GEMINI_TTS_VOICE}}}}}),
    });
    const rawText=await response.text();
    if(!response.ok)return{ok:false,provider,status:response.status,error:rawText.slice(0,500),retryAfterMs:retryAfterFromResponse(response,rawText)};
    const data=JSON.parse(rawText) as any;const inline=data?.candidates?.[0]?.content?.parts?.find((part:any)=>part?.inlineData?.data)?.inlineData;
    if(!inline?.data)return{ok:false,provider,status:response.status,error:'empty_gemini_audio'};
    const bytes=decodeBase64(String(inline.data));const mime=String(inline.mimeType??'audio/L16;codec=pcm;rate=24000');
    if(/pcm|L16/i.test(mime)){const rate=Number(mime.match(/rate=(\d+)/i)?.[1]??24000);return{ok:true,provider,body:pcm16MonoToWav(bytes,rate),contentType:'audio/wav'}}
    return{ok:true,provider,body:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:mime.split(';')[0]||'audio/wav'};
  }catch(error){return{ok:false,provider,error:error instanceof Error?error.message:'unknown_gemini_tts_error'}}
}

function shouldTryGeminiFallback(result:NarrationAudio){return !result.ok&&(result.status===undefined||result.status===200||GEMINI_FALLBACK_STATUSES.has(result.status))}
function narrationHeaders(provider:string,contentType:string,cacheState:'hit'|'miss'){
  return{'content-type':contentType,'cache-control':'public, max-age=31536000, immutable','x-mathnikita-narration':NARRATION_VERSION,'x-mathnikita-provider':provider,'x-mathnikita-voice':GEMINI_TTS_VOICE,'x-mathnikita-cache':cacheState};
}

async function handleNarration(request:Request,env:Env,ctx:ExecutionContext){
  if(request.method!=='POST')return json({error:'Method not allowed'},{status:405});
  if(!env.GEMINI_API_KEY)return json({error:'Sulafat narration is not configured',provider:'gemini',voice:GEMINI_TTS_VOICE},{status:503});
  const requestUrl=new URL(request.url);const origin=request.headers.get('origin');if(origin&&origin!==requestUrl.origin)return json({error:'Cross-origin narration is not allowed'},{status:403});
  let body:NarrationRequest;try{body=await request.json() as NarrationRequest}catch{return json({error:'Invalid JSON'},{status:400})}
  const id=String(body.id??'').trim();const text=String(body.text??'').replace(/\s+/g,' ').trim();
  if(!NARRATION_ID.test(id))return json({error:'Invalid narration id'},{status:400});
  if(!text||text.length>NARRATION_MAX_CHARS)return json({error:`Narration text must be 1-${NARRATION_MAX_CHARS} characters`},{status:400});
  if(body.version&&body.version!==NARRATION_VERSION)return json({error:'Unsupported narration voice version',expected:NARRATION_VERSION},{status:409});
  const digest=await sha256(`${NARRATION_VERSION}|${id}|${text}`);const cacheKey=new Request(`${requestUrl.origin}/__narration-cache/${NARRATION_VERSION}/${digest}`,{method:'GET'});const cached=await caches.default.match(cacheKey);
  if(cached){const headers=new Headers(cached.headers);headers.set('x-mathnikita-cache','hit');return new Response(cached.body,{status:200,headers})}
  const flash=await generateGeminiNarration(env,text,GEMINI_TTS_MODEL);let audio:NarrationAudio=flash;let pro:NarrationAudio|null=null;
  if(!flash.ok&&shouldTryGeminiFallback(flash)){pro=await generateGeminiNarration(env,text,GEMINI_TTS_FALLBACK_MODEL);if(pro.ok)audio=pro;else audio=pro}
  if(!audio.ok){
    const errors=[flash,pro].filter(Boolean) as Extract<NarrationAudio,{ok:false}>[];const retryAfterMs=Math.max(0,...errors.map(item=>item.retryAfterMs??0));
    const status=errors.some(item=>item.status===429)?429:errors.some(item=>item.status===503)?503:502;const headers:Record<string,string>={'cache-control':'no-store'};
    if(retryAfterMs>0)headers['retry-after']=String(Math.max(1,Math.ceil(retryAfterMs/1000)));
    return json({error:'Sulafat narration temporarily unavailable',voice:GEMINI_TTS_VOICE,flash:flash.ok?{ok:true}:{status:flash.status,error:flash.error},pro:pro?(pro.ok?{ok:true}:{status:pro.status,error:pro.error}):{skipped:true}},{status,headers});
  }
  const result=new Response(audio.body,{status:200,headers:narrationHeaders(audio.provider,audio.contentType,'miss')});ctx.waitUntil(caches.default.put(cacheKey,result.clone()));return result;
}

export default{
  async fetch(request:Request,env:Env,ctx:ExecutionContext):Promise<Response>{
    const url=new URL(request.url);
    if(url.pathname==='/api/narration-status'){
      return json({ok:true,studioConfigured:Boolean(env.GEMINI_API_KEY),provider:env.GEMINI_API_KEY?'gemini':null,model:env.GEMINI_API_KEY?GEMINI_TTS_MODEL:null,fallbackModel:env.GEMINI_API_KEY?GEMINI_TTS_FALLBACK_MODEL:null,voice:env.GEMINI_API_KEY?GEMINI_TTS_VOICE:null,version:NARRATION_VERSION,automaticSystemFallback:false,disclosure:'AI-generated voice'},{headers:{'cache-control':'no-store'}});
    }
    if(url.pathname==='/api/narration')return handleNarration(request,env,ctx);
    if(url.pathname==='/api/tutor-status')return json({ok:true,geminiConfigured:Boolean(env.GEMINI_API_KEY),openaiConfigured:Boolean(env.OPENAI_API_KEY)});
    if(url.pathname==='/api/tutor-test'){
      const gemini=await askGemini(env,'Объясни коротко: 25% от 120.',null,null);const openai=gemini.ok?null:await askOpenAi(env,'Объясни коротко: 25% от 120.',null,null);const best=gemini.ok?gemini:openai;
      return json({ok:true,geminiConfigured:Boolean(env.GEMINI_API_KEY),openaiConfigured:Boolean(env.OPENAI_API_KEY),aiOk:Boolean(best?.ok),provider:best?.provider??null,status:best?.status??null,error:best?.error??null,answer:best?.answer??null});
    }
    if(url.pathname==='/api/tutor')return handleTutor(request,env);
    return env.ASSETS.fetch(request);
  },
};