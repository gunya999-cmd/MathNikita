import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredThirteenPractice,lessonOneHundredThirteenResponseCount} from '../src/data/lessonOneHundredThirteenPractice';
const source=readFileSync(new URL('../src/DecimalComparisonFoundationsPlayer.tsx',import.meta.url),'utf8');

test('lesson 113 player covers comparison foundations',()=>{
 expect(lessonOneHundredThirteenPractice).toHaveLength(20);expect(lessonOneHundredThirteenResponseCount).toBe(50);
 for(const id of ['l113-trailing-zero','l113-equalize','l113-whole-part','l113-digit-by-digit','l113-different-length','l113-ordering','l113-units','l113-ready','l113-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==113');expect(source).toContain('mathnikita-lesson-113-progress-v1');expect(source).toContain('lessonOneHundredThirteenResponseCount');
});
