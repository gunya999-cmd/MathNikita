export type EconomyCategory='style'|'gadget'|'transport'|'room';

export type ShopItem={
  id:string;
  category:EconomyCategory;
  name:string;
  description:string;
  price:number;
  icon:string;
};

export type EconomyReason={code:string;label:string;amount:number};

export type EconomyReceipt={
  id:string;
  lessonNumber:number;
  amount:number;
  reasons:EconomyReason[];
  balanceAfter:number;
  at:string;
};

export type EconomyTransaction={
  id:string;
  at:string;
  kind:'earn'|'spend';
  amount:number;
  label:string;
  lessonNumber?:number;
  itemId?:string;
  reasons?:EconomyReason[];
  balanceAfter:number;
};

export type EconomyState={
  version:1;
  balance:number;
  lifetimeEarned:number;
  lifetimeSpent:number;
  rewardedRecordBest:number;
  settledLessons:Record<string,EconomyReceipt>;
  inventory:string[];
  equipped:Partial<Record<EconomyCategory,string>>;
  transactions:EconomyTransaction[];
};

export type LessonRewardInput={
  lessonNumber:number;
  correct:number;
  wrong:number;
  hints:number;
  isControl:boolean;
  isTopicEnd:boolean;
  personalRecord:number;
};

export const ECONOMY_STORAGE_KEY='mathnikita:pythagoras-economy:v1';
export const ECONOMY_UPDATED_EVENT='mathnikita-economy-updated';
export const ECONOMY_REWARDED_EVENT='mathnikita-economy-rewarded';

export const PYTHAGORAS_SHOP:ShopItem[]=[
  {id:'glasses',category:'style',name:'Очки',description:'Для серьёзных вычислений.',price:40,icon:'👓'},
  {id:'cap',category:'style',name:'Бейсболка',description:'Спокойный спортивный образ.',price:60,icon:'🧢'},
  {id:'headphones',category:'gadget',name:'Наушники',description:'Музыка между задачами.',price:80,icon:'🎧'},
  {id:'backpack',category:'style',name:'Рюкзак',description:'Всё нужное для нового модуля.',price:100,icon:'🎒'},
  {id:'smartwatch',category:'gadget',name:'Смарт-часы',description:'Следить за временем и серией.',price:120,icon:'⌚'},
  {id:'phone',category:'gadget',name:'Телефон',description:'Карманный вычислительный центр.',price:160,icon:'📱'},
  {id:'skate',category:'transport',name:'Скейт',description:'Быстро к следующей теме.',price:180,icon:'🛹'},
  {id:'tablet',category:'gadget',name:'Планшет',description:'Для схем, графиков и заметок.',price:220,icon:'▣'},
  {id:'desk',category:'room',name:'Рабочий стол',description:'Обновление комнаты Пифагора.',price:200,icon:'🗄️'},
  {id:'catmobile',category:'transport',name:'Котомобиль',description:'Большая цель для длинной серии занятий.',price:500,icon:'🏎️'},
];

function emptyState():EconomyState{
  return{version:1,balance:0,lifetimeEarned:0,lifetimeSpent:0,rewardedRecordBest:0,settledLessons:{},inventory:[],equipped:{},transactions:[]};
}

