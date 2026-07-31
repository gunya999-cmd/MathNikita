import { useEffect,useMemo,useState } from 'react';
import { lessonOneStages } from './LessonPlayer';
import { lessonTwoStages } from './NaturalRowPracticePlayer';
import { lessonThreeStages } from './DecimalNotationPlayer';
import { lessonFourStages } from './PlaceValueMasteryPlayer';
import { lessonFiveStages } from './DecimalNotationMasteryPlayer';
import { lessonSixStages } from './SegmentLengthPlayer';
import { lessonSevenStages } from './SegmentLengthPracticePlayer';
import { lessonEightStages } from './PolylineLessonPlayer';
import { lessonNineStages } from './GeometrySummaryPlayer';
import { lessonTenStages } from './PlaneLineRayPlayer';
import { lessonElevenStages } from './PlaneLineRayPracticePlayer';
import { lessonTwelveStages } from './PlaneLineRaySummaryPlayer';
import { lessonThirteenStages } from './ScaleCoordinateRayPlayer';
import { lessonFourteenStages } from './ScaleCoordinateRayPracticePlayer';
import { lessonFifteenStages } from './ScaleCoordinateRaySummaryPlayer';
import { lessonSixteenStages } from './NaturalNumberComparisonPlayer';
import { lessonSeventeenStages } from './NaturalNumberComparisonPracticePlayer';
import './lessonPageNavigator.css';

type PageItem={id:string;title:string};
type PageGroup={label:string;indexes:number[]};

