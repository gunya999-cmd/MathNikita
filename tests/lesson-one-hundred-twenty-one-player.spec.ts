import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredTwentyOnePractice,lessonOneHundredTwentyOneResponseCount} from '../src/data/lessonOneHundredTwentyOnePractice';
const source=readFileSync(new URL('../src/DecimalAddSubtractEquationsPlayer.tsx',import.meta.url),'utf8');

test('lesson 121 player teaches inverse operations, equations and exact §33 route',()=>{
 expect(lessonOneHundredTwentyOnePractice).toHaveLength(20);expect(lessonOneHundredTwentyOneResponseCount).toBe(50);
 for(const id of ['l121-inverse-operations','l121-unknown-addend','l121-unknown-minuend','l121-unknown-subtrahend','l121-parentheses','l121-check-substitution','l121-word-model','l121-ready','l121-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==121');expect(source).toContain('mathnikita-lesson-121-progress-v1');expect(source).toContain('lessonOneHundredTwentyOneResponseCount');
});
