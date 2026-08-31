import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';

test('lesson 90 keeps the exact Control work №5 variant 1 workload',()=>{
  const source=readFileSync(new URL('../src/ControlWorkFivePlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\s*\{id:'(l90-[^']+)'/gm)].map(match=>match[1]);
  const fieldIds=[...source.matchAll(/\{id:'(l90-(?:1q|1r|2|3v|3s|4|5|6|7|8))'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(11);expect(new Set(stageIds).size).toBe(11);
  expect(fieldIds).toHaveLength(10);expect(new Set(fieldIds).size).toBe(10);
  for(const marker of ['478 : 15','14 см','3 раза больше','куба с ребром 3 см','18 см','на 11 см больше','делитель равен 11','неполное частное — 7','остаток — 6','6 га','150 м','цифры 5, 6 и 0','не могут повторяться','116 см','12 см и 11 см'])expect(source).toContain(marker);
  for(const answer of ["answer:'31'","answer:'13'","answer:'588'","answer:'27'","answer:'54'","answer:'3240'","answer:'83'","answer:'1100'","answer:'506, 560, 605, 650'","answer:'6'"])expect(source).toContain(answer);
  expect(source).toContain("data-control-field-count={fields.length}");
  expect(source).toContain("submittedResponses");
  expect(source).toContain("correctionFieldIds");
});
