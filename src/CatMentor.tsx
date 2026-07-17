import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import mentorScriptsData from './data/mentorScripts.json';
import lessonThreeScriptsData from './data/lessonThreeMentorScripts.json';
import { MentorMarkerOverlay } from './MentorMarkerOverlay';
import './catMentor.css';

export type MentorSignal = { kind: 'idle' | 'correct' | 'wrong'; version: number };
type Props = { rootRef: RefObject<HTMLElement | null>; lessonNumber: number; mode: 'opening' | 'lesson'; signal: MentorSignal };
type Scene = { key:string; stageId:string; title:string; body:string; prompt:string; note:string };
type Action = 'welcome'|'different'|'example'|'hint'|'why';
type Response = Action|'success'|'retry';
type Mood = 'calm'|'thinking'|'happy'|'encouraging'|'speaking';
type Script = Record<Response,string>;
type Manifest = { voice:string; clips:Record<string,string> };

const scripts = { ...mentorScriptsData, ...lessonThreeScriptsData } as Record<string,Script>;
const MANIFEST_URL='/audio/neural/manifest.json';
const AUTO_GUIDE_KEY='mathnikita-mentor-auto-guide';
const emptyScene:Scene={key:'empty',stageId:'',title:'',body:'',prompt:'',note:''};

function clean(value?:string|null){return value?.replace(/\s+/g,' ').trim()??''}
function readScene(root:HTMLElement|null,mode:Props['mode']):Scene{
  if(!root)return emptyScene;
  if(mode==='opening'){
    const scope=root.querySelector<HTMLElement>('.opening-screen:not([hidden])');
    if(!scope)return emptyScene;
    const title=clean(scope.querySelector('.lesson-opening-copy h1')?.textContent);
    const body=clean(scope.querySelector('.lesson-opening-copy p')?.textContent);
    const prompt=clean(scope.querySelector('.lesson-opening-question b')?.textContent);
    return{key:`opening:${title}`,stageId:'',title,body,prompt,note:''};
  }
  const stage=root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage');
  if(!stage)return emptyScene;
  const stageId=stage.dataset.stageId??'';
  const title=clean(stage.querySelector('.stage-copy h2')?.textContent);
  const body=clean(stage.querySelector('.stage-copy p')?.textContent);
  const prompt=clean(stage.querySelector('.activity-area h3')?.textContent);
  const note=clean(stage.querySelector('.theory-note span')?.textContent);
  return{key:stageId||`${title}|${prompt}`,stageId,title,body,prompt,note};
}

function lessonThreeKey(stageId:string){
  if(stageId==='l3-story')return'l3-intro';
  if(['l3-digits','l3-length'].includes(stageId))return'l3-digits';
  if(stageId==='l3-leading-zero')return'l3-leading-zero';
  if(['l3-place','l3-place-name'].includes(stageId))return'l3-place';
  if(['l3-classes','l3-split','l3-class-names'].includes(stageId))return'l3-classes';
  if(['l3-read','l3-write'].includes(stageId))return'l3-read-write';
  if(stageId==='l3-zero-role')return'l3-zero';
  if(['l3-expanded','l3-expand-practice','l3-compose'].includes(stageId))return'l3-expanded';
  if(stageId==='l3-order')return'l3-algorithm';
  if(/^l3-quiz/.test(stageId))return'l3-check';
  if(stageId==='l3-challenge')return'l3-challenge';
  if(stageId==='l3-summary')return'l3-summary';
  return'l3-check';
}

function scriptKey(scene:Scene,lessonNumber:number,mode:Props['mode']){
  if(mode==='opening')return `opening-${lessonNumber}`;
  if(lessonNumber===1&&scene.stageId&&scripts[`l1-${scene.stageId}`])return`l1-${scene.stageId}`;
  if(lessonNumber===3)return lessonThreeKey(scene.stageId);
  const text=`${scene.title} ${scene.body} ${scene.prompt} ${scene.note}`.toLowerCase();
  if(/между|границ|промежут|включительно|k\s*[−-]\s*1|n\s*\+\s*k/.test(text))return'between';
  if(/последователь|закономер|шаг|продолж|пропуск/.test(text))return'sequence';
  if(/следующ|предыдущ|натуральн.*ряд|соседн/.test(text))return'natural-row';
  if(/измер|мерк|сч[её]т|предмет/.test(text))return'measurement';
  return'generic';
}

function loadAuto(){try{return localStorage.getItem(AUTO_GUIDE_KEY)==='true'}catch{return false}}
function bestRussianVoice(){
  const voices=window.speechSynthesis?.getVoices()??[];
  return voices.find(v=>/irina|milena|katya|alena|ал[её]на|natural|premium/i.test(v.name)&&v.lang.toLowerCase().startsWith('ru'))
    ??voices.find(v=>v.lang.toLowerCase().startsWith('ru'))??voices[0];
}

