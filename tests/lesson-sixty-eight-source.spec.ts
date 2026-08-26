import {expect,test} from '@playwright/test';
import {lessonSixtyEightStages} from '../src/RemainderDivisionPlayer';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 68 preserves the verified method-guide route and mature lesson contract',()=>{
  expect(lessonSixtyEightStages).toHaveLength(36);
  expect(lessonSixtyEightStages.filter(stage=>stage.activity)).toHaveLength(21);
  const exercises=new Set(lessonSixtyEightStages.map(stage=>stage.sourceExercise).filter(Boolean));
  for(const exercise of ['№ 521','№ 523','№ 525','№ 527','№ 545'])expect([...exercises].some(value=>String(value).includes(exercise))).toBeTruthy();
  expect(lessonSixtyEightStages.some(stage=>stage.body.includes('0 ≤ r < b'))).toBeTruthy();
  expect(lessonSixtyEightStages.some(stage=>stage.body.includes('a = b·q + r'))).toBeTruthy();
  const practice=extendedPracticeByLesson[68];
  expect(practice.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(practice)).toBe(50);
});
