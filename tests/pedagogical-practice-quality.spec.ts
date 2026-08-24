import {expect,test} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';

for(let lessonNumber=1;lessonNumber<=67;lessonNumber+=1){
  if(lessonNumber===20||lessonNumber===33||lessonNumber===53)continue;

  test(`lesson ${lessonNumber} mandatory practice keeps a curated majority`,()=>{
    const practice=extendedPracticeByLesson[lessonNumber];
    expect(practice,`Lesson ${lessonNumber} has no mandatory-practice data`).toBeTruthy();
    expect(practice.tasks,`Lesson ${lessonNumber} must keep the 20-task contract`).toHaveLength(20);

    const parametric=practice.tasks.filter(task=>task.provenance==='parametric');
    const curated=practice.tasks.filter(task=>task.provenance!=='parametric');
    const formats=new Set(practice.tasks.map(task=>task.type));

    expect(parametric.length,`Lesson ${lessonNumber}: parametric drills must not dominate mandatory practice`).toBeLessThanOrEqual(8);
    expect(curated.length,`Lesson ${lessonNumber}: at least 12 of 20 tasks must be curated`).toBeGreaterThanOrEqual(12);
    expect(formats.size,`Lesson ${lessonNumber}: mandatory practice needs more than one response format`).toBeGreaterThanOrEqual(2);
    expect(new Set(practice.tasks.map(task=>task.id)).size,`Lesson ${lessonNumber}: task ids must be unique`).toBe(20);
  });
}
