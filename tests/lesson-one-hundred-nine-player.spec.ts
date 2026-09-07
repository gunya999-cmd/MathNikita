import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredNinePractice,lessonOneHundredNineResponseCount} from '../src/data/lessonOneHundredNinePractice';
const source=readFileSync(new URL('../src/DecimalRepresentationPlayer.tsx',import.meta.url),'utf8');

test('lesson 109 player covers decimal representation foundations',()=>{
 expect(lessonOneHundredNinePractice).toHaveLength(20);expect(lessonOneHundredNineResponseCount).toBe(50);
 for(const id of ['l109-notation','l109-comma','l109-places','l109-zero','l109-to-decimal','l109-improper','l109-back','l109-ready','l109-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==109');expect(source).toContain('mathnikita-lesson-109-progress-v1');expect(source).toContain('lessonOneHundredNineResponseCount');
});
