import {PYTHAGORAS_SHOP,getEquippedItems,type EconomyState} from './studentEconomy';
import './pythagorasWorld.css';

type Props={progress:number;state:EconomyState};

function clamp(value:number,min=0,max=100){return Math.min(max,Math.max(min,value))}

export function PythagorasWorld({progress,state}:Props){
  const equipped=getEquippedItems(state);
  const style=equipped.find(item=>item.category==='style');
  const gadget=equipped.find(item=>item.category==='gadget');
  const transport=equipped.find(item=>item.category==='transport');
  const room=equipped.find(item=>item.category==='room');
  const catmobile=PYTHAGORAS_SHOP.find(item=>item.id==='catmobile');
  const catmobileOwned=state.inventory.includes('catmobile');
  const catmobileProgress=catmobile?clamp(state.balance/catmobile.price*100):0;
  const level=Math.min(10,Math.max(1,Math.floor(clamp(progress)/10)+1));
  const nextLevelAt=level>=10?100:level*10;
  const collection=PYTHAGORAS_SHOP.map(item=>({item,owned:state.inventory.includes(item.id),active:state.equipped[item.category]===item.id}));

  return <section className="py-world" aria-label="Комната Пифагора">
    <header className="py-world-head">
      <div><small>Живой мир</small><h3>Комната Пифагора</h3><p>Купленные и выбранные предметы появляются здесь автоматически.</p></div>
      <div className="py-level"><small>Уровень</small><b>{level}</b><span>{progress}% курса</span></div>
    </header>

    <div className="py-world-grid">
      <div className="py-room-scene">
        <div className="py-room-window"><span>{transport?.icon??'☀️'}</span><small>{transport?.name??'Следующая поездка впереди'}</small></div>
        <div className="py-room-shelf"><span>π</span><span>Σ</span><span>√</span></div>
        <div className="py-room-desk"><span>{room?.icon??'▭'}</span><small>{room?.name??'Место для нового предмета'}</small></div>
        <div className="py-world-cat">
          <div className="py-world-cat-face">⌃•ﻌ•⌃</div>
          {style&&<span className="py-world-style" title={style.name}>{style.icon}</span>}
          {gadget&&<span className="py-world-gadget" title={gadget.name}>{gadget.icon}</span>}
          <b>Пифагор</b>
        </div>
        <div className="py-room-floor"><i/><i/><i/></div>
      </div>

      <aside className="py-world-goals">
        <article>
          <small>Развитие</small>
          <b>Уровень {level} из 10</b>
          <p>{level>=10?'Максимальный уровень курса достигнут.':`До следующего уровня — ${Math.max(0,nextLevelAt-progress)}% курса.`}</p>
          <div className="py-goal-bar"><i style={{width:`${clamp(progress)}%`}}/></div>
        </article>
        <article className={catmobileOwned?'is-complete':''}>
          <small>Большая цель</small>
          <b>🏎️ Котомобиль</b>
          <p>{catmobileOwned?'Котомобиль уже в коллекции.':catmobile?`Нужно ${catmobile.price} монет. Осталось ${Math.max(0,catmobile.price-state.balance)}.`:'Финальная награда'}</p>
          <div className="py-goal-bar"><i style={{width:`${catmobileOwned?100:catmobileProgress}%`}}/></div>
        </article>
      </aside>
    </div>

    <div className="py-collection">
      <header><div><small>Коллекция</small><h3>Мои предметы</h3></div><span>{state.inventory.length}/{PYTHAGORAS_SHOP.length}</span></header>
      <div className="py-collection-grid">{collection.map(({item,owned,active})=><article className={`${owned?'is-owned ':''}${active?'is-active':''}`} key={item.id}>
        <i aria-hidden="true">{owned?item.icon:'?'}</i><div><b>{item.name}</b><small>{active?'Используется':owned?'В коллекции':'Ещё не открыт'}</small></div>
      </article>)}</div>
    </div>
  </section>;
}