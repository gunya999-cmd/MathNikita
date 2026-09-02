import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { extendedPracticeByLesson } from '../src/data/extendedPracticeData';
import { practiceNarrationId, practiceNarrationText } from '../src/practiceNarration';
import { prepareRussianSpeechText } from '../src/voiceQuality';

type NarrationPayload = { id?: string; text?: string; version?: string };
type MentorScript = Record<string, string>;

const READY_LESSONS = 90;
const TOTAL_LESSONS = 175;
const MENTOR_SCRIPT_FILES = [
  'src/data/mentorScripts.json',
  'src/data/lessonThreeMentorScripts.json',
  'src/data/lessonFourMentorScripts.json',
  'src/data/lessonFiveMentorScripts.json',
  'src/data/lessonSixMentorScripts.json',
  'src/data/lessonSevenMentorScripts.json',
  'src/data/lessonEightMentorScripts.json',
  'src/data/lessonNineMentorScripts.json',
  'src/data/lessonTenMentorScripts.json',
  'src/data/lessonElevenMentorScripts.json',
  'src/data/lessonTwelveMentorScripts.json',
  'src/data/lessonThirteenMentorScripts.json',
  'src/data/lessonFourteenMentorScripts.json',
  'src/data/lessonFifteenMentorScripts.json',
  'src/data/lessonSixteenMentorScripts.json',
] as const;

function speechViolations(text: string) {
  const violations: string[] = [];
  if (!text.trim()) violations.push('empty narration');
  if (text.length > 3500) violations.push(`too long: ${text.length} chars`);
  if (/[§№=+×*·÷<>≤≥→↔²³^%°−∠αβγδ]/i.test(text)) violations.push('raw mathematical notation remains');
  if (/\d+(?:[.,]\d+)?\s*(?:км|дм|см|мм|мл|га|мин|м|л|ч|с)(?=\s|[.,;:!?/)]|$)/i.test(text)) violations.push('compact measurement unit remains');
  if (/\d+\s*\/\s*\d+/.test(text)) violations.push('raw numeric fraction remains');
  if (/[A-Za-z]/.test(text)) violations.push('raw Latin letters remain');
  if (/умножить на\s*[.;]\s*умножить на/i.test(text)) violations.push('broken multiplication ellipsis remains');
  if (/\uFFFD/.test(text)) violations.push('replacement character remains');
  if (/\s{2,}/.test(text)) violations.push('repeated spaces remain');
  const longestSentence = Math.max(0, ...text.split(/[.!?]+/).map(sentence => sentence.trim().length));
  if (longestSentence > 700) violations.push(`sentence too long for natural prosody: ${longestSentence} chars`);
  return violations;
}

function safeNarrationToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96);
}

function allMentorScripts() {
  return Object.assign(
    {},
    ...MENTOR_SCRIPT_FILES.map(file => JSON.parse(readFileSync(resolve(process.cwd(), file), 'utf8')) as Record<string, MentorScript>),
  ) as Record<string, MentorScript>;
}

async function openLessonFromCatalog(page: Page, lessonNumber: number) {
  const button = page.locator(`button[aria-label^="Открыть урок ${lessonNumber}:"]`);
  await expect(button).toHaveCount(1);
  await button.evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText(`Урок ${lessonNumber} из ${TOTAL_LESSONS}`);
}

async function stageProgress(page: Page) {
  const controlJumpCount = await page.locator('.lesson-runtime:not([hidden]) .control-page-jump button').count();
  const labels = await page.locator(
    '.lesson-runtime:not([hidden]) .stage-counter:not(.sr-only), .lesson-runtime:not([hidden]) .lesson-controls span',
  ).allTextContents();
  for (let index = labels.length - 1; index >= 0; index -= 1) {
    const match = labels[index].trim().match(/(\d+)\s*(?:из|\/)\s*(\d+)/i);
    if (match) return { current: Number(match[1]), total: Number(match[2]) };
  }
  if (controlJumpCount > 0) {
    const activeIndex = await page.locator('.lesson-runtime:not([hidden]) .control-page-jump button').evaluateAll(nodes =>
      Math.max(0, nodes.findIndex(node => node.classList.contains('active'))),
    );
    return { current: activeIndex + 1, total: controlJumpCount };
  }
  return { current: 0, total: 0 };
}

