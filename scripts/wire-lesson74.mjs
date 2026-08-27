import fs from 'node:fs';

function read(path){return fs.readFileSync(path,'utf8')}
function write(path,text){fs.writeFileSync(path,text)}
function mustReplace(text,search,replacement,label){if(!text.includes(search))throw new Error(`Missing wiring anchor: ${label}`);return text.replace(search,replacement)}

{
  const path='src/LessonCourseShell.tsx';let text=read(path);
  if(!text.includes("import { AreaFoundationsPlayer } from './AreaFoundationsPlayer';"))text=mustReplace(text,"import { ControlWorkFourPlayer } from './ControlWorkFourPlayer';","import { ControlWorkFourPlayer } from './ControlWorkFourPlayer';\nimport { AreaFoundationsPlayer } from './AreaFoundationsPlayer';\nimport { lessonSeventyFourOpening } from './LessonSeventyFourOpening';",'shell imports');
  text=mustReplace(text,'Array.from({length:73},(_,i)=>i+1)','Array.from({length:74},(_,i)=>i+1)','ready lessons 73->74');
  if(!text.includes('selectedLesson===74?lessonSeventyFourOpening'))text=mustReplace(text,'const opening=openings[selectedLesson-1]??buildGenericOpening(lesson);','const opening=selectedLesson===74?lessonSeventyFourOpening:(openings[selectedLesson-1]??buildGenericOpening(lesson));','lesson74 opening');
  if(!text.includes('selectedLesson===74?<AreaFoundationsPlayer/>')){
    const runtimeRoot=text.indexOf('lesson-runtime');
    const anchor=text.indexOf('selectedLesson===73',runtimeRoot);
    if(runtimeRoot<0||anchor<0)throw new Error('Missing wiring anchor: lesson74 runtime after lesson-runtime');
    text=text.slice(0,anchor)+'selectedLesson===74?<AreaFoundationsPlayer/>:'+text.slice(anchor);
  }
  write(path,text);
}

{
  const path='src/data/yearPlan.ts';let text=read(path);
  text=mustReplace(text,'available:segment.from+offset<=73','available:segment.from+offset<=74','year plan availability');
  write(path,text);
}

{
  const path='src/data/extendedPracticeData.ts';let text=read(path);
  if(!text.includes("import { extendedPracticeLesson74 } from './extendedPracticeLesson74';"))text=mustReplace(text,"import { extendedPracticeLesson72 } from './extendedPracticeLesson72';","import { extendedPracticeLesson72 } from './extendedPracticeLesson72';\nimport { extendedPracticeLesson74 } from './extendedPracticeLesson74';",'practice import');
  text=mustReplace(text,'71:extendedPracticeLesson71,72:extendedPracticeLesson72};','71:extendedPracticeLesson71,72:extendedPracticeLesson72,74:extendedPracticeLesson74};','practice map');
  text=mustReplace(text,'70:[],71:[],72:[]};','70:[],71:[],72:[],74:[]};','specialized practice map');
  write(path,text);
}

{
  const path='src/CourseCatalog.tsx';let text=read(path);
  if(!text.includes('readyDescriptions[74]='))text=mustReplace(text,'export function CourseCatalog',"readyDescriptions[74]='Новая тема § 21: свойства площади, единичный квадрат, квадратные единицы, формулы S=ab и S=a², равновеликие фигуры и точный маршрут № 564, 565, 566, 567, 569, 571, 572.';\nexport function CourseCatalog",'catalog lesson74 description');
  text=mustReplace(text,'Полностью готовы 73 урока.','Полностью готовы 74 урока.','catalog ready banner');
  write(path,text);
}

console.log('Lesson 74 wiring completed.');
