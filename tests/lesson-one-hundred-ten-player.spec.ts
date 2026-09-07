import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredTenPractice,lessonOneHundredTenResponseCount} from '../src/data/lessonOneHundredTenPractice';
const source=readFileSync(new URL('../src/DecimalRepresentationPracticePlayer.tsx',import.meta.url),'utf8');

test('lesson 110 player covers decimal representation consolidation',()=>{
 expect(lessonOneHundredTenPractice).toHaveLength(20);expect(lessonOneHundredTenResponseCount).toBe(50);
 for(const id of ['l110-scale','l110-leading-zero','l110-mixed','l110-improper','l110-back','l110-read','l110-compose','l110-ready','l110-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==110');expect(source).toContain('mathnikita-lesson-110-progress-v1');expect(source).toContain('lessonOneHundredTenResponseCount');
});