const groups1:PageGroup[]=[{label:'Объяснение',indexes:[0,1,2,3,4,5,6,7]},{label:'Практика',indexes:[8,9,10,11,12,13]},{label:'Мини-проверка',indexes:[14,15,16,17,18]},{label:'Завершение',indexes:[19,20]}];
const groups2:PageGroup[]=[{label:'Натуральный ряд и промежутки',indexes:[0,1,2,3,4,5,6,7]},{label:'Закономерности и практика',indexes:[8,9,10,11,12,13,14,15]},{label:'Мини-проверка',indexes:[16,17,18,19,20]},{label:'Завершение',indexes:[21,22]}];
const groups3:PageGroup[]=[{label:'Цифры, записи и разряды',indexes:[0,1,2,3,4,5]},{label:'Классы и чтение чисел',indexes:[6,7,8,9,10]},{label:'Разрядные слагаемые',indexes:[11,12,13,14,15]},{label:'Мини-проверка',indexes:[16,17,18,19,20]},{label:'Завершение',indexes:[21,22]}];
const groups4:PageGroup[]=[{label:'Разрядная система',indexes:[0,1,2,3,4,5]},{label:'Чтение, запись и разложение',indexes:[6,7,8,9,10,11,12]},{label:'Точный разряд и алгоритм',indexes:[13,14]},{label:'Мини-проверка',indexes:[15,16,17,18,19]},{label:'Завершение',indexes:[20,21]}];
const groups5:PageGroup[]=[{label:'Система десятичной записи',indexes:[0,1,2,3,4,5,6]},{label:'Практика',indexes:[7,8,9,10,11,12]},{label:'Задачи и общий алгоритм',indexes:[13,14,15,16]},{label:'Мини-проверка',indexes:[17,18,19,20,21]},{label:'Исследование и итог',indexes:[22,23]}];
const groups6:PageGroup[]=[{label:'Точка и отрезок',indexes:[0,1,2,3]},{label:'Измерение длины',indexes:[4,5,6,7,8]},{label:'Практика',indexes:[9,10,11,12,13,14,15]},{label:'Мини-проверка',indexes:[16,17,18,19,20]},{label:'Задача и итог',indexes:[21,22]}];
const groups7:PageGroup[]=[{label:'Разминка и чтение чертежа',indexes:[0,1,2,3,4,5,6]},{label:'Практика',indexes:[7,8,9,10,11,12]},{label:'Внимательность и задача № 75',indexes:[13,14]},{label:'Мини-проверка',indexes:[15,16,17,18,19]},{label:'Задача и итог',indexes:[20,21,22]}];
const groups8:PageGroup[]=[{label:'Что такое ломаная',indexes:[0,1,2,3,4]},{label:'Длина и замыкание',indexes:[5,6,7,8]},{label:'Практика',indexes:[9,10,11,12,13,14]},{label:'Мини-проверка',indexes:[15,16,17,18,19]},{label:'Исследование и итог',indexes:[20,21,22]}];
const groups9:PageGroup[]=[{label:'Карта § 3',indexes:[0,1,2,3,4,5,6,7]},{label:'Практика',indexes:[8,9,10,11,12,13]},{label:'Контроль',indexes:[14,15,16,17,18,19]},{label:'Задача и итог',indexes:[20,21,22]}];
const groups10:PageGroup[]=[{label:'Плоскость, прямая и луч',indexes:[0,1,2,3,4,5,6,7,8,9]},{label:'Практика',indexes:[10,11,12,13,14,15]},{label:'Мини-проверка',indexes:[16,17,18,19,20]},{label:'Исследование и итог',indexes:[21,22]}];
const groups11:PageGroup[]=[{label:'Повторение и модели',indexes:[0,1,2,3,4,5,6]},{label:'Практика',indexes:[7,8,9,10,11,12]},{label:'Мини-проверка',indexes:[13,14,15,16,17,18]},{label:'Задача и итог',indexes:[19,20,21]}];
const groups12:PageGroup[]=[{label:'Система § 4',indexes:[0,1,2,3,4,5]},{label:'Практика',indexes:[6,7,8,9,10,11]},{label:'Контроль',indexes:[12,13,14,15,16,17]},{label:'Задача и итог',indexes:[18,19,20]}];
const groups13:PageGroup[]=[{label:'Шкалы и координатный луч',indexes:[0,1,2,3]},{label:'Практика',indexes:[4,5,6,7,8,9]},{label:'Построение и проверка',indexes:[10,11,12,13,14,15]},{label:'Контроль и итог',indexes:[16,17,18,19,20,21]}];
const groups14:PageGroup[]=[{label:'Повторение и масштаб',indexes:[0,1,2]},{label:'Практика',indexes:[3,4,5,6,7,8,9,10]},{label:'Ошибки и контроль',indexes:[11,12,13,14,15,16,17,18,19]},{label:'Задача и итог',indexes:[20,21,22]}];
const groups15:PageGroup[]=[{label:'Система § 5',indexes:[0,1,2]},{label:'Практика',indexes:[3,4,5,6,7,8,9,10,11]},{label:'Коррекция и контроль',indexes:[12,13,14,15,16,17,18,19]},{label:'Задача и итог',indexes:[20,21,22]}];
const groups16:PageGroup[]=[{label:'Правила сравнения',indexes:[0,1,2,3,4,5,6,7,8,9]},{label:'Двойное неравенство и алгоритм',indexes:[10,11,12,13,14]},{label:'Контроль',indexes:[15,16,17,18,19]},{label:'Олимпиада и итог',indexes:[20,21,22,23]}];
const groups17:PageGroup[]=[{label:'Сравнение и координатный луч',indexes:[0,1,2,3,4]},{label:'Практика и перебор вариантов',indexes:[5,6,7,8,9,10,11,12]},{label:'Коррекция и контроль',indexes:[13,14,15,16,17,18,19]},{label:'Задача и итог',indexes:[20,21,22]}];

const pagesByLesson:Record<number,PageItem[]>={
  1:lessonOneStages,2:lessonTwoStages,3:lessonThreeStages,4:lessonFourStages,
  5:lessonFiveStages,6:lessonSixStages,7:lessonSevenStages,8:lessonEightStages,
  9:lessonNineStages,10:lessonTenStages,11:lessonElevenStages,12:lessonTwelveStages,
  13:lessonThirteenStages,14:lessonFourteenStages,15:lessonFifteenStages,16:lessonSixteenStages,
  17:lessonSeventeenStages,
};
const groupsByLesson:Record<number,PageGroup[]>={
  1:groups1,2:groups2,3:groups3,4:groups4,5:groups5,6:groups6,7:groups7,8:groups8,
  9:groups9,10:groups10,11:groups11,12:groups12,13:groups13,14:groups14,15:groups15,16:groups16,
  17:groups17,
};

