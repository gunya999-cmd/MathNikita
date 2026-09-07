import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredTwelvePractice,lessonOneHundredTwelveResponseCount} from '../src/data/lessonOneHundredTwelvePractice';
const source=readFileSync(new URL('../src/DecimalRaySynthesisPlayer.tsx',import.meta.url),'utf8');

test('lesson 112 player covers final §30 synthesis',()=>{
 expect(lessonOneHundredTwelvePractice).toHaveLength(20);expect(lessonOneHundredTwelveResponseCount).toBe(50);
 for(const id of ['l112-power-division','l112-leading-zero','l112-ray-unit','l112-ray-beyond-one','l112-ray-reverse','l112-masked-digits','l112-synthesis','l112-ready','l112-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==112');expect(source).toContain('mathnikita-lesson-112-progress-v1');expect(source).toContain('lessonOneHundredTwelveResponseCount');
});
