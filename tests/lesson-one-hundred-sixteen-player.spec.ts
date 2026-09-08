import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredSixteenPractice,lessonOneHundredSixteenResponseCount} from '../src/data/lessonOneHundredSixteenPractice';
const source=readFileSync(new URL('../src/RoundingFoundationsPlayer.tsx',import.meta.url),'utf8');

test('lesson 116 player teaches decimal and natural-number rounding foundations',()=>{
 expect(lessonOneHundredSixteenPractice).toHaveLength(20);expect(lessonOneHundredSixteenResponseCount).toBe(50);
 for(const id of ['l116-approximation','l116-decimal-rule','l116-zero-four','l116-five-nine','l116-carry','l116-natural-rule','l116-precision','l116-ready','l116-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==116');expect(source).toContain('mathnikita-lesson-116-progress-v1');expect(source).toContain('lessonOneHundredSixteenResponseCount');
});
