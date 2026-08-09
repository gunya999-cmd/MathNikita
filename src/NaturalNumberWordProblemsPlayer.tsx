import { useEffect, useMemo, useState } from 'react';
import { VoicePlayer } from './VoicePlayer';
import { PythagorasMentor } from './PythagorasMentor';
import { LESSON_TWENTY_NINE_OPENING } from './LessonTwentyNineOpening';
import { recordLessonAttempt } from './lessonAttemptTracker';
import { clearLessonProgress, loadLessonProgress, saveLessonProgress } from './lessonProgress';

type Step={kind:'theory'|'example'|'practice'|'control'|'olympiad';title:string;text:string;question?:string;answer?:string;hint?:string};
const steps:Step[]=[
 {kind:'theory',title:'Текст — это модель',text:'В задаче числа связаны смыслом. Сначала выясни, что обозначает каждое число и что происходит: объединение, уменьшение, сравнение или последовательность изменений.'},
 {kind:'example',title:'Одно действие',text:'В библиотеке было 1 250 книг, привезли ещё 375. Стало 1 250 + 375 = 1 625 книг. Слово «привезли» показывает увеличение.',question:'Сколько книг стало?',answer:'1625',hint:'К исходному количеству добавили новые книги.'},
 {kind:'theory',title:'Разность как остаток',text:'Если из целого убрали часть, остаток находим вычитанием. Проверка: остаток + убранная часть должны вернуть исходное целое.'},
 {kind:'example',title:'Остаток',text:'На складе было 2 400 коробок. Отправили 685. Осталось 2 400 − 685 = 1 715.',question:'Сколько коробок осталось?',answer:'1715',hint:'Из того, что было, вычти отправленное.'},
 {kind:'theory',title:'На сколько больше?',text:'В вопросах «на сколько больше» и «на сколько меньше» сравнивают числа вычитанием: из большего вычитают меньшее.'},
 {kind:'practice',title:'Сравнение',text:'В первой школе 1 480 учеников, во второй 1 125.',question:'На сколько учеников в первой школе больше?',answer:'355',hint:'Вычти меньшее число из большего.'},
 {kind:'theory',title:'Задача в два действия',text:'Не пытайся записать всё одной строкой. Сначала найди промежуточную величину, затем используй её для ответа на главный вопрос.'},
 {kind:'example',title:'Два изменения',text:'В музее было 3 200 посетителей. Ушли 875, затем пришли 460. Сначала 3 200 − 875 = 2 325, затем 2 325 + 460 = 2 785.',question:'Сколько посетителей стало?',answer:'2785',hint:'Сначала уменьши количество, затем увеличь.'},
 {kind:'practice',title:'Маршрут автобуса',text:'В автобусе было 46 пассажиров. На остановке вышли 18 и вошли 27.',question:'Сколько пассажиров стало?',answer:'55',hint:'46 − 18, затем прибавь 27.'},
 {kind:'practice',title:'Покупки',text:'У магазина было 5 000 тетрадей. За день продали 1 275, а вечером привезли 900.',question:'Сколько тетрадей стало?',answer:'4625',hint:'Сначала вычти проданные, затем прибавь привезённые.'},
 {kind:'theory',title:'Лишние данные',text:'Не каждое число в условии обязательно участвует в решении. Проверяй: помогает ли величина ответить на вопрос? Если нет — это лишнее данное.'},
 {kind:'practice',title:'Найди нужные числа',text:'В парке 840 деревьев, 315 из них берёзы. Парк открыт с 8:00 до 21:00.',question:'Сколько деревьев не являются берёзами?',answer:'525',hint:'Время работы для ответа не нужно.'},
 {kind:'theory',title:'Проверка ответа',text:'После решения задай три вопроса: ответил ли я именно на вопрос задачи, разумен ли порядок числа, можно ли вернуть исходные данные обратным действием?'},
 {kind:'practice',title:'Обратная проверка',text:'После продажи 725 билетов осталось 1 180 билетов.',question:'Сколько билетов было сначала?',answer:'1905',hint:'Остаток и проданное вместе дают исходное количество.'},
 {kind:'practice',title:'Неизвестное изменение',text:'На счёте было 8 400 баллов. После покупки осталось 6 875.',question:'Сколько баллов потратили?',answer:'1525',hint:'Из начального количества вычти остаток.'},
 {kind:'practice',title:'Три действия',text:'На фестиваль пришли 2 350 человек утром и 1 480 днём. До вечера ушли 965 человек.',question:'Сколько человек осталось?',answer:'2865',hint:'Сначала найди, сколько всего пришло.'},
 {kind:'control',title:'Контроль 1/5',text:'На складе 6 250 кг крупы. Отгрузили 1 875 кг.',question:'Сколько килограммов осталось?',answer:'4375',hint:'Найди остаток.'},
 {kind:'control',title:'Контроль 2/5',text:'В городе А 24 600 жителей, в городе Б 19 850.',question:'На сколько жителей в городе А больше?',answer:'4750',hint:'Это сравнение двух величин.'},
 {kind:'control',title:'Контроль 3/5',text:'В кассе было 12 000 ₽. Получили 3 450 ₽ и потратили 5 275 ₽.',question:'Сколько рублей стало?',answer:'10175',hint:'Сначала прибавь поступление, затем вычти расход.'},
 {kind:'control',title:'Контроль 4/5',text:'После отправки 2 760 деталей на заводе осталось 4 315 деталей.',question:'Сколько деталей было до отправки?',answer:'7075',hint:'Верни отправленную часть к остатку.'},
 {kind:'control',title:'Контроль 5/5',text:'В первой коробке 1 245 деталей, во второй на 380 меньше.',question:'Сколько деталей во второй коробке?',answer:'865',hint:'«На 380 меньше» означает вычитание.'},
 {kind:'olympiad',title:'Задача со звёздочкой',text:'У Пифагора было несколько жетонов. Сначала он отдал 275, потом получил 430, и у него стало 1 205 жетонов.',question:'Сколько жетонов было сначала?',answer:'1050',hint:'Иди от конца: от 1 205 отними 430, затем верни 275.'},
 {kind:'theory',title:'Итог',text:'Ты завершил блок сложения и вычитания: умеешь выбирать действие по смыслу, строить план многошаговой задачи, отбрасывать лишние данные и проверять результат. Дальше — числовые и буквенные выражения.'},
];
const norm=(v:string)=>v.replace(/\s/g,'').replace(',','.');
export function NaturalNumberWordProblemsPlayer({onExit}:{onExit:()=>void}){
 const saved=useMemo(()=>loadLessonProgress(29),[]); const [index,setIndex]=useState(saved?.stepIndex??0); const [answer,setAnswer]=useState(saved?.answer??''); const [status,setStatus]=useState<'idle'|'ok'|'bad'>('idle'); const [hint,setHint]=useState(false); const step=steps[index]; const pct=Math.round(((index+1)/steps.length)*100);
 useEffect(()=>{saveLessonProgress(29,index,answer);},[index,answer]);
 const next=()=>{if(index===steps.length-1){clearLessonProgress(29);onExit();return;}setIndex(v=>v+1);setAnswer('');setStatus('idle');setHint(false);};
 const check=()=>{if(!step.answer)return next();const ok=norm(answer)===norm(step.answer);recordLessonAttempt(29,ok);setStatus(ok?'ok':'bad');if(!ok)setHint(true);};
 return <main className="lesson-player"><header className="lesson-player-head"><button onClick={onExit}>← К урокам</button><div><span>Урок 29 · § 8</span><b>Текстовые задачи на сложение и вычитание</b></div><strong>{pct}%</strong></header><div className="lesson-progress"><i style={{width:`${pct}%`}}/></div><section className="lesson-stage"><div className={`stage-kind ${step.kind}`}>{step.kind==='theory'?'Разбираемся':step.kind==='example'?'Пример':step.kind==='practice'?'Практика':step.kind==='control'?'Контроль':'Олимпиадная задача'}</div><h1>{step.title}</h1><p>{step.text}</p>{index===0&&<div className="lesson-opening"><b>Перед стартом</b><p>{LESSON_TWENTY_NINE_OPENING}</p></div>}<VoicePlayer text={`${step.title}. ${step.text}${step.question?` ${step.question}`:''}`} autoPlayKey={`lesson29-${index}`}/>{step.question&&<div className="lesson-question"><h2>{step.question}</h2><input value={answer} onChange={e=>{setAnswer(e.target.value);setStatus('idle');}} onKeyDown={e=>e.key==='Enter'&&check()} placeholder="Введи ответ" inputMode="numeric"/><button onClick={check}>Проверить</button></div>}{status==='bad'&&<div className="feedback bad"><b>Пока не так.</b><span>{hint?step.hint:'Попробуй ещё раз.'}</span></div>}{status==='ok'&&<div className="feedback good"><b>Верно!</b><button onClick={next}>{index===steps.length-1?'Завершить урок':'Дальше →'}</button></div>}{!step.question&&<button className="lesson-next" onClick={next}>{index===steps.length-1?'Завершить урок':'Понятно, дальше →'}</button>}<PythagorasMentor context={`${step.title}. ${step.text} ${step.question??''}`} /></section></main>;
}