import fs from 'node:fs';

function patch(path,replacements){let text=fs.readFileSync(path,'utf8');for(const [from,to] of replacements){if(!text.includes(from))throw new Error(`${path}: missing patch anchor: ${from.slice(0,120)}`);text=text.replace(from,to)}fs.writeFileSync(path,text)}

patch('src/data/yearPlan.ts',[["available:segment.from+offset<=33","available:segment.from+offset<=34"]]);

patch('src/LessonCourseShell.tsx',[
  ["import { NaturalNumberWordProblemsPlayer } from './NaturalNumberWordProblemsPlayer';import { LessonThirtyPlayer } from './LessonThirtyPlayer';import { LetterExpressionsPracticePlayer } from './LetterExpressionsPracticePlayer';import { FormulaPracticePlayer } from './FormulaPracticePlayer';import { ControlWorkTwoPlayer } from './ControlWorkTwoPlayer';","import { NaturalNumberWordProblemsPlayer } from './NaturalNumberWordProblemsPlayer';import { LessonThirtyPlayer } from './LessonThirtyPlayer';import { LetterExpressionsPracticePlayer } from './LetterExpressionsPracticePlayer';import { FormulaPracticePlayer } from './FormulaPracticePlayer';import { ControlWorkTwoPlayer } from './ControlWorkTwoPlayer';import { EquationLessonPlayer } from './EquationLessonPlayer';"],
  ["import { lessonThirtyTwoOpening } from './LessonThirtyTwoOpening';import { lessonThirtyThreeOpening } from './LessonThirtyThreeOpening';","import { lessonThirtyTwoOpening } from './LessonThirtyTwoOpening';import { lessonThirtyThreeOpening } from './LessonThirtyThreeOpening';import { lessonThirtyFourOpening } from './LessonThirtyFourOpening';"],
  ["const readyLessons=Array.from({length:33},(_,i)=>i+1);","const readyLessons=Array.from({length:34},(_,i)=>i+1);"],
  ["lessonThirtyOneOpening,lessonThirtyTwoOpening,lessonThirtyThreeOpening];","lessonThirtyOneOpening,lessonThirtyTwoOpening,lessonThirtyThreeOpening,lessonThirtyFourOpening];"],
  ["if(mode==='catalog')return <CourseCatalog selectedLesson={selectedLesson} onOpenLesson={openLesson}/>;const runtime=selectedLesson===33?<ControlWorkTwoPlayer key=\"lesson-33\"/>","if(mode==='catalog')return <CourseCatalog selectedLesson={selectedLesson} onOpenLesson={openLesson}/>;const runtime=selectedLesson===34?<EquationLessonPlayer key=\"lesson-34\"/>:selectedLesson===33?<ControlWorkTwoPlayer key=\"lesson-33\"/>"]
]);

patch('src/data/extendedPracticeData.ts',[
  ["import { extendedPracticeLesson32 } from './extendedPracticeLesson32';","import { extendedPracticeLesson32 } from './extendedPracticeLesson32';\nimport { extendedPracticeLesson34 } from './extendedPracticeLesson34';"],
  ["31:extendedPracticeLesson31,32:extendedPracticeLesson32};","31:extendedPracticeLesson31,32:extendedPracticeLesson32,34:extendedPracticeLesson34};"],
  ["29:[],30:[],31:[],32:[]};","29:[],30:[],31:[],32:[],34:[]};"]
]);

patch('src/CourseCatalog.tsx',[
  ["33:'Контрольная работа № 2: 10 заданий и 20 оцениваемых подпунктов по сложению, вычитанию, прикидке, выражениям, текстовым задачам и формулам.'};","33:'Контрольная работа № 2: 10 заданий и 20 оцениваемых подпунктов по сложению, вычитанию, прикидке, выражениям, текстовым задачам и формулам.',34:'Новая тема § 10: понятие уравнения и корня, проверка подстановкой, неизвестные компоненты сложения и вычитания, перевод текста в уравнение.'};"],
  ["Полностью готовы 33 интерактивных урока.","Полностью готовы 34 интерактивных урока."]
]);

patch('src/App.tsx',[["i===1?'13 уроков готовы'","i===1?'14 уроков готовы'"]]);

patch('tests/pedagogical-practice-quality.spec.ts',[
  ["for(let lessonNumber=1;lessonNumber<=32;lessonNumber+=1){","for(let lessonNumber=1;lessonNumber<=34;lessonNumber+=1){"],
  ["if(lessonNumber===20)continue;","if(lessonNumber===20||lessonNumber===33)continue;"]
]);

patch('tests/extended-practice-count.spec.ts',[
  ["for(let lessonNumber=1;lessonNumber<=27;lessonNumber+=1){","for(let lessonNumber=1;lessonNumber<=34;lessonNumber+=1){"],
  ["if(lessonNumber===20)continue;","if(lessonNumber===20||lessonNumber===33)continue;"]
]);

patch('tests/course-plan.spec.ts',[
  ["catalog follows the official 175-lesson Merzlyak plan through lesson 33","catalog follows the official 175-lesson Merzlyak plan through lesson 34"],
  ["button.is-interactive')).toHaveCount(31)","button.is-interactive')).toHaveCount(32)"],
  ["button:not([disabled])')).toHaveCount(33)","button:not([disabled])')).toHaveCount(34)"],
  ["await expect(lessons.nth(33)).toContainText('Уравнение');\n  await expect(lessons.nth(33)).toBeDisabled();","await expect(lessons.nth(33)).toContainText('Уравнение');\n  await expect(lessons.nth(33)).toBeEnabled();\n  await expect(lessons.nth(33)).toHaveClass(/is-interactive/);\n  await expect(lessons.nth(34)).toContainText('Уравнение');\n  await expect(lessons.nth(34)).toBeDisabled();"],
  ["Полностью готовы 33 интерактивных урока.","Полностью готовы 34 интерактивных урока."]
]);

console.log('Lesson 34 integration patches applied.');