function CatAvatar({mood}:{mood:Mood}){
  const happy=mood==='happy',thinking=mood==='thinking',speaking=mood==='speaking';
  return <svg className={`cat-mentor-avatar mood-${mood}`} viewBox="0 0 240 210" role="img" aria-label="Кот-наставник Пифагор">
    <defs><linearGradient id="mentor-fur" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb338"/><stop offset="1" stopColor="#e97722"/></linearGradient><linearGradient id="mentor-hoodie" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1596a8"/><stop offset="1" stopColor="#12538b"/></linearGradient></defs>
    <ellipse cx="122" cy="192" rx="82" ry="13" fill="rgba(19,38,68,.12)"/><path d="M54 164c9-35 31-55 67-56 37-1 62 19 70 56l5 35H46z" fill="url(#mentor-hoodie)"/><path d="M65 72 52 20l47 29M175 71l16-51-49 30" fill="url(#mentor-fur)" stroke="#c85a1d" strokeWidth="5" strokeLinejoin="round"/><path d="m63 38 24 17-18 8zM179 37l-25 18 19 8z" fill="#f58a72"/><ellipse cx="121" cy="88" rx="67" ry="59" fill="url(#mentor-fur)" stroke="#c85a1d" strokeWidth="4"/>
    {thinking?<><ellipse cx="93" cy="88" rx="14" ry="17" fill="#fff"/><ellipse cx="151" cy="88" rx="14" ry="17" fill="#fff"/><circle cx="97" cy="84" r="7" fill="#286b3a"/><circle cx="155" cy="84" r="7" fill="#286b3a"/></>:<><path d={happy?'M80 88q13 14 26 0':'M80 91q13-12 26 0'} fill={happy?'none':'#fff'} stroke="#6f3218" strokeWidth="4" strokeLinecap="round"/><path d={happy?'M136 88q13 14 26 0':'M136 91q13-12 26 0'} fill={happy?'none':'#fff'} stroke="#6f3218" strokeWidth="4" strokeLinecap="round"/>{!happy?<><circle cx="95" cy="88" r="7" fill="#286b3a"/><circle cx="151" cy="88" r="7" fill="#286b3a"/></>:null}</>}
    <path d="m121 96-9 8 10 5 9-5z" fill="#d85d45" stroke="#8d3f19" strokeWidth="2"/><path d={speaking?'M104 113q18 26 37 0q-18 13-37 0':happy?'M103 112q19 23 39 0':'M108 118q14 8 28 0'} fill="#fff4dc" stroke="#8d3f19" strokeWidth="3" strokeLinecap="round"/><path d="M67 101 28 94M69 112l-41 5M174 101l39-8M173 113l40 7" fill="none" stroke="#8d3f19" strokeWidth="3" strokeLinecap="round"/><circle cx="121" cy="166" r="25" fill="#f8bd36" stroke="#8a5a0b" strokeWidth="4"/><text x="121" y="177" textAnchor="middle" fontSize="34" fontWeight="800" fill="#70470a">π</text><path className="cat-mentor-paw" d="M58 164c-21-9-34-3-36 9-1 11 14 16 39 7" fill="url(#mentor-fur)" stroke="#c85a1d" strokeWidth="4" strokeLinecap="round"/>
  </svg>;
}

