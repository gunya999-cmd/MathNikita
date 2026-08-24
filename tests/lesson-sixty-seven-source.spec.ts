import {expect,test} from '@playwright/test';
import {lessonSixtySevenStages} from '../src/DivisionSynthesisPlayer';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 67 preserves the verified method-guide route and mature lesson contract',()=>{
  expect(lessonSixtySevenStages).toHaveLength(36);
  expect(lessonSixtySevenStages.filter(stage=>stage.activity)).toHaveLength(21);
  const exercises=new Set(lessonSixtySevenStages.map(stage=>stage.sourceExercise).filter(Boolean));
  for(const exercise of ['№ 510','№ 487','№ 497','№ 507','№ 509','№ 517'])expect([...exercises].some(value=>String(value).includes(exercise))).toBeTruthy();
  const practice=extendedPracticeByLesson[67];
  expect(practice.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(practice)).toBe(50);
});
