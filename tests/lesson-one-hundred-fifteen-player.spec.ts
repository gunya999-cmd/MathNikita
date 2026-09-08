import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredFifteenPractice,lessonOneHundredFifteenResponseCount} from '../src/data/lessonOneHundredFifteenPractice';
const source=readFileSync(new URL('../src/DecimalComparisonSynthesisPlayer.tsx',import.meta.url),'utf8');

test('lesson 115 player closes §31 with density, precision and ordering',()=>{
 expect(lessonOneHundredFifteenPractice).toHaveLength(20);expect(lessonOneHundredFifteenResponseCount).toBe(50);
 for(const id of ['l115-fixed-step','l115-minimal-greater','l115-density','l115-build-between','l115-ordering','l115-permutations','l115-optimization','l115-ready','l115-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==115');expect(source).toContain('mathnikita-lesson-115-progress-v1');expect(source).toContain('lessonOneHundredFifteenResponseCount');expect(source).toContain('minExclusive');expect(source).toContain('distinctComplete');
});