async function jumpToStage(page: Page, lessonNumber: number, stageIndex: number, total: number) {
  await page.evaluate(({ targetLesson, targetIndex }) => {
    window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage', {
      detail: { lessonNumber: targetLesson, stageIndex: targetIndex },
    }));
  }, { targetLesson: lessonNumber, targetIndex: stageIndex });

  await expect.poll(async () => (await stageProgress(page)).current, {
    timeout: 4_000,
    message: `lesson ${lessonNumber}: stage ${stageIndex + 1}/${total} did not become active`,
  }).toBe(stageIndex + 1);
}

test('Extended Practice Content/Pronunciation Audit 1-90: every voiceable task prepares clean Russian speech', () => {
  let auditedTasks = 0;
  const narrationIds = new Set<string>();
  const problems: string[] = [];

  for (let lessonNumber = 1; lessonNumber <= READY_LESSONS; lessonNumber += 1) {
    const set = extendedPracticeByLesson[lessonNumber];
    if (!set) continue;

    set.tasks.forEach((task, index) => {
      const narrationId = practiceNarrationId(lessonNumber, task);
      const prepared = prepareRussianSpeechText(practiceNarrationText(task, index, set.tasks.length));
      if (narrationIds.has(narrationId)) problems.push(`duplicate practice narration id: ${narrationId}`);
      narrationIds.add(narrationId);
      const violations = speechViolations(prepared);
      if (violations.length) {
        problems.push(
          `lesson ${lessonNumber}, practice ${index + 1}/${set.tasks.length}, ${narrationId}: ${violations.join('; ')}\n${prepared}`,
        );
      }
      auditedTasks += 1;
    });
  }

  expect(auditedTasks).toBeGreaterThan(1_000);
  expect(narrationIds.size).toBe(auditedTasks);
  expect(problems, `${problems.length} practice narration problem(s):\n\n${problems.join('\n\n')}`).toEqual([]);
});

test('Mentor Content/Pronunciation Audit: every Pythagoras voice script prepares clean Russian speech', () => {
  let auditedMessages = 0;
  const problems: string[] = [];
  for (const [scriptKey, script] of Object.entries(allMentorScripts())) {
    for (const [responseKey, rawText] of Object.entries(script)) {
      const prepared = prepareRussianSpeechText(rawText);
      const violations = speechViolations(prepared);
      if (violations.length) {
        problems.push(`mentor ${scriptKey}/${responseKey}: ${violations.join('; ')}\n${prepared}`);
      }
      auditedMessages += 1;
    }
  }
  expect(auditedMessages).toBeGreaterThan(50);
  expect(problems, `${problems.length} mentor narration problem(s):\n\n${problems.join('\n\n')}`).toEqual([]);
});

test('In-lesson Stage Content/Pronunciation Audit 1-90: every interactive stage sends clean prepared Russian text to Sulafat', async ({ page }) => {
  test.setTimeout(420_000);
  const narrationById = new Map<string, string>();
  const problems: string[] = [];
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
      const violations = speechViolations(prepared);
      if (violations.length) {
        problems.push(
          `lesson ${lessonNumber}, stage ${stageIndex + 1}/${initialProgress.total}, ${stageId}: ${violations.join('; ')}\n${prepared}`,
        );
      }
      auditedStages += 1;
    }

    await page.locator('.lesson-mode-toolbar > button').first().click();
    await expect(page.locator('.course-catalog-page')).toBeVisible();
  }

  expect(auditedStages).toBeGreaterThan(1_000);
  expect(problems, `${problems.length} stage narration problem(s):\n\n${problems.join('\n\n')}`).toEqual([]);
});