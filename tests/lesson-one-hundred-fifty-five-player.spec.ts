import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 155 player keeps strict decimal semantics and 28-stage contract',()=>{
 const source=fs.readFileSync('src/ControlNineRehearsalPlayer.tsx','utf8');
 expect(source).toContain("const KEY='mathnikita-lesson-155-progress-v1'");
 expect(source).toContain('canonicalDecimal');
 expect(source).not.toContain('Math.abs');
 expect(source).not.toContain('toFixed');
 expect(source).toContain('lessonNumber!==155');
 expect(source).toContain('20 карточек · 50 ответов · готовность к контрольной №9');
 expect(source).toContain('lessonOneHundredFiftyFivePracticeResponseCount=lessonOneHundredFiftyFiveResponseCount');
 for(const id of ['l155-mode','l155-mean','l155-direct','l155-inverse','l155-remainder','l155-base','l155-check'])expect(source).toContain(`id:'${id}'`);
});
