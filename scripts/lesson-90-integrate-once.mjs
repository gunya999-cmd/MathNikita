import fs from 'node:fs';
function replaceOne(text,from,to,label){if(!text.includes(from))throw new Error(`Missing ${label}`);return text.replace(from,to)}
let shell=fs.readFileSync('src/LessonCourseShell.tsx','utf8');
shell=replaceOne(shell,"import { ControlWorkFourPlayer } from './ControlWorkFourPlayer';","import { ControlWorkFourPlayer } from './ControlWorkFourPlayer';\nimport { ControlWorkFivePlayer } from './ControlWorkFivePlayer';",'control-five import');
shell=replaceOne(shell,'const readyLessons=Array.from({length:89},(_,i)=>i+1);','const readyLessons=Array.from({length:90},(_,i)=>i+1);','ready lesson count');
shell=replaceOne(shell,'const isControlWork=selectedLesson===20||selectedLesson===33||selectedLesson===53||selectedLesson===73;','const isControlWork=selectedLesson===20||selectedLesson===33||selectedLesson===53||selectedLesson===73||selectedLesson===90;','control list');
shell=replaceOne(shell,'const runtime=selectedLesson===89?<ChapterThreeCorrectionPlayer key="lesson-89"/>:','const runtime=selectedLesson===90?<ControlWorkFivePlayer key="lesson-90"/>:selectedLesson===89?<ChapterThreeCorrectionPlayer key="lesson-89"/>:','runtime 90');
fs.writeFileSync('src/LessonCourseShell.tsx',shell);
let catalog=fs.readFileSync('src/CourseCatalog.tsx','utf8');
catalog=replaceOne(catalog,"readyDescriptions[89]='Второе повторение главы 3: коррекция по восьми моделям контрольной №5 на новых числах — остаток, площадь, куб, объём, гектары, комбинаторика и сумма рёбер.';","readyDescriptions[89]='Второе повторение главы 3: коррекция по восьми моделям контрольной №5 на новых числах — остаток, площадь, куб, объём, гектары, комбинаторика и сумма рёбер.';\nreadyDescriptions[90]='Контрольная работа № 5, вариант 1: 8 исходных заданий и 10 оцениваемых ответов по делению с остатком, площади, объёму, комбинаторике и параллелепипеду.';",'catalog description');
catalog=replaceOne(catalog,'Полностью готовы 89 уроков.','Полностью готовы 90 уроков.','catalog count');
fs.writeFileSync('src/CourseCatalog.tsx',catalog);
fs.rmSync('scripts/lesson-90-integrate-once.mjs');
fs.rmSync('.github/workflows/lesson-90-integrate-once.yml');