export function CatMentor({rootRef,lessonNumber,mode,signal}:Props){
  const[scene,setScene]=useState<Scene>(emptyScene);const[action,setAction]=useState<Action>('welcome');const[collapsed,setCollapsed]=useState(false);const[manifest,setManifest]=useState<Manifest|null>(null);const[speaking,setSpeaking]=useState(false);const[autoGuide,setAutoGuide]=useState(loadAuto);const audioRef=useRef<HTMLAudioElement|null>(null);const speechToken=useRef(0);
  useEffect(()=>{let active=true;fetch(MANIFEST_URL,{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()).then(v=>{if(active)setManifest(v as Manifest)}).catch(()=>{if(active)setManifest(null)});return()=>{active=false}},[]);
  useEffect(()=>{const root=rootRef.current;if(!root)return;const refresh=()=>{const next=readScene(root,mode);setScene(previous=>previous.key===next.key?previous:next)};refresh();const observer=new MutationObserver(refresh);observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','data-stage-id']});return()=>observer.disconnect()},[rootRef,lessonNumber,mode]);
  const key=useMemo(()=>scriptKey(scene,lessonNumber,mode),[scene,lessonNumber,mode]);const script=scripts[key]??scripts.generic;const response:Response=signal.kind==='correct'?'success':signal.kind==='wrong'?'retry':action;const message=script[response];
  function stop(){speechToken.current+=1;if(audioRef.current){audioRef.current.pause();audioRef.current.currentTime=0;audioRef.current=null}window.speechSynthesis?.cancel();setSpeaking(false)}
  function systemSpeak(text:string,token:number){if(!('speechSynthesis'in window)||!text){setSpeaking(false);return}const utterance=new SpeechSynthesisUtterance(text);utterance.lang='ru-RU';utterance.voice=bestRussianVoice()??null;utterance.rate=.94;utterance.pitch=1;utterance.onend=()=>{if(token===speechToken.current)setSpeaking(false)};utterance.onerror=()=>setSpeaking(false);setSpeaking(true);window.speechSynthesis.speak(utterance)}
  function speak(nextResponse:Response){stop();const token=++speechToken.current;const text=script[nextResponse];const source=manifest?.clips[`mentor-${key}-${nextResponse}`];window.dispatchEvent(new CustomEvent('mathnikita-audio-request',{detail:{source:'mentor'}}));if(!source){systemSpeak(text,token);return}const audio=new Audio(source);audioRef.current=audio;audio.preload='auto';audio.playbackRate=.96;setSpeaking(true);const fallback=()=>{if(token===speechToken.current)systemSpeak(text,token)};audio.onended=()=>{if(token===speechToken.current)setSpeaking(false)};audio.onerror=fallback;void audio.play().catch(fallback)}
  useEffect(()=>{stop();setAction('welcome');if(!autoGuide||scene.key==='empty')return;const timer=window.setTimeout(()=>speak('welcome'),140);return()=>window.clearTimeout(timer)},[scene.key,lessonNumber,mode,key,autoGuide]);
  useEffect(()=>{if(!autoGuide||signal.kind==='idle')return;const timer=window.setTimeout(()=>speak(signal.kind==='correct'?'success':'retry'),110);return()=>window.clearTimeout(timer)},[signal.version,signal.kind,autoGuide,key]);
  useEffect(()=>{const stopHandler=()=>stop();const requestHandler=(event:Event)=>{if((event as CustomEvent).detail?.source!=='mentor')stop()};window.addEventListener('mathnikita-stop-narration',stopHandler);window.addEventListener('mathnikita-audio-request',requestHandler);return()=>{window.removeEventListener('mathnikita-stop-narration',stopHandler);window.removeEventListener('mathnikita-audio-request',requestHandler);stop()}},[]);
  function choose(next:Action){setAction(next);speak(next)}function toggleAuto(){const next=!autoGuide;setAutoGuide(next);localStorage.setItem(AUTO_GUIDE_KEY,String(next));next?speak(response):stop()}
  const mood:Mood=speaking?'speaking':signal.kind==='correct'?'happy':signal.kind==='wrong'?'encouraging':action==='hint'||action==='why'?'thinking':'calm';
  const marker=<MentorMarkerOverlay rootRef={rootRef} lessonNumber={lessonNumber} mode={mode} sceneKey={scene.key} stageId={scene.stageId} title={scene.title} body={scene.body} prompt={scene.prompt} action={action}/>;
  if(collapsed)return <><button className="cat-mentor-collapsed" type="button" onClick={()=>setCollapsed(false)} aria-label="Открыть наставника Пифагора"><CatAvatar mood={mood}/><span>Пифагор</span>{signal.kind!=='idle'?<i aria-hidden="true"/>:null}</button>{marker}</>;
  return <><aside className={`cat-mentor-panel is-${mood}`} aria-label="Виртуальный наставник Пифагор"><header><div><span>Наставник</span><b>Кот Пифагор</b></div><button type="button" onClick={()=>setCollapsed(true)} aria-label="Свернуть наставника">×</button></header><div className="cat-mentor-portrait"><CatAvatar mood={mood}/></div><div className="cat-mentor-bubble" key={`${scene.key}-${action}-${signal.version}`}><p>{message}</p><button className={speaking?'cat-mentor-speak is-speaking':'cat-mentor-speak'} type="button" onClick={()=>speaking?stop():speak(response)} aria-label={speaking?'Остановить реплику':'Озвучить реплику'}>{speaking?'■':'▶'}</button></div><div className="cat-mentor-voice-row"><button type="button" className={autoGuide?'is-on':''} onClick={toggleAuto} aria-pressed={autoGuide}><span aria-hidden="true">{autoGuide?'🔊':'🔈'}</span>{autoGuide?'Ведёт голосом':'Голос по кнопке'}</button><small>{manifest?`Нейроголос ${manifest.voice}`:'Голос устройства — до загрузки дорожки'}</small></div><div className="cat-mentor-actions" aria-label="Помощь наставника"><button type="button" className={action==='different'?'active':''} onClick={()=>choose('different')}><span>↻</span> Объясни иначе</button><button type="button" className={action==='example'?'active':''} onClick={()=>choose('example')}><span>▣</span> Дай пример</button><button type="button" className={action==='hint'?'active':''} onClick={()=>choose('hint')}><span>✦</span> Подсказка</button><button type="button" className={action==='why'?'active':''} onClick={()=>choose('why')}><span>?</span> Почему так?</button></div></aside>{marker}</>;
}
