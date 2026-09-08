import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredEighteenPractice,lessonOneHundredEighteenResponseCount} from '../src/data/lessonOneHundredEighteenPractice';
const source=readFileSync(new URL('../src/RoundingSynthesisPlayer.tsx',import.meta.url),'utf8');

test('lesson 118 player teaches reverse rounding, unit conversion and safe estimation',()=>{
 expect(lessonOneHundredEighteenPractice).toHaveLength(20);expect(lessonOneHundredEighteenResponseCount).toBe(50);
 for(const id of ['l118-discarded-digits','l118-reverse-rounding','l118-unit-conversion','l118-safe-estimation','l118-capacity-proof','l118-error-direction','l118-exact-vs-estimate','l118-ready','l118-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==118');expect(source).toContain('mathnikita-lesson-118-progress-v1');expect(source).toContain('lessonOneHundredEighteenResponseCount');
});
