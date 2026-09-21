import { yearLessonByNumber } from './data/yearPlan';
import type { DashboardSnapshot,LessonAnalyticsRow } from './studentAnalytics';

export const PYTHAGORAS_ECONOMY_KEY='mathnikita:pythagoras-economy:v1';
export const PYTHAGORAS_UPDATED_EVENT='mathnikita-pythagoras-updated';

export type PythagorasCategory='style'|'gadget'|'transport'|'room'|'development';

export type PythagorasItem={
  id:string;
  title:string;
  category:PythagorasCategory;
  price:number;
  icon:string;
  description:string;
  minStage:number;
};

export type PythagorasStage={
  id:number;
  title:string;
  minLessons:number;
  nextLessons:number|null;
};

type Purchase={price:number;at:string};

type StoredEconomy={
  version:1;
  purchases:Record<string,Purchase>;
  equipped:Partial<Record<PythagorasCategory,string>>;
  seenEarnedCoins?:number;
  updatedAt?:string;
};

export type PythagorasEconomy={
  earnedCoins:number;
  spentCoins:number;
  balance:number;
  stage:PythagorasStage;
  nextStage:PythagorasStage|null;
  purchased:Set<string>;
  equipped:Partial<Record<PythagorasCategory,string>>;
  topicBonuses:number;
};

export const pythagorasCatalog:PythagorasItem[]=[
  {id:'blue-collar',title:'Синий ошейник',category:'style',price:40,icon:'🔹',description:'Первый аккуратный апгрейд Пифагора.',minStage:0},
  {id:'hoodie',title:'Худи исследователя',category:'style',price:100,icon:'🧥',description:'Образ для серьёзных математических миссий.',minStage:1},
  {id:'smart-glasses',title:'Умные очки',category:'style',price:120,icon:'👓',description:'Стиль исследователя без лишней мишуры.',minStage:1},
  {id:'headphones',title:'Наушники',category:'gadget',price:150,icon:'🎧',description:'Гаджет для рабочего стола Пифагора.',minStage:1},
  {id:'smartphone',title:'Смартфон',category:'gadget',price:180,icon:'📱',description:'Первый серьёзный гаджет в коллекции.',minStage:1},
  {id:'smartwatch',title:'Умные часы',category:'gadget',price:200,icon:'⌚',description:'Следит за сериями и личными рекордами.',minStage:2},
  {id:'tablet',title:'Планшет',category:'gadget',price:230,icon:'▣',description:'Экран для задач, заметок и открытий.',minStage:2},
  {id:'desk-lamp',title:'Лампа',category:'room',price:90,icon:'💡',description:'Первый предмет в учебном уголке.',minStage:0},
  {id:'bookshelf',title:'Книжная полка',category:'room',price:160,icon:'📚',description:'Коллекция знаний растёт вместе с курсом.',minStage:1},
  {id:'workbench',title:'Рабочий стол',category:'room',price:220,icon:'🧰',description:'Место для гаджетов и экспериментов.',minStage:2},
  {id:'skateboard',title:'Скейт',category:'transport',price:250,icon:'🛹',description:'Первый транспорт Пифагора.',minStage:2},
  {id:'scooter',title:'Электросамокат',category:'transport',price:400,icon:'🛴',description:'Быстрый апгрейд для исследователя.',minStage:3},
  {id:'catmobile',title:'Котомобиль',category:'transport',price:900,icon:'🏎️',description:'Большая долгосрочная цель: транспорт мастера.',minStage:3},
  {id:'chess',title:'Шахматы',category:'development',price:260,icon:'♟️',description:'Предмет для логики и стратегического мышления.',minStage:2},
  {id:'telescope',title:'Телескоп',category:'development',price:320,icon:'🔭',description:'Для любопытства, наблюдений и новых вопросов.',minStage:2},
  {id:'lab-kit',title:'Набор исследователя',category:'development',price:380,icon:'🧪',description:'Редкий предмет для кабинета Пифагора.',minStage:3},
];

const stages:PythagorasStage[]=[
  {id:0,title:'Котёнок',minLessons:0,nextLessons:15},
  {id:1,title:'Ученик',minLessons:15,nextLessons:40},
  {id:2,title:'Исследователь',minLessons:40,nextLessons:75},
  {id:3,title:'Изобретатель',minLessons:75,nextLessons:120},
  {id:4,title:'Мастер',minLessons:120,nextLessons:160},
  {id:5,title:'Профессор',minLessons:160,nextLessons:175},
  {id:6,title:'Легенда курса',minLessons:175,nextLessons:null},
];

function emptyState():StoredEconomy{return{version:1,purchases:{},equipped:{}}}

export function loadPythagorasState():StoredEconomy{
  if(typeof localStorage==='undefined')return emptyState();
  try{
    const parsed=JSON.parse(localStorage.getItem(PYTHAGORAS_ECONOMY_KEY)??'null') as StoredEconomy|null;
    if(parsed?.version===1&&parsed.purchases&&parsed.equipped)return parsed;
  }catch{/* corrupted optional game state is ignored */}
  return emptyState();
}

function savePythagorasState(state:StoredEconomy,notify=true){
  if(typeof localStorage==='undefined')return;
  state.updatedAt=new Date().toISOString();
  localStorage.setItem(PYTHAGORAS_ECONOMY_KEY,JSON.stringify(state));
  if(notify&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent(PYTHAGORAS_UPDATED_EVENT));
}

