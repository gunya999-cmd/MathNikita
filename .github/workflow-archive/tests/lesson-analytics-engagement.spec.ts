import {expect,test} from '@playwright/test';
import {shouldCountEngagedSecond} from '../src/LessonAnalyticsTracker';

test('recent learner interaction counts as engaged study time',()=>{
  expect(shouldCountEngagedSecond(100_000,159_999,false)).toBeTruthy();
});

test('idle open tab stops counting active study time',()=>{
  expect(shouldCountEngagedSecond(100_000,160_000,false)).toBeFalsy();
});

test('active stage narration keeps study time engaged beyond the idle threshold',()=>{
  expect(shouldCountEngagedSecond(100_000,240_000,true)).toBeTruthy();
});
