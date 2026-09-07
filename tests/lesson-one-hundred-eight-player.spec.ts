import {expect,test} from '@playwright/test';
import {lessonOneHundredEightProgressKey,lessonOneHundredEightResponseCount,lessonOneHundredEightStages,lessonOneHundredEightTaskCount} from '../src/data/lessonOneHundredEightControl';

test('lesson 108 player has isolated control-work runtime',()=>{
  expect(lessonOneHundredEightTaskCount).toBe(8);
  expect(lessonOneHundredEightResponseCount).toBe(15);
  expect(lessonOneHundredEightProgressKey).toBe('mathnikita-lesson-108-control-v1');
  expect(lessonOneHundredEightStages.map(stage=>stage.id)).toEqual(['l108-rules','l108-task1','l108-task2','l108-task3','l108-task4','l108-task5','l108-task6','l108-task7','l108-task8','l108-submit','l108-summary']);
  expect(lessonOneHundredEightStages.filter(stage=>stage.kind==='task')).toHaveLength(8);
  expect(lessonOneHundredEightStages.at(-1)?.kind).toBe('summary');
});
