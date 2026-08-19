import {expect,test} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';

for(let lessonNumber=1;lessonNumber<=52;lessonNumber+=1){
  if(lessonNumber===20||lessonNumber===33)continue;
  test(`lesson ${lessonNumber} has exactly twenty mandatory-practice tasks`,()=>{
    const practice=extendedPracticeByLesson[lessonNumber];
    expect(practice,`Lesson ${lessonNumber} has no mandatory-practice data`).toBeTruthy();
    expect(practice.tasks,`Lesson ${lessonNumber} must keep the 20-task contract`).toHaveLength(20);
    expect(new Set(practice.tasks.map(task=>task.id)).size,`Lesson ${lessonNumber} contains duplicate mandatory-practice ids`).toBe(20);
  });
}
