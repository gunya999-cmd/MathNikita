import {expect,test} from '@playwright/test';
import {lessonSeventyStages} from '../src/RemainderDivisionSynthesisPlayer';

test('lesson 70 reverse remainder problems enumerate every valid divisor',()=>{
  const byId=new Map(lessonSeventyStages.map(stage=>[stage.id,stage]));
  expect(byId.get('l70-537-divisors')?.activity?.answer).toEqual(['37,185','185,37']);
  expect(byId.get('l70-538-divisors')?.activity?.answer).toEqual(['8,13,26,52,104','104,52,26,13,8']);
  expect(byId.get('l70-540-answer')?.activity?.answer).toBe('53');
  expect(byId.get('l70-543-proof')?.activity?.answer).toBe('a=10b+r и 0≤r<10');
});
