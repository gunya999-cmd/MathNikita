import fs from 'node:fs';

function edit(path,replacements){let text=fs.readFileSync(path,'utf8');for(const [before,after] of replacements){if(!text.includes(before))throw new Error(`Missing integration marker in ${path}: ${before.slice(0,120)}`);text=text.replace(before,after)}fs.writeFileSync(path,text)}

edit('src/LessonCourseShell.tsx',[
  ["import { CombinatoricsIntroPlayer } from './CombinatoricsIntroPlayer';","import { CombinatoricsIntroPlayer } from './CombinatoricsIntroPlayer';\nimport { CombinatoricsReinforcementPlayer } from './CombinatoricsReinforcementPlayer';"],
  ["import { lessonEightyFiveOpening } from './LessonEightyFiveOpening';","import { lessonEightyFiveOpening } from './LessonEightyFiveOpening';\nimport { lessonEightySixOpening } from './LessonEightySixOpening';"],
  ["const readyLessons=Array.from({length:85},(_,i)=>i+1);","const readyLessons=Array.from({length:86},(_,i)=>i+1);"],
  ["const opening=selectedLesson===85?lessonEightyFiveOpening:","const opening=selectedLesson===86?lessonEightySixOpening:selectedLesson===85?lessonEightyFiveOpening:"],
  ["const runtime=selectedLesson===85?<CombinatoricsIntroPlayer key=\"lesson-85\"/>:","const runtime=selectedLesson===86?<CombinatoricsReinforcementPlayer key=\"lesson-86\"/>:selectedLesson===85?<CombinatoricsIntroPlayer key=\"lesson-85\"/>:"]
]);

edit('src/CourseCatalog.tsx',[
  ["readyDescriptions[85]='Начало § 24: систематический перебор, дерево возможных вариантов, ограничения на цифры и правило произведения; маршрут №645, 647, 649, 650, повторение №669(1,2).';","readyDescriptions[85]='Начало § 24: систематический перебор, дерево возможных вариантов, ограничения на цифры и правило произведения; маршрут №645, 647, 649, 650, повторение №669(1,2).';\nreadyDescriptions[86]='Закрепление § 24: ограничения в дереве вариантов, ведущий ноль, порядок цифр, сумма и чётность суммы; маршрут №651, 653, 655, 656, 658 и повторение №670.';"],
  ["Полностью готовы 85 уроков.","Полностью готовы 86 уроков."]
]);

fs.rmSync('scripts/lesson-86-integrate-once.mjs');
fs.rmSync('.github/workflows/lesson-86-integrate-once.yml');