function activeLessonNumber(){
  const text=document.querySelector<HTMLElement>('.lesson-mode-toolbar')?.textContent??'';
  for(let lessonNumber=17;lessonNumber>=2;lessonNumber-=1){
    if(new RegExp(`Урок\\s+${lessonNumber}\\s+из`).test(text))return lessonNumber;
  }
  const saved=Number(localStorage.getItem('mathnikita-selected-lesson'));
  return saved>=2&&saved<=17?saved:1;
}
function pagesForLesson(lessonNumber:number):PageItem[]{return pagesByLesson[lessonNumber]??lessonOneStages}
function groupsForLesson(lessonNumber:number){return groupsByLesson[lessonNumber]??groups1}
function activeStageIndex(pages:PageItem[]){
  const stage=document.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage');
  const id=stage?.dataset.stageId;
  if(id){const index=pages.findIndex(page=>page.id===id);if(index>=0)return index}
  const title=stage?.querySelector<HTMLElement>('.stage-copy h2')?.textContent?.trim();
  const index=pages.findIndex(page=>page.title===title);
  return index>=0?index:0;
}

export function LessonPageNavigator(){
  const[visible,setVisible]=useState(false);
  const[open,setOpen]=useState(false);
  const[lessonNumber,setLessonNumber]=useState(1);
  const[currentPage,setCurrentPage]=useState(0);
  const pages=useMemo(()=>pagesForLesson(lessonNumber),[lessonNumber]);
  const groups=groupsForLesson(lessonNumber);

  useEffect(()=>{
    const refresh=()=>{
      const active=Boolean(document.querySelector('.lesson-runtime:not([hidden]) .lesson-player-page'));
      const next=activeLessonNumber();
      const nextPages=pagesForLesson(next);
      setVisible(active);
      setLessonNumber(next);
      if(active)setCurrentPage(activeStageIndex(nextPages));
      else setOpen(false);
    };
    refresh();
    const observer=new MutationObserver(refresh);
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class','data-stage-id']});
    return()=>observer.disconnect();
  },[]);

  function jumpTo(targetIndex:number){
    setOpen(false);
    if(lessonNumber>=2&&lessonNumber<=17){
      window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex:targetIndex}}));
      setCurrentPage(targetIndex);
      return;
    }
    const move=()=>{
      const current=activeStageIndex(pages);
      if(current===targetIndex){setCurrentPage(targetIndex);return}
      const buttons=document.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .lesson-controls')?.querySelectorAll<HTMLButtonElement>('button');
      const button=targetIndex<current?buttons?.[0]:buttons?.[1];
      if(!button)return;
      const disabled=button.disabled;
      if(disabled)button.disabled=false;
      button.click();
      if(disabled)button.disabled=true;
      window.setTimeout(move,45);
    };
    move();
  }

  if(!visible)return null;
  return <aside className={`lesson-page-navigator ${open?'is-open':''}`} aria-label="Навигация по страницам урока">
    <button className="lesson-page-navigator-toggle" type="button" onClick={()=>setOpen(value=>!value)} aria-expanded={open}><span aria-hidden="true">☰</span><b>Страница {currentPage+1}/{pages.length}</b></button>
    {open?<div className="lesson-page-navigator-panel">
      <header><div><span>Быстрый просмотр · урок {lessonNumber}</span><b>Перейти к странице урока</b></div><button type="button" onClick={()=>setOpen(false)} aria-label="Закрыть навигацию">×</button></header>
      <p>Можно открыть любую страницу урока без прохождения предыдущих заданий. Сохранённые результаты не удаляются.</p>
      <div className="lesson-page-navigator-groups">{groups.map(group=><section key={group.label}><h3>{group.label}</h3><div>{group.indexes.map(index=>{const stage=pages[index];return stage?<button key={stage.id} type="button" className={index===currentPage?'active':''} onClick={()=>jumpTo(index)}><span>{index+1}</span><b>{stage.title}</b></button>:null})}</div></section>)}</div>
    </div>:null}
  </aside>;
}
