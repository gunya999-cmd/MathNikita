import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredElevenPractice,lessonOneHundredElevenResponseCount} from '../src/data/lessonOneHundredElevenPractice';
const source=readFileSync(new URL('../src/DecimalMeasurementPlayer.tsx',import.meta.url),'utf8');

test('lesson 111 player covers decimal measurements and division',()=>{
 expect(lessonOneHundredElevenPractice).toHaveLength(20);expect(lessonOneHundredElevenResponseCount).toBe(50);
 for(const id of ['l111-unit-fraction','l111-centimeters','l111-mixed-measure','l111-division','l111-zeroes','l111-time','l111-estimate','l111-ready','l111-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==111');expect(source).toContain('mathnikita-lesson-111-progress-v1');expect(source).toContain('lessonOneHundredElevenResponseCount');
});
