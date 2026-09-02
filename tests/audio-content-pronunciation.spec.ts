import { expect, test, type Page } from '@playwright/test';
import { extendedPracticeByLesson } from '../src/data/extendedPracticeData';
import mentorScriptsData from '../src/data/mentorScripts.json';
import lessonThreeScriptsData from '../src/data/lessonThreeMentorScripts.json';
import lessonFourScriptsData from '../src/data/lessonFourMentorScripts.json';
import lessonFiveScriptsData from '../src/data/lessonFiveMentorScripts.json';
import lessonSixScriptsData from '../src/data/lessonSixMentorScripts.json';
import lessonSevenScriptsData from '../src/data/lessonSevenMentorScripts.json';
import lessonEightScriptsData from '../src/data/lessonEightMentorScripts.json';
import lessonNineScriptsData from '../src/data/lessonNineMentorScripts.json';
import lessonTenScriptsData from '../src/data/lessonTenMentorScripts.json';
import lessonElevenScriptsData from '../src/data/lessonElevenMentorScripts.json';
import lessonTwelveScriptsData from '../src/data/lessonTwelveMentorScripts.json';
import lessonThirteenScriptsData from '../src/data/lessonThirteenMentorScripts.json';
import lessonFourteenScriptsData from '../src/data/lessonFourteenMentorScripts.json';
import lessonFifteenScriptsData from '../src/data/lessonFifteenMentorScripts.json';
import lessonSixteenScriptsData from '../src/data/lessonSixteenMentorScripts.json';
import { practiceNarrationId, practiceNarrationText } from '../src/practiceNarration';
import { prepareRussianSpeechText } from '../src/voiceQuality';

type NarrationPayload = { id?: string; text?: string; version?: string };
type MentorScript = Record<string, string>;

const READY_LESSONS = 90;
const TOTAL_LESSONS = 175;

function speechViolations(text: string) {
  const violations: string[] = [];
  if (!text.trim()) violations.push('empty narration');
  if (text.length > 3500) violations.push(`too long: ${text.length} chars`);
  if (/[§№=+×*·÷<>≤≥→↔²³^%°]/.test(text)) violations.push('raw mathematical notation remains');
  if (/\b\d+(?:[.,]\d+)?\s*(?:км|дм|см|мм|мл|га|м|л)\b/i.test(text)) violations.push('compact measurement unit remains');
  if (/\d+\s*\/\s*\d+/.test(text)) violations.push('raw numeric fraction remains');
  if (/[A-Za-z]/.test(text)) violations.push('raw Latin letters remain');
  if (/\uFFFD/.test(text)) violations.push('replacement character remains');
  if (/\s{2,}/.test(text)) violations.push('repeated spaces remain');
  const longestSentence = Math.max(0, ...text.split(/[.!?]+/).map(sentence => sentence.trim().length));
  if (longestSentence > 700) violations.push(`sentence too long for natural prosody: ${longestSentence} chars`);
  return violations;
}

function safeNarrationToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96);
}

async function openLessonFromCatalog(page: Page, lessonNumber: number) {
  const button = page.locator(`button[aria-label^="Открыть урок ${lessonNumber}:"]`);
  await expect(button).toHaveCount(1);
  await button.evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText(`Урок ${lessonNumber} из ${TOTAL_LESSONS}`);
}

async function stageProgress(page: Page) {
  const controlJumpCount = await page.locator('.lesson-runtime:not([hidden]) .control-page-jump button').count();
  const label = (await page.locator('.lesson-runtime:not([hidden]) .lesson-controls span').last().textContent())?.trim() ?? '';
  const match = label.match(/(\d+)\s*(?:из|\/)\s*(\d+)/i);
  if (match) return { current: Number(match[1]), total: Number(match[2]) };
  if (controlJumpCount > 0) {
    const activeIndex = await page.locator('.lesson-runtime:not([hidden]) .control-page-jump button').evaluateAll(nodes =>
      Math.max(0, nodes.findIndex(node => node.classList.contains('active'))),
    );
    return { current: activeIndex + 1, total: controlJumpCount };
  }
  return { current: 0, total: 0 };
}

async function jumpToStage(page: Page, lessonNumber: number, stageIndex: number, total: number) {
  await page.evaluate(({ lessonNumber: targetLesson, stageIndex: targetIndex }) => {
    window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage', {
      detail: { lessonNumber: targetLesson, stageIndex: targetIndex },
    }));
  }, { lessonNumber, stageIndex });

  await expect.poll(async () => (await stageProgress(page)).current, {
    timeout: 4_000,
    message: `lesson ${lessonNumber}: stage ${stageIndex + 1}/${total} did not become active`,
  }).toBe(stageIndex + 1);
}

