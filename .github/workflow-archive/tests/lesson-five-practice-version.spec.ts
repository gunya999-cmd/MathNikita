import { expect,test } from '@playwright/test';
import { extendedPracticeStorageKey } from '../src/extendedPracticeEngine';

test('lesson 5 revised mandatory practice uses a new progress version',()=>{
  expect(extendedPracticeStorageKey(5)).toBe('mathnikita:extended-practice:5:v2');
  expect(extendedPracticeStorageKey(4)).toBe('mathnikita:extended-practice:4:v1');
});