function isControlLesson(row:LessonAnalyticsRow){
  const type=yearLessonByNumber.get(row.lessonNumber)?.lessonType;
  return type==='control'||type==='final';
}

export function lessonCoinValue(row:LessonAnalyticsRow){
  if(!row.completed)return 0;
  let coins=10;
  if(row.hasDetailedTelemetry){
    if((row.accuracy??0)>=90)coins+=10;
    else if((row.accuracy??0)>=80)coins+=5;
    if(row.hints===0)coins+=5;
    if(row.recoveredErrors>0)coins+=5;
  }
  if(isControlLesson(row))coins+=30;
  return coins;
}

function completedTopicBonuses(snapshot:DashboardSnapshot){
  const groups=new Map<string,LessonAnalyticsRow[]>();
  for(const row of snapshot.lessons){
    const unit=yearLessonByNumber.get(row.lessonNumber)?.unit??'Курс';
    const rows=groups.get(unit)??[];rows.push(row);groups.set(unit,rows);
  }
  let count=0;
  for(const rows of groups.values())if(rows.length&&rows.every(row=>row.completed))count+=1;
  return count;
}

export function pythagorasStageForLessons(completedLessons:number){
  let current=stages[0];
  for(const stage of stages)if(completedLessons>=stage.minLessons)current=stage;
  return current;
}

export function buildPythagorasEconomy(snapshot:DashboardSnapshot):PythagorasEconomy{
  const state=loadPythagorasState();
  const lessonCoins=snapshot.lessons.reduce((sum,row)=>sum+lessonCoinValue(row),0);
  const topicBonuses=completedTopicBonuses(snapshot);
  const earnedCoins=lessonCoins+topicBonuses*25;
  const spentCoins=Object.values(state.purchases).reduce((sum,purchase)=>sum+Math.max(0,purchase.price||0),0);
  const stage=pythagorasStageForLessons(snapshot.completedLessons);
  const nextStage=stages.find(item=>item.id===stage.id+1)??null;
  return{earnedCoins,spentCoins,balance:Math.max(0,earnedCoins-spentCoins),stage,nextStage,purchased:new Set(Object.keys(state.purchases)),equipped:state.equipped,topicBonuses};
}

export function consumePythagorasCoinReward(snapshot:DashboardSnapshot){
  const economy=buildPythagorasEconomy(snapshot);const state=loadPythagorasState();
  if(typeof state.seenEarnedCoins!=='number'){
    state.seenEarnedCoins=economy.earnedCoins;savePythagorasState(state,false);return 0;
  }
  const delta=Math.max(0,economy.earnedCoins-state.seenEarnedCoins);
  if(delta>0){state.seenEarnedCoins=economy.earnedCoins;savePythagorasState(state,false)}
  return delta;
}

export function nextPythagorasTarget(snapshot:DashboardSnapshot){
  const economy=buildPythagorasEconomy(snapshot);
  const catmobile=pythagorasCatalog.find(item=>item.id==='catmobile');
  if(catmobile&&!economy.purchased.has(catmobile.id)&&economy.stage.id>=catmobile.minStage)return catmobile;
  const available=pythagorasCatalog.filter(item=>!economy.purchased.has(item.id)&&economy.stage.id>=item.minStage).sort((a,b)=>a.price-b.price);
  return available[0]??pythagorasCatalog.find(item=>!economy.purchased.has(item.id))??null;
}

export function buyPythagorasItem(itemId:string,snapshot:DashboardSnapshot){
  const item=pythagorasCatalog.find(candidate=>candidate.id===itemId);
  if(!item)return{ok:false,message:'Предмет не найден.'};
  const economy=buildPythagorasEconomy(snapshot);
  if(economy.purchased.has(item.id))return{ok:false,message:'Этот предмет уже куплен.'};
  if(economy.stage.id<item.minStage)return{ok:false,message:`Откроется на этапе «${stages[item.minStage]?.title??'следующий'}».`};
  if(economy.balance<item.price)return{ok:false,message:`Нужно ещё ${item.price-economy.balance} монет.`};
  const state=loadPythagorasState();
  state.purchases[item.id]={price:item.price,at:new Date().toISOString()};
  state.equipped[item.category]=item.id;
  savePythagorasState(state);
  return{ok:true,message:`${item.title} куплен и выбран.`};
}

export function equipPythagorasItem(itemId:string){
  const item=pythagorasCatalog.find(candidate=>candidate.id===itemId);
  if(!item)return{ok:false,message:'Предмет не найден.'};
  const state=loadPythagorasState();
  if(!state.purchases[item.id])return{ok:false,message:'Сначала нужно купить предмет.'};
  state.equipped[item.category]=item.id;
  savePythagorasState(state);
  return{ok:true,message:`${item.title} выбран.`};
}

export function equippedPythagorasItems(economy:PythagorasEconomy){
  return Object.values(economy.equipped).map(id=>pythagorasCatalog.find(item=>item.id===id)).filter((item):item is PythagorasItem=>Boolean(item));
}

export function pythagorasCategoryLabel(category:PythagorasCategory){
  return category==='style'?'Стиль':category==='gadget'?'Гаджеты':category==='transport'?'Транспорт':category==='room'?'Комната':'Развитие';
}
