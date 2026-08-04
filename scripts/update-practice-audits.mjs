import {readFile,writeFile,unlink} from 'node:fs/promises';

const lessons=[
  [9,'nine','Nine'],[10,'ten','Ten'],[11,'eleven','Eleven'],[12,'twelve','Twelve'],
  [13,'thirteen','Thirteen'],[14,'fourteen','Fourteen'],[15,'fifteen','Fifteen'],[16,'sixteen','Sixteen'],
];

for(const [number,word,cap] of lessons){
  const path=`tests/lesson-${word}-audit.spec.ts`;
  let text=await readFile(path,'utf8');
  text=text.replace(new RegExp(`import \\{ extendedPracticeLesson${number} \\} from '../src/data/extendedPracticeLesson${number}';\\n`),'');
  text=text.replace(new RegExp(`import \\{ lesson${cap}Mastery \\} from '../src/data/lesson${cap}Mastery';\\n`),'');
  text=text.replace("import type { ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';", "import { extendedPracticeSetResponseCount,type ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';\nimport { extendedPracticeByLesson } from '../src/data/extendedPracticeData';");
  text=text.replace(new RegExp(`const mandatoryTasks:ExtendedPracticeTask\\[\\]=\\[\\.\\.\\.extendedPracticeLesson${number}\\.tasks,\\.\\.\\.lesson${cap}Mastery\\];`),`const mandatoryPractice=extendedPracticeByLesson[${number}];\nconst mandatoryTasks:ExtendedPracticeTask[]=mandatoryPractice.tasks;\nconst mandatoryResponseCount=extendedPracticeSetResponseCount(mandatoryPractice);`);
  text=text.replaceAll("toContainText('18 заданий · 48 проверяемых ответов')","toContainText(`${mandatoryTasks.length} заданий · ${mandatoryResponseCount} проверяемых ответов`)");
  text=text.replaceAll("toContainText('Решены все 18 заданий и заполнены 48 проверяемых ответов')","toContainText(`Решены все ${mandatoryTasks.length} заданий и заполнены ${mandatoryResponseCount} проверяемых ответов`)");
  text=text.replaceAll('toHaveLength(18)','toHaveLength(20)');
  text=text.replaceAll('all 18 mandatory','all 20 mandatory');
  text=text.replaceAll('18 mandatory cards','20 mandatory cards');
  text=text.replaceAll('48 responses','56 responses');
  if(!text.includes(`const mandatoryPractice=extendedPracticeByLesson[${number}]`))throw new Error(`${path}: mandatory-practice source replacement failed`);
  if(text.includes("toContainText('18 заданий · 48 проверяемых ответов')"))throw new Error(`${path}: stale header expectation remains`);
  if(text.includes("toContainText('Решены все 18 заданий и заполнены 48 проверяемых ответов')"))throw new Error(`${path}: stale completion expectation remains`);
  await writeFile(path,text,'utf8');
}

await unlink(new URL('../.github/workflows/practice-audit-codemod.yml',import.meta.url));
await unlink(new URL('./update-practice-audits.mjs',import.meta.url));
console.log('Updated lesson 9-16 audits to the canonical twenty-task practice source.');
