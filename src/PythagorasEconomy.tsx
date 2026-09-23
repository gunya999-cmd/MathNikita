import {useEffect,useMemo,useState} from 'react';
import {
  ECONOMY_REWARDED_EVENT,
  ECONOMY_UPDATED_EVENT,
  PYTHAGORAS_SHOP,
  equipShopItem,
  getEquippedItems,
  loadEconomyState,
  purchaseShopItem,
  type EconomyReceipt,
  type EconomyState,
} from './studentEconomy';
import {PythagorasWorld} from './PythagorasWorld';
import './pythagorasEconomy.css';

function useEconomy(){
  const[state,setState]=useState<EconomyState>(()=>loadEconomyState());
  useEffect(()=>{
    const refresh=()=>setState(loadEconomyState());
    window.addEventListener(ECONOMY_UPDATED_EVENT,refresh);
    window.addEventListener('storage',refresh);
    return()=>{window.removeEventListener(ECONOMY_UPDATED_EVENT,refresh);window.removeEventListener('storage',refresh)};
  },[]);
  return[state,setState] as const;
}

function categoryLabel(category:string){
  if(category==='style')return'Образ';
  if(category==='gadget')return'Гаджеты';
  if(category==='transport')return'Транспорт';
  return'Комната';
}

export function PythagorasEntry({progress,stage}:{progress:number;stage:string}){
  const[open,setOpen]=useState(false);
  const[state]=useEconomy();
  return <>
    <button className="py-wallet" type="button" onClick={()=>setOpen(true)} aria-label={`Открыть Пифагора. Баланс ${state.balance} монет`}>
      <span aria-hidden="true">⌃•ﻌ•⌃</span><b>Пифагор</b><strong>{state.balance} 🪙</strong>
    </button>
    {open&&<PythagorasHub progress={progress} stage={stage} onClose={()=>setOpen(false)}/>}    
  </>;
}

export function PythagorasHub({progress,stage,onClose}:{progress:number;stage:string;onClose:()=>void}){
  const[state]=useEconomy();
  const[notice,setNotice]=useState('');
  const equipped=getEquippedItems(state);
  const categories=['style','gadget','transport','room'] as const;
  const buy=(id:string)=>{
    const result=purchaseShopItem(id);
    if(result.ok)setNotice(`${result.item.name}: куплено`);
    else if(result.reason==='owned')setNotice('Этот предмет уже есть в инвентаре');
    else if(result.reason==='insufficient')setNotice('Пока не хватает монет');
    else setNotice('Предмет не найден');
  };
  const equip=(id:string)=>{
    const result=equipShopItem(id);
    setNotice(result.ok?`${result.item.name}: выбрано для Пифагора`:'Сначала купи этот предмет');
  };

  return <div className="py-modal" role="dialog" aria-modal="true" aria-label="Пифагор">
    <div className="py-panel">
      <header className="py-panel-head">
        <div><small>Учебный спутник</small><h2>Пифагор</h2></div>
        <div className="py-balance"><small>Баланс</small><b>{state.balance} 🪙</b></div>
        <button className="py-close" type="button" onClick={onClose} aria-label="Закрыть">×</button>
      </header>

      <section className="py-overview">
        <div className="py-avatar">
          <div className="py-cat-face" aria-hidden="true">⌃•ﻌ•⌃</div>
          <div className="py-equipped">{equipped.length?equipped.map(item=><span key={item.id} title={item.name}>{item.icon}</span>):<small>Пока без экипировки</small>}</div>
        </div>
        <div className="py-stage">
          <small>Стадия</small><b>{stage}</b>
          <div><i style={{width:`${Math.max(0,Math.min(100,progress))}%`}}/></div>
          <span>{progress}% курса</span>
        </div>
        <div className="py-stats"><div><small>Заработано</small><b>{state.lifetimeEarned} 🪙</b></div><div><small>Куплено</small><b>{state.inventory.length}</b></div></div>
      </section>

      <PythagorasWorld progress={progress} state={state}/>

      {notice&&<div className="py-notice" role="status">{notice}<button type="button" onClick={()=>setNotice('')}>×</button></div>}

      <section className="py-shop">
        <header><div><small>Монеты тратятся только здесь</small><h3>Магазин</h3></div><span>{state.inventory.length}/{PYTHAGORAS_SHOP.length} предметов</span></header>
        {categories.map(category=><div className="py-category" key={category}>
          <h4>{categoryLabel(category)}</h4>
          <div className="py-items">{PYTHAGORAS_SHOP.filter(item=>item.category===category).map(item=>{
            const owned=state.inventory.includes(item.id);
            const active=state.equipped[item.category]===item.id;
            return <article key={item.id} className={`${owned?'is-owned ':''}${active?'is-active':''}`}>
              <div className="py-item-icon" aria-hidden="true">{item.icon}</div>
              <div className="py-item-copy"><b>{item.name}</b><p>{item.description}</p><small>{owned?'В инвентаре':`${item.price} 🪙`}</small></div>
              {owned?<button type="button" disabled={active} onClick={()=>equip(item.id)}>{active?'Выбрано':'Надеть'}</button>:<button type="button" disabled={state.balance<item.price} onClick={()=>buy(item.id)}>Купить</button>}
            </article>;
          })}</div>
        </div>)}
      </section>

      <section className="py-history">
        <header><h3>Последние операции</h3><small>Защита от повторного начисления включена</small></header>
        {state.transactions.length===0?<p>Операции появятся после первого завершённого урока.</p>:<div>{state.transactions.slice(0,6).map(tx=><article key={tx.id}><span><b>{tx.label}</b><small>{new Date(tx.at).toLocaleDateString('ru-RU')}</small></span><strong className={tx.amount>=0?'is-plus':'is-minus'}>{tx.amount>=0?'+':''}{tx.amount} 🪙</strong></article>)}</div>}
      </section>
    </div>
  </div>;
}

export function LessonRewardOverlay(){
  const[receipt,setReceipt]=useState<EconomyReceipt|null>(null);
  const[economy,setEconomy]=useState<EconomyState>(()=>loadEconomyState());
  useEffect(()=>{
    const onReward=(event:Event)=>{
      const detail=(event as CustomEvent<EconomyReceipt>).detail;
      if(!detail)return;
      setEconomy(loadEconomyState());
      setReceipt(detail);
    };
    window.addEventListener(ECONOMY_REWARDED_EVENT,onReward);
    return()=>window.removeEventListener(ECONOMY_REWARDED_EVENT,onReward);
  },[]);
  const goal=useMemo(()=>PYTHAGORAS_SHOP.filter(item=>!economy.inventory.includes(item.id)&&item.price>economy.balance).sort((a,b)=>a.price-b.price)[0]??null,[economy]);
  if(!receipt)return null;
  return <div className="py-reward-layer" role="dialog" aria-modal="false" aria-label="Награда за урок">
    <section className="py-reward-card">
      <small>Урок {receipt.lessonNumber} завершён</small>
      <h2>+{receipt.amount} 🪙</h2>
      <div className="py-reward-lines">{receipt.reasons.map(reason=><div key={reason.code}><span>{reason.label}</span><b>+{reason.amount}</b></div>)}</div>
      <div className="py-reward-balance"><span>Баланс</span><b>{receipt.balanceAfter} 🪙</b></div>
      {goal&&<p>До «{goal.name}» осталось {Math.max(0,goal.price-receipt.balanceAfter)} 🪙</p>}
      <button type="button" onClick={()=>setReceipt(null)}>Продолжить</button>
    </section>
  </div>;
}
