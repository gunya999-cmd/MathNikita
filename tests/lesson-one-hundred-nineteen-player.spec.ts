import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredNineteenPractice,lessonOneHundredNineteenResponseCount} from '../src/data/lessonOneHundredNineteenPractice';
const source=readFileSync(new URL('../src/DecimalAdditionFoundationsPlayer.tsx',import.meta.url),'utf8');

test('lesson 119 player teaches place-value decimal addition and exact §33 route',()=>{
 expect(lessonOneHundredNineteenPractice).toHaveLength(20);expect(lessonOneHundredNineteenResponseCount).toBe(50);
 for(const id of ['l119-place-value','l119-equalize','l119-comma-column','l119-add-natural','l119-carry','l119-trailing-zero','l119-word-problems','l119-ready','l119-summary'])expect(source).toContain(`id:'${id}'`);
 expect(source).toContain('d?.lessonNumber!==119');expect(source).toContain('mathnikita-lesson-119-progress-v1');expect(source).toContain('lessonOneHundredNineteenResponseCount');
});
