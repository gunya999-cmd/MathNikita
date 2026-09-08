import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredFourteenPractice,lessonOneHundredFourteenResponseCount} from '../src/data/lessonOneHundredFourteenPractice';
const source=readFileSync(new URL('../src/DecimalComparisonIntervalsPlayer.tsx',import.meta.url),'utf8');

test('lesson 114 player covers intervals and unknown digits',()=>{
 expect(lessonOneHundredFourteenPractice).toHaveLength(20);expect(lessonOneHundredFourteenResponseCount).toBe(50);
 for(const id of ['l114-double-inequality','l114-natural-solutions','l114-neighbours','l114-coordinate-view','l114-star-digit','l114-boundary-digit','l114-check','l114-ready','l114-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==114');expect(source).toContain('mathnikita-lesson-114-progress-v1');expect(source).toContain('lessonOneHundredFourteenResponseCount');
});
