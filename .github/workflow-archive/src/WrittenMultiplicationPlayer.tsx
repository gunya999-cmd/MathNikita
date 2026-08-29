import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './additionProperties.css';
import './multiplicationMeaning.css';
import './writtenMultiplication.css';

type Activity={
  id:string;
  type:'choice'|'input';
  prompt:string;
  options?:string[];
  answer:string|string[];
  explanation:string;
  hint:string;
  placeholder?:string;
};
type VisualKind='mission'|'place-map'|'column'|'carry'|'explorer'|'zero'|'estimate'|'route'|'budget'|'final';
type Stage={
  id:string;
  title:string;
  eyebrow:string;
  kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';
  body:string;
  note?:string;
  activity?:Activity;
  visual?:VisualKind;
  sourceExercise?:string;
};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-56-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleUpperCase('ru-RU').replace(/Ё/g,'Е').replace(/[×*]/g,'·').replace(/[\s.,;:!?()[\]{}'"«»]/g,'');
const answerMatches=(value:string,answer:string|string[])=>{const variants=Array.isArray(answer)?answer:[answer];return variants.some(item=>normalize(value)===normalize(item))};

export const lessonFiftySixStages:Stage[]=[
  {id:'l56-mission',kind:'story',eyebrow:'Урок 56 · § 16 · алгоритм',title:'Каждый перенос остаётся на своём разряде',body:'Мы уже умеем читать произведение и оценивать его масштаб. Теперь соберём письменное умножение на одну цифру в точный алгоритм: начнём с единиц, сохраним перенос, пройдём все разряды и проверим ответ прикидкой.',note:'Маршрут: разряды → 347·6 → переносы → нули внутри числа → многозначные числа → прикидка → задачи № 393–398.',visual:'mission'},
  {id:'l56-place-map',kind:'model',eyebrow:'Разрядная карта',title:'Столбик выравнивает одинаковые разряды',body:'Однозначный множитель записывают под цифрой единиц многозначного числа. Так единицы оказываются под единицами, а движение справа налево идёт без сдвига разрядов.',note:'Для 347·6 цифра 6 стоит под 7: первым вычисляется 7·6.',visual:'place-map'},
  {id:'l56-units-model',kind:'model',eyebrow:'Шаг 1 · единицы',title:'7·6=42: пишем 2, переносим 4',body:'В разряде единиц результата можно записать только 2 единицы. Четыре десятка из числа 42 переходят к следующему вычислению.',note:'Перенос 4 означает четыре десятка, а не четыре единицы.',visual:'carry'},
  {id:'l56-units-write',kind:'practice',eyebrow:'Шаг 1 · запись',title:'Цифра единиц произведения',body:'Начинаем вычисление 347·6 с произведения 7·6=42.',activity:{id:'l56-p1',type:'input',prompt:'Какую цифру запишем в разряде единиц?',answer:'2',placeholder:'Цифра',hint:'В числе 42 цифра единиц — 2.','explanation':'Записываем 2 единицы, а 4 десятка переносим.'},visual:'carry'},
  {id:'l56-units-carry',kind:'practice',eyebrow:'Шаг 1 · перенос',title:'Что уходит в десятки',body:'После записи цифры 2 остаются десятки произведения 42.',activity:{id:'l56-p2',type:'input',prompt:'Какое число переносим к разряду десятков?',answer:'4',placeholder:'Перенос',hint:'42=4 десятка+2 единицы.','explanation':'К следующему разряду переносим 4.'},visual:'carry'},
  {id:'l56-tens-model',kind:'model',eyebrow:'Шаг 2 · десятки',title:'Сначала умножение, затем перенос',body:'Умножаем 4 десятка на 6: получаем 24 десятка. Прибавляем перенесённые 4 десятка: 24+4=28. Записываем 8 в разряде десятков, а 2 переносим дальше.',note:'Перенос всегда прибавляют после умножения текущей цифры.',visual:'column'},
  {id:'l56-tens-write',kind:'practice',eyebrow:'Шаг 2 · запись',title:'Цифра десятков результата',body:'На шаге десятков получилось 4·6+4=28.',activity:{id:'l56-p3',type:'input',prompt:'Какую цифру запишем в разряде десятков?',answer:'8',placeholder:'Цифра',hint:'В числе 28 цифра единиц — 8; здесь она занимает разряд десятков ответа.','explanation':'Записываем 8 десятков.'},visual:'column'},
  {id:'l56-tens-carry',kind:'practice',eyebrow:'Шаг 2 · перенос',title:'Новый перенос',body:'После записи восьмёрки из результата 28 остаётся число для следующего разряда.',activity:{id:'l56-p4',type:'input',prompt:'Какое число переносим к сотням?',answer:'2',placeholder:'Перенос',hint:'28=2 десятка+8 единиц внутри текущего шага.','explanation':'К сотням переносим 2.'},visual:'carry'},
  {id:'l56-hundreds-model',kind:'model',eyebrow:'Шаг 3 · сотни',title:'Последний разряд забирает весь результат',body:'Умножаем 3 сотни на 6 и прибавляем перенос: 3·6+2=20. Слева больше цифр нет, поэтому записываем всё число 20 перед уже полученными цифрами 82.',note:'Получаем 2082. Последний перенос нельзя потерять.',visual:'column'},
  {id:'l56-product-347',kind:'practice',eyebrow:'Полный алгоритм',title:'Собираем 347·6',body:'Цифры справа налево появились так: 2, затем 8, затем слева число 20.',activity:{id:'l56-p5',type:'input',prompt:'Вычисли 347·6.',answer:['2082','2 082'],placeholder:'Ответ',hint:'7·6=42; 4·6+4=28; 3·6+2=20.','explanation':'347·6=2082.'},visual:'column'},
  {id:'l56-carry-lab',kind:'guided',eyebrow:'Интерактивная лаборатория',title:'Прокрути алгоритм по разрядам',body:'Передвигай ползунок и наблюдай, какая цифра обрабатывается, что записывается в ответ и какой перенос уходит в следующий разряд.',note:'Не перескакивай через ноль переноса: он тоже является точным состоянием алгоритма.',visual:'explorer'},
  {id:'l56-direction-check',kind:'quiz',eyebrow:'Лаборатория · вывод',title:'Направление имеет значение',body:'При письменном умножении на одну цифру перенос рождается в младшем разряде и должен попасть в соседний старший.',activity:{id:'l56-p6',type:'choice',prompt:'В каком направлении выполняем алгоритм?',options:['Справа налево: от единиц к старшим разрядам','Слева направо: от старших разрядов к единицам','С середины к краям','Порядок не имеет значения'],answer:'Справа налево: от единиц к старшим разрядам',hint:'Первым шагом было 7·6.','explanation':'Начинаем с единиц и движемся справа налево.'},visual:'explorer'},
  {id:'l56-zero-model',kind:'model',eyebrow:'Ноль внутри числа',title:'Нулевой разряд не пропускают',body:'В произведении 508·7 после шага единиц перенос равен 5. В разряде десятков вычисляем 0·7+5=5, поэтому в ответе появляется цифра 5, а не ноль.',note:'Цифра 0 участвует в алгоритме и удерживает разряд.',visual:'zero'},
  {id:'l56-zero-units',kind:'practice',eyebrow:'508·7 · единицы',title:'Первый перенос',body:'В разряде единиц вычисляем 8·7=56.',activity:{id:'l56-p7',type:'input',prompt:'Какую цифру записываем в единицы?',answer:'6',placeholder:'Цифра',hint:'Единицы числа 56.','explanation':'Записываем 6, переносим 5.'},visual:'zero'},
  {id:'l56-zero-tens',kind:'model',eyebrow:'508·7 · десятки',title:'0·7+5=5',body:'Ноль десятков умножается на 7, затем к результату прибавляется перенос 5. Получаем 5 десятков и перенос 0.',note:'Если просто переписать ноль, получится неверный ответ 3506.',visual:'zero'},
  {id:'l56-product-508',kind:'practice',eyebrow:'508·7 · итог',title:'Ноль обработан правильно',body:'Сотни дают 5·7+0=35. Перед цифрами 56 записываем 35.',activity:{id:'l56-p8',type:'input',prompt:'Вычисли 508·7.',answer:['3556','3 556'],placeholder:'Ответ',hint:'8·7=56; 0·7+5=5; 5·7=35.','explanation':'508·7=3556.'},visual:'zero'},
  {id:'l56-zero-error',kind:'quiz',eyebrow:'Диагностика ошибки',title:'Почему ответ 3506 неверен',body:'В записи 3506 ученик сохранил ноль десятков, но забыл прибавить к нему перенос 5 после вычисления 8·7.',activity:{id:'l56-p9',type:'choice',prompt:'Как правильно обработать разряд десятков?',options:['Вычислить 0·7+5=5','Всегда переписать 0','Прибавить перенос к сотням','Удалить разряд десятков'],answer:'Вычислить 0·7+5=5',hint:'Перенос относится к ближайшему следующему разряду.','explanation':'Ноль умножаем на 7 и сразу прибавляем перенос: получается 5.'},visual:'zero'},
  {id:'l56-four-digit-model',kind:'model',eyebrow:'Четыре разряда',title:'Алгоритм не меняется для 1245·4',body:'5·4=20; 4·4+2=18; 2·4+1=9; 1·4=4. Справа налево ответ собирается как 4980.',note:'Количество шагов равно количеству цифр многозначного множителя.',visual:'column'},
  {id:'l56-product-1245',kind:'practice',eyebrow:'Четыре разряда · контроль',title:'Сохраняем два переноса подряд',body:'После единиц переносим 2, после десятков — 1, а на шаге сотен переноса уже нет.',activity:{id:'l56-p10',type:'input',prompt:'Вычисли 1245·4.',answer:['4980','4 980'],placeholder:'Ответ',hint:'5·4=20; 4·4+2=18; 2·4+1=9; 1·4=4.','explanation':'1245·4=4980.'},visual:'column'},
  {id:'l56-transfer-check',kind:'practice',eyebrow:'Контроль переноса',title:'Сотни в произведении 1245·4',body:'На шаге сотен вычисляется 2·4+1=9.',activity:{id:'l56-p11',type:'input',prompt:'Какую цифру записываем в разряде сотен результата?',answer:'9',placeholder:'Цифра',hint:'К 2·4 прибавь перенос 1.','explanation':'2·4+1=9, поэтому цифра сотен — 9.'},visual:'carry'},
  {id:'l56-leading-zero-model',kind:'model',eyebrow:'Нули между старшими разрядами',title:'9006·3 проходит через каждый ноль',body:'6·3=18; затем 0·3+1=1; следующий ноль даёт 0; 9·3=27. Получается 27 018.',note:'Два нуля в исходном числе дают разные шаги: на первом есть перенос, на втором его уже нет.',visual:'zero'},
  {id:'l56-product-9006',kind:'practice',eyebrow:'Нули внутри числа',title:'Два нулевых разряда',body:'После обработки единиц перенос 1 попадает только в десятки. Разряд сотен остаётся нулём.',activity:{id:'l56-p12',type:'input',prompt:'Вычисли 9006·3.',answer:['27018','27 018'],placeholder:'Ответ',hint:'6·3=18; 0·3+1=1; 0·3=0; 9·3=27.','explanation':'9006·3=27018.'},visual:'zero'},
  {id:'l56-product-7008',kind:'practice',eyebrow:'Самостоятельный алгоритм',title:'Перенос заполняет разряд десятков',body:'После 8·4=32 перенос 3 прибавляется к нулю десятков; ноль сотен остаётся на месте.',activity:{id:'l56-p13',type:'input',prompt:'Вычисли 7008·4.',answer:['28032','28 032'],placeholder:'Ответ',hint:'8·4=32; 0·4+3=3; 0·4=0; 7·4=28.','explanation':'7008·4=28032.'},visual:'zero'},
  {id:'l56-nines-model',kind:'model',eyebrow:'Цепочка переносов',title:'999·9: перенос на каждом шаге',body:'9·9=81; затем 9·9+8=89; снова 9·9+8=89. Записываем справа 1, затем 9, а слева — 89: получаем 8991.',note:'Одинаковые цифры не означают одинаковую записываемую цифру: первый шаг и последующие имеют разные переносы.',visual:'carry'},
  {id:'l56-product-999',kind:'practice',eyebrow:'Цепочка переносов · контроль',title:'Три девятки',body:'Следи за переносом 8 на втором и третьем шагах.',activity:{id:'l56-p14',type:'input',prompt:'Вычисли 999·9.',answer:['8991','8 991'],placeholder:'Ответ',hint:'9·9=81; два следующих шага дают 89.','explanation':'999·9=8991.'},visual:'carry'},
  {id:'l56-estimate-model',kind:'model',eyebrow:'Прикидка',title:'Проверяем длину и масштаб ответа',body:'Число 1245 близко к 1250, а 1250·4=5000. Поэтому точный ответ 4980 выглядит правдоподобно; ответы 498 и 49 800 сразу не проходят проверку.',note:'Прикидка ловит потерянный старший перенос и лишний нуль.',visual:'estimate'},
  {id:'l56-estimate-check',kind:'quiz',eyebrow:'Контроль масштаба',title:'Коридор для 1245·4',body:'Округление до 1250 даёт удобную опору 5000.',activity:{id:'l56-p15',type:'choice',prompt:'В каком диапазоне лежит 1245·4?',options:['От 4 000 до 6 000','От 400 до 600','От 40 000 до 60 000','Меньше 100'],answer:'От 4 000 до 6 000',hint:'1250·4=5000.','explanation':'Точное значение 4980 лежит между 4000 и 6000.'},visual:'estimate'},
  {id:'l56-route-model',kind:'model',eyebrow:'Учебник · № 396',title:'Два пути — два произведения',body:'По реке путешественник прошёл 5·27=135 км, по озеру — 7·21=147 км. После письменного умножения сравниваем пути и находим разность.',sourceExercise:'396',note:'В задаче единицы измерения появляются только в готовых величинах: км/ч·ч=км.',visual:'route'},
  {id:'l56-route-river',kind:'practice',eyebrow:'Учебник · № 396 · река',title:'Пять часов по 27 км',body:'Умножь скорость 27 км/ч на 5 часов.',sourceExercise:'396',activity:{id:'l56-p16',type:'input',prompt:'Какой путь пройден по реке, км?',answer:'135',placeholder:'км',hint:'27·5.','explanation':'27·5=135 км.'},visual:'route'},
  {id:'l56-route-difference',kind:'practice',eyebrow:'Учебник · № 396 · сравнение',title:'Озеро против реки',body:'Путь по озеру равен 21·7=147 км, а по реке — 135 км.',sourceExercise:'396',activity:{id:'l56-p17',type:'input',prompt:'На сколько километров путь по озеру длиннее?',answer:'12',placeholder:'км',hint:'147−135.','explanation':'147−135=12 км.'},visual:'route'},
  {id:'l56-fruit-multiplication',kind:'practice',eyebrow:'Учебник · № 397',title:'В семь раз больше',body:'Апельсинов было 94 кг, а мандаринов — в 7 раз больше. Это прямое применение письменного умножения на одну цифру.',sourceExercise:'397',activity:{id:'l56-p18',type:'input',prompt:'Сколько килограммов мандаринов привезли?',answer:'658',placeholder:'кг',hint:'94·7.','explanation':'94·7=658 кг.'},visual:'route'},
  {id:'l56-fruit-total',kind:'practice',eyebrow:'Учебник · № 397 · итог',title:'Три вида фруктов',body:'Апельсинов 94 кг, мандаринов 658 кг, а лимонов на 16 кг меньше, чем апельсинов: 78 кг.',sourceExercise:'397',activity:{id:'l56-p19',type:'input',prompt:'Сколько килограммов фруктов привезли всего?',answer:'830',placeholder:'кг',hint:'94+658+78.','explanation':'94+658+78=830 кг.'},visual:'route'},
  {id:'l56-budget-model',kind:'model',eyebrow:'Учебник · № 398',title:'Бюджет проверяет несколько действий',body:'Аудиомагнитола стоит 3600 р. Телевизор в 4 раза дороже: 14 400 р. DVD-проигрыватель дороже аудиомагнитолы на 28 200 р.: 31 800 р. Общая стоимость равна 49 800 р.',sourceExercise:'398',note:'Выделенных 50 000 р. хватает, остаток составляет 200 р.',visual:'budget'},
  {id:'l56-budget-check',kind:'quiz',eyebrow:'Учебник · № 398 · решение',title:'Хватит ли денег',body:'Сравни общую стоимость 49 800 р. с выделенной суммой 50 000 р.',sourceExercise:'398',activity:{id:'l56-p20',type:'choice',prompt:'Какой вывод верен?',options:['Денег хватает, останется 200 р.','Не хватает 200 р.','Денег хватает, останется 2 000 р.','Стоимость равна 50 000 р.'],answer:'Денег хватает, останется 200 р.',hint:'50000−49800.','explanation':'50000>49800, после покупки останется 200 р.'},visual:'budget'},
  {id:'l56-mastery-gate',kind:'challenge',eyebrow:'Mastery gate',title:'Новый пример без подсказки по разрядам',body:'Пройди алгоритм справа налево, сохрани оба переноса и проверь ответ прикидкой 200·5=1000.',activity:{id:'l56-p21',type:'input',prompt:'Вычисли 236·5.',answer:['1180','1 180'],placeholder:'Ответ',hint:'6·5=30; 3·5+3=18; 2·5+1=11.','explanation':'236·5=1180; прикидка около 1000 подтверждает масштаб.'},visual:'estimate'},
  {id:'l56-summary',kind:'summary',eyebrow:'Итог урока',title:'Письменное умножение собрано в систему',body:'Ты выравниваешь разряды, начинаешь с единиц, записываешь младшую цифру каждого промежуточного результата, переносишь старшую часть, обрабатываешь нули внутри числа и проверяешь итог прикидкой.',note:'Дальше — обязательная тренировка: 20 задач и 50 ответов с мгновенной проверкой и помощью Пифагора.',visual:'final'}
];

const explorerSteps=[
  {place:'единицы',expression:'7·6=42',write:'2',carry:'4',result:'…2'},
  {place:'десятки',expression:'4·6+4=28',write:'8',carry:'2',result:'…82'},
  {place:'сотни',expression:'3·6+2=20',write:'20',carry:'0',result:'2082'},
  {place:'проверка',expression:'350·6≈2100',write:'2082',carry:'0',result:'2082'}
];

function CarryExplorer(){
  const[step,setStep]=useState(0);const item=explorerSteps[step];
  return <div className="written-carry-explorer" data-carry-lab="interactive" data-step={step} data-place={item.place} data-write={item.write} data-carry={item.carry} data-result={item.result}>
    <label><span>Шаг алгоритма: <b>{step+1} из {explorerSteps.length}</b></span><input aria-label="Шаг письменного умножения" type="range" min="0" max={explorerSteps.length-1} value={step} onChange={event=>setStep(Number(event.target.value))}/></label>
    <div className="written-carry-readout"><span><small>разряд</small><b>{item.place}</b></span><span><small>вычисление</small><b>{item.expression}</b></span><span><small>пишем</small><strong>{item.write}</strong></span><span><small>перенос</small><strong>{item.carry}</strong></span></div>
    <p>Собранная часть ответа: <b>{item.result}</b></p>
  </div>;
}

function Column({number='347',multiplier='6',product='2082'}:{number?:string;multiplier?:string;product?:string}){
  return <div className="written-column" aria-label={`Письменное умножение ${number} на ${multiplier}`}><span>×</span><b>{number}</b><b>{multiplier}</b><i/><strong>{product}</strong></div>;
}

function Visual({kind}:{kind:VisualKind}){
  if(kind==='explorer')return <CarryExplorer/>;
  if(kind==='mission')return <div className="written-multiplication-visual" data-visual="mission"><div className="written-route"><span>единицы</span><i>→</i><span>десятки</span><i>→</i><span>сотни</span><i>→</i><strong>проверка</strong></div></div>;
  if(kind==='place-map')return <div className="written-multiplication-visual" data-visual="place-map"><div className="written-place-map"><span><small>сотни</small><b>3</b></span><span><small>десятки</small><b>4</b></span><span><small>единицы</small><b>7</b><em>×6</em></span></div><p>однозначный множитель стоит под единицами</p></div>;
  if(kind==='column')return <div className="written-multiplication-visual" data-visual="column"><Column/><div className="written-column-steps"><span>7·6=42</span><span>4·6+4=28</span><span>3·6+2=20</span></div></div>;
  if(kind==='carry')return <div className="written-multiplication-visual" data-visual="carry"><div className="written-carry-cards"><span><small>получили</small><b>42</b></span><span><small>пишем</small><strong>2</strong></span><span><small>переносим</small><strong>4</strong></span></div></div>;
  if(kind==='zero')return <div className="written-multiplication-visual" data-visual="zero"><Column number="508" multiplier="7" product="3556"/><div className="written-zero-chain"><span>8·7=56</span><span><mark>0·7+5=5</mark></span><span>5·7=35</span></div></div>;
  if(kind==='estimate')return <div className="written-multiplication-visual" data-visual="estimate"><div className="written-estimate"><b>1245·4</b><span>≈</span><b>1250·4</b><span>=</span><strong>5000</strong></div><small>точный ответ 4980 находится рядом</small></div>;
  if(kind==='route')return <div className="written-multiplication-visual" data-visual="route"><div className="written-problem-grid"><span><small>река</small><b>27·5</b><strong>135 км</strong></span><span><small>озеро</small><b>21·7</b><strong>147 км</strong></span><span><small>разница</small><b>147−135</b><strong>12 км</strong></span></div></div>;
  if(kind==='budget')return <div className="written-multiplication-visual" data-visual="budget"><div className="written-budget"><span><small>магнитола</small><b>3 600 р.</b></span><span><small>телевизор</small><b>14 400 р.</b></span><span><small>DVD</small><b>31 800 р.</b></span><strong>49 800 р. ≤ 50 000 р.</strong></div></div>;
  return <div className="written-multiplication-visual" data-visual="final"><div className="written-final"><b>справа налево ✓</b><b>разряды ✓</b><b>переносы ✓</b><b>нули внутри ✓</b><b>прикидка ✓</b><b>задачи ✓</b></div></div>;
}

function emptySaved():Saved{return{version:1,stageIndex:0,responses:{},checked:{},results:{},attempts:{}}}
function loadSaved():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return emptySaved();const parsed=JSON.parse(raw) as Partial<Saved>;return{version:1,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonFiftySixStages.length-1),responses:parsed.responses??{},checked:parsed.checked??{},results:parsed.results??{},attempts:parsed.attempts??{}}}catch{return emptySaved()}}
function stopNarration(){window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'));if('speechSynthesis'in window)window.speechSynthesis.cancel()}

export function WrittenMultiplicationPlayer(){
  const[saved,setSaved]=useState<Saved>(()=>loadSaved());const stage=lessonFiftySixStages[saved.stageIndex];const activity=stage.activity;const response=activity?saved.responses[activity.id]??'':'';const wasChecked=activity?Boolean(saved.checked[activity.id]):false;const isCorrect=activity?Boolean(saved.results[activity.id]):true;const attempts=activity?saved.attempts[activity.id]??0:0;const canContinue=!activity||isCorrect||attempts>=2;
  const progress=useMemo(()=>Math.round(((saved.stageIndex+1)/lessonFiftySixStages.length)*100),[saved.stageIndex]);
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(saved))},[saved]);
  useEffect(()=>{const handler=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==56||typeof detail.stageIndex!=='number')return;const index=Math.min(Math.max(detail.stageIndex,0),lessonFiftySixStages.length-1);stopNarration();setSaved(previous=>({...previous,stageIndex:index}))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  function setResponse(value:string){if(!activity)return;setSaved(previous=>({...previous,responses:{...previous.responses,[activity.id]:value},checked:{...previous.checked,[activity.id]:false},results:{...previous.results,[activity.id]:false}}))}
  function check(){if(!activity||!response)return;const correct=answerMatches(response,activity.answer);setSaved(previous=>({...previous,checked:{...previous.checked,[activity.id]:true},results:{...previous.results,[activity.id]:correct},attempts:{...previous.attempts,[activity.id]:(previous.attempts[activity.id]??0)+(correct?0:1)}}))}
  function next(){if(!canContinue||saved.stageIndex>=lessonFiftySixStages.length-1)return;stopNarration();setSaved(previous=>({...previous,stageIndex:previous.stageIndex+1}))}
  function previous(){if(saved.stageIndex===0)return;stopNarration();setSaved(previous=>({...previous,stageIndex:previous.stageIndex-1}))}
  return <section className="lesson-player written-multiplication-player" data-lesson-number="56" data-source-reference="Мерзляк § 16 · с. 106–113 · № 393–398" data-source-exercise-range="393-398"><article className={['interactive-stage',stage.kind==='summary'?'stage-summary':''].filter(Boolean).join(' ')} data-stage-id={stage.id} data-source-exercise={stage.sourceExercise}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{stage.visual?<Visual kind={stage.visual}/>:null}{activity?<div className="activity-area"><h3>{activity.prompt}</h3>{activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={response===option?'selected':''} onClick={()=>setResponse(option)}>{option}</button>)}</div>:<label className="inline-answer"><span>Ответ</span><input value={response} placeholder={activity.placeholder??'Введите ответ'} onChange={event=>setResponse(event.target.value)}/></label>}<button type="button" className="check-button" disabled={!response} onClick={check}>Проверить</button>{wasChecked?<div className={['instant-feedback',isCorrect?'good':'bad'].join(' ')} data-explanation={activity.explanation}><strong>{isCorrect?'Верно':'Пока нет'}</strong><span>{isCorrect?activity.explanation:attempts>=2?activity.hint+' Можно перейти дальше и вернуться к заданию позже.':activity.hint}</span></div>:null}</div>:null}<div className="lesson-controls"><button type="button" onClick={previous} disabled={saved.stageIndex===0}>Назад</button><span>Этап {saved.stageIndex+1} из {lessonFiftySixStages.length} · {progress}%</span><button type="button" className="primary" onClick={next} disabled={saved.stageIndex===lessonFiftySixStages.length-1||!canContinue}>{saved.stageIndex===lessonFiftySixStages.length-1?'Итог':'Дальше'}</button></div></article></section>;
}
