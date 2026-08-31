import fs from 'node:fs';

function edit(path,transforms){let s=fs.readFileSync(path,'utf8');for(const [before,after] of transforms){if(!s.includes(before))throw new Error(`Missing marker in ${path}: ${before.slice(0,100)}`);s=s.replace(before,after)}fs.writeFileSync(path,s)}

edit('src/CombinatoricsSynthesisPlayer.tsx',[[
"{id:'l87-reflection',kind:'story',eyebrow:'Рефлексия'",
"{id:'l87-final-check',kind:'model',eyebrow:'Финальная самопроверка',title:'Пять вопросов перед ответом',body:'Проверь: все ли варианты учтены, нет ли повторов, важен ли порядок, независимы ли шаги и соблюдены ли ограничения. Только после этого фиксируй итог.',visual:'verify'},\n{id:'l87-reflection',kind:'story',eyebrow:'Рефлексия'"
]]);

edit('src/LessonCourseShell.tsx',[
["import { CombinatoricsReinforcementPlayer } from './CombinatoricsReinforcementPlayer';","import { CombinatoricsReinforcementPlayer } from './CombinatoricsReinforcementPlayer';\nimport { CombinatoricsSynthesisPlayer } from './CombinatoricsSynthesisPlayer';"],
["import { lessonEightySixOpening } from './LessonEightySixOpening';","import { lessonEightySixOpening } from './LessonEightySixOpening';\nimport { lessonEightySevenOpening } from './LessonEightySevenOpening';"],
["const readyLessons=Array.from({length:86},(_,i)=>i+1);","const readyLessons=Array.from({length:87},(_,i)=>i+1);"],
["const opening=selectedLesson===86?lessonEightySixOpening:","const opening=selectedLesson===87?lessonEightySevenOpening:selectedLesson===86?lessonEightySixOpening:"],
["const runtime=selectedLesson===86?<CombinatoricsReinforcementPlayer key=\"lesson-86\"/>:","const runtime=selectedLesson===87?<CombinatoricsSynthesisPlayer key=\"lesson-87\"/>:selectedLesson===86?<CombinatoricsReinforcementPlayer key=\"lesson-86\"/>:"]
]);

edit('src/CourseCatalog.tsx',[
["readyDescriptions[86]='Закрепление § 24: ограничения на цифры, ведущий ноль, коды, порядок и сумма цифр; маршрут №651, 653, 655, 656, 658, повторение №670.';","readyDescriptions[86]='Закрепление § 24: ограничения на цифры, ведущий ноль, коды, порядок и сумма цифр; маршрут №651, 653, 655, 656, 658, повторение №670.';\nreadyDescriptions[87]='Итог § 24: неупорядоченные пары, правило произведения, маршруты, оптимизация и логика; маршрут №659, 661, 663, 664, 666, 667 и дополнительная №673.';"],
["Полностью готовы 86 уроков.","Полностью готовы 87 уроков."]
]);

edit('tests/lesson-eighty-six-full-flow.spec.ts',[["await expect(lessons.nth(86)).toBeDisabled();","await expect(lessons.nth(86)).toBeEnabled();"]]);

fs.rmSync('scripts/lesson-87-integrate-once.mjs');
fs.rmSync('.github/workflows/lesson-87-integrate-once.yml');
