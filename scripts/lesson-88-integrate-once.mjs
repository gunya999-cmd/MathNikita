import fs from 'node:fs';
function edit(path,transforms){let s=fs.readFileSync(path,'utf8');for(const [before,after] of transforms){if(!s.includes(before))throw new Error(`Missing marker in ${path}: ${before.slice(0,120)}`);s=s.replace(before,after)}fs.writeFileSync(path,s)}
edit('src/LessonCourseShell.tsx',[
["import { CombinatoricsSynthesisPlayer } from './CombinatoricsSynthesisPlayer';","import { CombinatoricsSynthesisPlayer } from './CombinatoricsSynthesisPlayer';\nimport { ChapterThreeReviewPlayer } from './ChapterThreeReviewPlayer';"],
["import { lessonEightySevenOpening } from './LessonEightySevenOpening';","import { lessonEightySevenOpening } from './LessonEightySevenOpening';\nimport { lessonEightyEightOpening } from './LessonEightyEightOpening';"],
["const readyLessons=Array.from({length:87},(_,i)=>i+1);","const readyLessons=Array.from({length:88},(_,i)=>i+1);"],
["const opening=selectedLesson===87?lessonEightySevenOpening:","const opening=selectedLesson===88?lessonEightyEightOpening:selectedLesson===87?lessonEightySevenOpening:"],
["const runtime=selectedLesson===87?<CombinatoricsSynthesisPlayer key=\"lesson-87\"/>:","const runtime=selectedLesson===88?<ChapterThreeReviewPlayer key=\"lesson-88\"/>:selectedLesson===87?<CombinatoricsSynthesisPlayer key=\"lesson-87\"/>:"]
]);
edit('src/CourseCatalog.tsx',[
["readyDescriptions[87]='Итог § 24: неупорядоченные пары, правило произведения, маршруты, оптимизация и логика; маршрут №659, 661, 663, 664, 666, 667 и дополнительная №673.';","readyDescriptions[87]='Итог § 24: неупорядоченные пары, правило произведения, маршруты, оптимизация и логика; маршрут №659, 661, 663, 664, 666, 667 и дополнительная №673.';\nreadyDescriptions[88]='Первое повторение главы 3: карта §§16–24 и все 12 вопросов задания №3 «Проверьте себя» с.167–168; диагностика перед уроком коррекции и контрольной №5.';"],
["Полностью готовы 87 уроков.","Полностью готовы 88 уроков."]
]);
fs.rmSync('scripts/lesson-88-integrate-once.mjs');
fs.rmSync('.github/workflows/lesson-88-integrate-once.yml');