function makeId(prefix:string){
  return`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}

export function loadEconomyState():EconomyState{
  if(typeof localStorage==='undefined')return emptyState();
  try{
    const parsed=JSON.parse(localStorage.getItem(ECONOMY_STORAGE_KEY)??'null') as EconomyState|null;
    if(parsed?.version===1&&typeof parsed.balance==='number'&&parsed.settledLessons&&Array.isArray(parsed.inventory)&&Array.isArray(parsed.transactions)){
      return{...emptyState(),...parsed,equipped:parsed.equipped??{},rewardedRecordBest:parsed.rewardedRecordBest??0};
    }
  }catch{/* ignore corrupted economy */}
  return emptyState();
}

export function saveEconomyState(state:EconomyState){
  if(typeof localStorage==='undefined')return;
  localStorage.setItem(ECONOMY_STORAGE_KEY,JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(ECONOMY_UPDATED_EVENT,{detail:state}));
}

export function settleLessonReward(input:LessonRewardInput):EconomyReceipt{
  const state=loadEconomyState();
  const existing=state.settledLessons[String(input.lessonNumber)];
  if(existing)return existing;

  const attempts=Math.max(0,input.correct)+Math.max(0,input.wrong);
  const accuracy=attempts>0?Math.round(input.correct/attempts*100):null;
  const reasons:EconomyReason[]=[{code:'lesson',label:'Урок завершён',amount:10}];
  if(accuracy!==null&&accuracy>=85)reasons.push({code:'accuracy85',label:'Точность 85%+',amount:5});
  if(accuracy!==null&&accuracy>=95)reasons.push({code:'accuracy95',label:'Точность 95%+',amount:5});
  if(attempts>0&&input.hints===0)reasons.push({code:'no-hints',label:'Без подсказок',amount:5});
  if(input.isTopicEnd)reasons.push({code:'topic',label:'Тема завершена',amount:25});
  if(input.isControl)reasons.push({code:'control',label:'Контрольная завершена',amount:40});
  const newRecord=input.personalRecord>state.rewardedRecordBest&&input.personalRecord>0;
  if(newRecord)reasons.push({code:'record',label:`Новый рекорд: ${input.personalRecord} подряд`,amount:10});

  const amount=reasons.reduce((sum,reason)=>sum+reason.amount,0);
  const at=new Date().toISOString();
  const balanceAfter=state.balance+amount;
  const receipt:EconomyReceipt={id:makeId('reward'),lessonNumber:input.lessonNumber,amount,reasons,balanceAfter,at};
  const transaction:EconomyTransaction={id:receipt.id,at,kind:'earn',amount,label:`Урок ${input.lessonNumber}`,lessonNumber:input.lessonNumber,reasons,balanceAfter};
  const next:EconomyState={
    ...state,
    balance:balanceAfter,
    lifetimeEarned:state.lifetimeEarned+amount,
    rewardedRecordBest:newRecord?input.personalRecord:state.rewardedRecordBest,
    settledLessons:{...state.settledLessons,[String(input.lessonNumber)]:receipt},
    transactions:[transaction,...state.transactions].slice(0,100),
  };
  saveEconomyState(next);
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(ECONOMY_REWARDED_EVENT,{detail:receipt}));
  return receipt;
}

export function purchaseShopItem(itemId:string){
  const item=PYTHAGORAS_SHOP.find(candidate=>candidate.id===itemId);
  if(!item)return{ok:false as const,reason:'not-found' as const,state:loadEconomyState()};
  const state=loadEconomyState();
  if(state.inventory.includes(item.id))return{ok:false as const,reason:'owned' as const,state};
  if(state.balance<item.price)return{ok:false as const,reason:'insufficient' as const,state};
  const balanceAfter=state.balance-item.price;
  const transaction:EconomyTransaction={id:makeId('buy'),at:new Date().toISOString(),kind:'spend',amount:-item.price,label:item.name,itemId:item.id,balanceAfter};
  const next:EconomyState={...state,balance:balanceAfter,lifetimeSpent:state.lifetimeSpent+item.price,inventory:[...state.inventory,item.id],transactions:[transaction,...state.transactions].slice(0,100)};
  saveEconomyState(next);
  return{ok:true as const,item,state:next};
}

export function equipShopItem(itemId:string){
  const item=PYTHAGORAS_SHOP.find(candidate=>candidate.id===itemId);
  const state=loadEconomyState();
  if(!item||!state.inventory.includes(item.id))return{ok:false as const,state};
  const next:EconomyState={...state,equipped:{...state.equipped,[item.category]:item.id}};
  saveEconomyState(next);
  return{ok:true as const,item,state:next};
}

export function getEquippedItems(state=loadEconomyState()){
  return Object.values(state.equipped).flatMap(id=>PYTHAGORAS_SHOP.filter(item=>item.id===id));
}

if(typeof window!=='undefined'&&import.meta.env.VITE_E2E_BYPASS_PROFILE==='1'){
  (window as typeof window&{__mathNikitaEconomyTest?:{settleLessonReward:typeof settleLessonReward;loadEconomyState:typeof loadEconomyState}}).__mathNikitaEconomyTest={settleLessonReward,loadEconomyState};
}
