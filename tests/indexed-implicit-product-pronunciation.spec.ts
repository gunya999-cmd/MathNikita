import { expect, test } from '@playwright/test';
import { prepareRussianSpeechText } from '../src/voiceQuality';

test('indexed implicit products are fully verbalized without raw Latin letters', () => {
  const speech = prepareRussianSpeechText('(v₂−v₁)t = v₂t−v₁t');

  expect(speech).toBe(
    '(Вэ 2 минус Вэ 1)Тэ равно Вэ 2 умножить на Тэ минус Вэ 1 умножить на Тэ',
  );
  expect(speech).not.toMatch(/[A-Za-z]/);
});
