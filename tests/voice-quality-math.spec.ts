import { expect,test } from '@playwright/test';
import { prepareRussianSpeechText } from '../src/voiceQuality';

test('lesson 5 arithmetic notation is converted into understandable Russian speech',()=>{
  const multiplication=prepareRussianSpeechText('49 + 26 · (54 − 27)');
  expect(multiplication).toContain('49 плюс 26 умножить на');
  expect(multiplication).toContain('54 минус 27');
  expect(multiplication).not.toContain('·');
  expect(multiplication).not.toContain('−');

  const division=prepareRussianSpeechText('(488 + 808) : 18');
  expect(division).toContain('488 плюс 808');
  expect(division).toContain('разделить на 18');
  expect(division).not.toContain(' : ');

  const prose=prepareRussianSpeechText('Классы: 12 миллионов, 004 тысячи.');
  expect(prose).toContain('Классы:');
  expect(prose).not.toContain('Классы разделить на');
});
