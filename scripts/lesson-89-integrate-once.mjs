import fs from 'node:fs';

function replaceOne(text,from,to,label){if(!text.includes(from))throw new Error(`Missing ${label}`);return text.replace(from,to)}

const shellPath='src/LessonCourseShell.tsx';
let shell=fs.readFileSync(shellPath,'utf8');
shell=replaceOne(shell,"import { ChapterThreeReviewPlayer } from './ChapterThreeReviewPlayer';","import { ChapterThreeReviewPlayer } from './ChapterThreeReviewPlayer';\nimport { ChapterThreeCorrectionPlayer } from './ChapterThreeCorrectionPlayer';",'lesson 89 player import');
shell=replaceOne(shell,"import { lessonEightyEightOpening } from './LessonEightyEightOpening';","import { lessonEightyEightOpening } from './LessonEightyEightOpening';\nimport { lessonEightyNineOpening } from './LessonEightyNineOpening';",'lesson 89 opening import');
shell=replaceOne(shell,"const readyLessons=Array.from({length:88},(_,i)=>i+1);","const readyLessons=Array.from({length:89},(_,i)=>i+1);",'ready lesson boundary');
shell=replaceOne(shell,"const opening=selectedLesson===88?lessonEightyEightOpening:","const opening=selectedLesson===89?lessonEightyNineOpening:selectedLesson===88?lessonEightyEightOpening:",'opening chain');
shell=replaceOne(shell,"const runtime=selectedLesson===88?<ChapterThreeReviewPlayer key=\"lesson-88\"/>:","const runtime=selectedLesson===89?<ChapterThreeCorrectionPlayer key=\"lesson-89\"/>:selectedLesson===88?<ChapterThreeReviewPlayer key=\"lesson-88\"/>:",'runtime chain');
fs.writeFileSync(shellPath,shell);

const catalogPath='src/CourseCatalog.tsx';
let catalog=fs.readFileSync(catalogPath,'utf8');
catalog=replaceOne(catalog,"readyDescriptions[88]='Первое повторение главы 3: карта §§16–24 и все 12 вопросов задания №3 «Проверьте себя» с.167–168; диагностика перед уроком коррекции и контрольной №5.';","readyDescriptions[88]='Первое повторение главы 3: карта §§16–24 и все 12 вопросов задания №3 «Проверьте себя» с.167–168; диагностика перед уроком коррекции и контрольной №5.';\nreadyDescriptions[89]='Второе повторение главы 3: коррекция по восьми моделям контрольной №5 на новых числах — остаток, площадь, куб, объём, гектары, комбинаторика и сумма рёбер.';",'catalog lesson 89 description');
catalog=replaceOne(catalog,'Полностью готовы 88 уроков.','Полностью готовы 89 уроков.','catalog ready count');
fs.writeFileSync(catalogPath,catalog);

fs.rmSync('scripts/lesson-89-integrate-once.mjs');
fs.rmSync('.github/workflows/lesson-89-integrate-once.yml');
