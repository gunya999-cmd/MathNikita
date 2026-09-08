import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredSeventeenPractice,lessonOneHundredSeventeenResponseCount} from '../src/data/lessonOneHundredSeventeenPractice';
const source=readFileSync(new URL('../src/RoundingAdvancedPlayer.tsx',import.meta.url),'utf8');

test('lesson 117 player teaches large-place rounding, carries and estimation',()=>{
 expect(lessonOneHundredSeventeenPractice).toHaveLength(20);expect(lessonOneHundredSeventeenResponseCount).toBe(50);
 for(const id of ['l117-units-decimals','l117-thousandths','l117-millions','l117-highest-place','l117-carry-chain','l117-precision-control','l117-exact-vs-estimate','l117-ready','l117-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==117');expect(source).toContain('mathnikita-lesson-117-progress-v1');expect(source).toContain('lessonOneHundredSeventeenResponseCount');
});
