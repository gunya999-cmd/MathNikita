import { expect,test } from '@playwright/test';
import { answersEquivalent } from '../src/answerEquivalence';

test('numeric sequences ignore non-semantic separators but preserve values and order',()=>{
  const expected='3,6,9,12,15';
  expect(answersEquivalent('3, 6, 9, 12, 15',expected,'sequence')).toBe(true);
  expect(answersEquivalent('3 6 9 12 15',expected,'sequence')).toBe(true);
  expect(answersEquivalent('3; 6; 9; 12; 15',expected,'sequence')).toBe(true);
  expect(answersEquivalent('3 / 6 / 9 / 12 / 15',expected,'sequence')).toBe(true);
  expect(answersEquivalent('3 9 6 12 15',expected,'sequence')).toBe(false);
  expect(answersEquivalent('3 6 9 12',expected,'sequence')).toBe(false);
  expect(answersEquivalent('3691215',expected,'sequence')).toBe(false);
});

test('two-value numeric sequences stay distinct from decimals',()=>{
  expect(answersEquivalent('0 14','0,14','sequence')).toBe(true);
  expect(answersEquivalent('0;14','0,14','sequence')).toBe(true);
  expect(answersEquivalent('0.14','0,14','sequence')).toBe(false);
});

test('letter sequences accept spacing, case and common keyboard layouts',()=>{
  const expected='a,b,c,d';
  expect(answersEquivalent('A B C D',expected)).toBe(true);
  expect(answersEquivalent('a;b;c;d',expected)).toBe(true);
  expect(answersEquivalent('abcd',expected)).toBe(true);
  expect(answersEquivalent('ф и с в',expected)).toBe(true);
  expect(answersEquivalent('ש נ ב ג',expected)).toBe(true);
  expect(answersEquivalent('a c b d',expected)).toBe(false);
  expect(answersEquivalent('a b c',expected)).toBe(false);
});

test('scalar measurements keep decimal meaning while tolerating harmless formatting',()=>{
  expect(answersEquivalent('8.5 см','8,5 см')).toBe(true);
  expect(answersEquivalent('8,5см','8,5 см')).toBe(true);
  expect(answersEquivalent('8.5 cm','8,5 см')).toBe(true);
  expect(answersEquivalent('8.5 cv','8,5 см')).toBe(true);
  expect(answersEquivalent('85 см','8,5 см')).toBe(false);
  expect(answersEquivalent('5mm','5 мм')).toBe(true);
});
