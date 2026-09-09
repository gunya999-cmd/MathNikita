import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredTwentyPractice,lessonOneHundredTwentyResponseCount} from '../src/data/lessonOneHundredTwentyPractice';
const source=readFileSync(new URL('../src/DecimalSubtractionFoundationsPlayer.tsx',import.meta.url),'utf8');

test('lesson 120 player teaches place-value decimal subtraction and exact §33 route',()=>{
 expect(lessonOneHundredTwentyPractice).toHaveLength(20);expect(lessonOneHundredTwentyResponseCount).toBe(50);
 for(const id of ['l120-place-value','l120-equalize','l120-comma-column','l120-subtract-natural','l120-borrow-across-comma','l120-zero-chain','l120-check','l120-ready','l120-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==120');expect(source).toContain('mathnikita-lesson-120-progress-v1');expect(source).toContain('lessonOneHundredTwentyResponseCount');
});
