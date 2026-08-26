import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {expect,test} from '@playwright/test';

test('lesson 70 reverse remainder problems enumerate every valid divisor',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/RemainderDivisionSynthesisPlayer.tsx'),'utf8');
  expect(source).toContain("answer:['37,185','185,37']");
  expect(source).toContain("answer:['8,13,26,52,104','104,52,26,13,8']");
  expect(source).toContain("id:'l70-540-answer'");
  expect(source).toContain("answer:'53'");
  expect(source).toContain("id:'l70-543-proof'");
  expect(source).toContain("a=10b+r");
  expect(source).toContain("0≤r<10");
});