function allMentorScripts() {
  return {
    ...mentorScriptsData,
    ...lessonThreeScriptsData,
    ...lessonFourScriptsData,
    ...lessonFiveScriptsData,
    ...lessonSixScriptsData,
    ...lessonSevenScriptsData,
    ...lessonEightScriptsData,
    ...lessonNineScriptsData,
    ...lessonTenScriptsData,
    ...lessonElevenScriptsData,
    ...lessonTwelveScriptsData,
    ...lessonThirteenScriptsData,
    ...lessonFourteenScriptsData,
    ...lessonFifteenScriptsData,
    ...lessonSixteenScriptsData,
  } as Record<string, MentorScript>;
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

test('Extended Practice Content/Pronunciation Audit 1-90: every voiceable task prepares clean Russian speech', () => {
  let auditedTasks = 0;
  const narrationIds = new Set<string>();

  for (let lessonNumber = 1; lessonNumber <= READY_LESSONS; lessonNumber += 1) {
    const set = extendedPracticeByLesson[lessonNumber];
    if (!set) continue;

    set.tasks.forEach((task, index) => {
      const narrationId = practiceNarrationId(lessonNumber, task);
      const prepared = prepareRussianSpeechText(practiceNarrationText(task, index, set.tasks.length));
      expect(narrationIds.has(narrationId), `duplicate practice narration id: ${narrationId}`).toBeFalsy();
      narrationIds.add(narrationId);
      expect(
        speechViolations(prepared),
        `lesson ${lessonNumber}, practice ${index + 1}/${set.tasks.length}, ${narrationId}: invalid prepared narration:\n${prepared}`,
      ).toEqual([]);
      auditedTasks += 1;
    });
  }

  expect(auditedTasks).toBeGreaterThan(1_000);
  expect(narrationIds.size).toBe(auditedTasks);
});

test('Mentor Content/Pronunciation Audit: every Pythagoras voice script prepares clean Russian speech', () => {
  let auditedMessages = 0;
  for (const [scriptKey, script] of Object.entries(allMentorScripts())) {
    for (const [responseKey, rawText] of Object.entries(script)) {
      const prepared = prepareRussianSpeechText(rawText);
      expect(
        speechViolations(prepared),
        `mentor ${scriptKey}/${responseKey}: invalid prepared narration:\n${prepared}`,
      ).toEqual([]);
      auditedMessages += 1;
    }
  }
  expect(auditedMessages).toBeGreaterThan(50);
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

test('In-lesson Stage Content/Pronunciation Audit 1-90: every interactive stage sends clean prepared Russian text to Sulafat', async ({ page }) => {
  test.setTimeout(420_000);
  const narrationById = new Map<string, string>();
  let auditedStages = 0;

  await page.addInitScript(() => {
    class MockAudio {
      src = '';
      preload = '';
      playbackRate = 1;
      currentTime = 0;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(source = '') { this.src = source; }
      pause() {}
      play() { return Promise.resolve(); }
    }
    Object.defineProperty(window, 'Audio', { configurable: true, writable: true, value: MockAudio });
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
    await route.fulfill({ status: 200, contentType: 'audio/wav', body: 'RIFF-all-stage-content-audit' });
  });

  await page.goto('/');

  for (let lessonNumber = 1; lessonNumber <= READY_LESSONS; lessonNumber += 1) {
    await openLessonFromCatalog(page, lessonNumber);
    await page.locator('.lesson-opening-start').click();
    const stage = page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]').first();
    await expect(stage, `lesson ${lessonNumber}: interactive narration stage is missing`).toBeVisible();

    const initialProgress = await stageProgress(page);
    expect(initialProgress.total, `lesson ${lessonNumber}: stage count is not exposed`).toBeGreaterThan(0);

    for (let stageIndex = 0; stageIndex < initialProgress.total; stageIndex += 1) {
      await jumpToStage(page, lessonNumber, stageIndex, initialProgress.total);
      const stageId = (await stage.getAttribute('data-stage-id'))?.trim() ?? '';
      expect(stageId, `lesson ${lessonNumber}, stage ${stageIndex + 1}: data-stage-id is empty`).not.toBe('');
      const token = safeNarrationToken(stageId);
      expect(token, `lesson ${lessonNumber}, stage ${stageIndex + 1}: narration token is empty for ${stageId}`).not.toBe('');
      const narrationId = `lesson-${String(lessonNumber).padStart(2, '0')}-stage-${token}`;

      await expect.poll(() => narrationById.has(narrationId), {
        timeout: 4_000,
        message: `lesson ${lessonNumber}, stage ${stageIndex + 1}/${initialProgress.total}, ${stageId}: narration was not sent to Sulafat`,
      }).toBeTruthy();

      const prepared = narrationById.get(narrationId) ?? '';
      expect(
        speechViolations(prepared),
        `lesson ${lessonNumber}, stage ${stageIndex + 1}/${initialProgress.total}, ${stageId}: invalid prepared narration:\n${prepared}`,
      ).toEqual([]);
      auditedStages += 1;
    }

    await page.locator('.lesson-mode-toolbar > button').first().click();
    await expect(page.locator('.course-catalog-page')).toBeVisible();
  }

  expect(auditedStages).toBeGreaterThan(1_000);
});