import { expect, test, type Page } from '@playwright/test';
import { prepareRussianSpeechText } from '../src/voiceQuality';

type NarrationPayload = { id?: string; text?: string; version?: string };

const READY_LESSONS = 90;
const TOTAL_LESSONS = 175;

function speechViolations(text: string) {
  const violations: string[] = [];
  if (!text.trim()) violations.push('empty narration');
  if (text.length > 3500) violations.push(`too long: ${text.length} chars`);
  if (/[§№=+×*·÷<>≤≥→↔²³^%°−∠αβγδ]/i.test(text)) violations.push('raw mathematical notation remains');
  if (/\d+(?:[.,]\d+)?\s*(?:км|дм|см|мм|мл|га|мин|м|л|ч|с)(?=\s|[.,;:!?/)]|$)/i.test(text)) violations.push('compact measurement unit remains');
  if (/\d+\s*\/\s*\d+/.test(text)) violations.push('raw numeric fraction remains');
  if (/[A-Za-z]/.test(text)) violations.push('raw Latin letters remain');
  if (/умножить на\s*[.;]/i.test(text)) violations.push('broken multiplication ellipsis remains');
  if (/\uFFFD/.test(text)) violations.push('replacement character remains');
  if (/\s{2,}/.test(text)) violations.push('repeated spaces remain');
  const longestSentence = Math.max(0, ...text.split(/[.!?]+/).map(sentence => sentence.trim().length));
  if (longestSentence > 700) violations.push(`sentence too long for natural prosody: ${longestSentence} chars`);
  return violations;
}

async function openLessonFromCatalog(page: Page, lessonNumber: number) {
  const button = page.locator(`button[aria-label^="Открыть урок ${lessonNumber}:"]`);
  await expect(button).toHaveCount(1);
  await button.evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText(`Урок ${lessonNumber} из ${TOTAL_LESSONS}`);
}

test('pronunciation normalization reads Russian math notation naturally', () => {
  expect(prepareRussianSpeechText('Площадь 21 м², объём 24 см³.')).toBe(
    'Площадь 21 квадратный метр, объём 24 кубических сантиметра.',
  );
  expect(prepareRussianSpeechText('a² + b² = c²')).toBe(
    'А в квадрате плюс Бэ в квадрате равно Цэ в квадрате',
  );
  expect(prepareRussianSpeechText('AB > CD, 9 – 4 = 5, 1–3')).toBe(
    'А Бэ больше Цэ Дэ, 9 минус 4 равно 5, 1 до 3',
  );
  expect(prepareRussianSpeechText('§ 24, № 651, 25%, 90°')).toBe(
    'параграф 24, номер 651, 25 процентов, 90 градусов',
  );
  expect(prepareRussianSpeechText('§§ 16–24 уже пройдены')).toBe(
    'параграфы 16 до 24 уже пройдены',
  );
  expect(prepareRussianSpeechText('a·b = b·a, a·1 = a, a·0 = 0')).toBe(
    'А умножить на Бэ равно Бэ умножить на А, А умножить на 1 равно А, А умножить на 0 равно 0',
  );
  expect(prepareRussianSpeechText('a¹ = a, aⁿ, 2⁴, x^5')).toBe(
    'А в первой степени равно А, А в степени Эн, 2 в степени 4, Икс в степени 5',
  );
  expect(prepareRussianSpeechText('1/2, −3')).toBe('1 разделить на 2, минус 3');
  expect(prepareRussianSpeechText('4м80см, 2км350м')).toBe(
    '4 метра 80 сантиметров, 2 километра 350 метров',
  );
  expect(prepareRussianSpeechText('ABCDE, DE')).toBe('А Бэ Цэ Дэ Е, Дэ Е');
  expect(prepareRussianSpeechText('A − B, x°, ∠ABC, α + β, ÷3')).toBe(
    'А минус Бэ, Икс градусов, угол А Бэ Цэ, альфа плюс бета, разделить на 3',
  );
  expect(prepareRussianSpeechText('28 км/ч, 5 ч, 1·2·...·100')).toBe(
    '28 километров в час, 5 часов, 1 умножить на 2 умножить последовательно вплоть до 100',
  );
  expect(prepareRussianSpeechText('challenge; source-checkpoint')).toBe(
    'задача повышенной сложности; контрольную точку источника',
  );
});

test('pronunciation dictionary pins risky course terms to normative stress', () => {
  const prepared = prepareRussianSpeechText(
    'Равнобедренный треугольник, транспортир, координатный луч, параллелепипед, комбинаторика, диагональ, пирамида.',
  );
  expect(prepared).toContain('Равнобе́дренный');
  expect(prepared).toContain('транспорти́р');
  expect(prepared).toContain('координа́тный');
  expect(prepared).toContain('параллелепи́пед');
  expect(prepared).toContain('комбинато́рика');
  expect(prepared).toContain('диагона́ль');
  expect(prepared).toContain('пирами́да');
});

test('Audio Content Audit 1-90: every opening sends clean prepared Russian text to Sulafat', async ({ page }) => {
  test.setTimeout(180_000);
  const narrationById = new Map<string, string>();

  await page.addInitScript(() => {
    localStorage.setItem('mathnikita-voice-settings-v4', JSON.stringify({ engine: 'studio', rate: 0.94 }));
    localStorage.setItem('mathnikita-mentor-auto-guide', 'false');
  });

  await page.route('**/api/narration-status', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, studioConfigured: true, provider: 'gemini', voice: 'Sulafat' }),
  }));

  await page.route('**/api/narration', async route => {
    const payload = (route.request().postDataJSON() ?? {}) as NarrationPayload;
    if (payload.id && payload.text) narrationById.set(payload.id, payload.text);
    await route.fulfill({ status: 200, contentType: 'audio/wav', body: 'RIFF-audio-content-audit' });
  });

  await page.goto('/');
  await expect(page.locator('button[aria-label^="Открыть урок "]')).toHaveCount(READY_LESSONS);

  for (let lessonNumber = 1; lessonNumber <= READY_LESSONS; lessonNumber += 1) {
    await openLessonFromCatalog(page, lessonNumber);
    const narrationId = `lesson-${String(lessonNumber).padStart(2, '0')}-opening`;

    if (!narrationById.has(narrationId)) {
      const voiceButton = page.locator('.voice-narrator > button').first();
      await expect(voiceButton).toBeEnabled();
      await voiceButton.click();
    }

    await expect.poll(() => narrationById.has(narrationId), {
      timeout: 12_000,
      message: `lesson ${lessonNumber}: opening narration was not sent to Sulafat`,
    }).toBeTruthy();

    const prepared = narrationById.get(narrationId) ?? '';
    expect(
      speechViolations(prepared),
      `lesson ${lessonNumber}: invalid prepared narration:\n${prepared}`,
    ).toEqual([]);

    await page.locator('.lesson-mode-toolbar > button').first().click();
    await expect(page.locator('.course-catalog-page')).toBeVisible();
  }

  expect(narrationById.size).toBeGreaterThanOrEqual(READY_LESSONS);
});