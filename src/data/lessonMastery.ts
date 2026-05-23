import { normalizeAnswer } from './questions';

export type LessonStage = 'learn' | 'practice' | 'test' | 'review' | 'mastered';
export type MistakeType = 'concept' | 'method' | 'calculation' | 'notation';

export type LessonMistake = {
  type: MistakeType;
  skill: string;
  answer: string;
  explanation: string;
  createdAt: string;
};

export type LessonMasteryState = {
  lessonId: string;
  stage: LessonStage;
  attempts: number;
  practiceCorrect: number;
  testCorrect: number;
  weakSkills: string[];
  mistakes: LessonMistake[];
  masteredAt?: string;
};

export const lessonMasteryStorageKey = 'mathnikita.lessonMastery';

export function makeLessonId(grade: number | string, lessonOrder: number) {
  const gradeNumber = String(grade).match(/\d+/)?.[0] ?? '7';
  return `grade-${gradeNumber}-lesson-${lessonOrder}`;
}

export function emptyLessonMastery(lessonId: string): LessonMasteryState {
  return {
    lessonId,
    stage: 'learn',
    attempts: 0,
    practiceCorrect: 0,
    testCorrect: 0,
    weakSkills: [],
    mistakes: [],
  };
}

export function loadAllLessonMastery(): Record<string, LessonMasteryState> {
  try {
    const raw = localStorage.getItem(lessonMasteryStorageKey);
    return raw ? JSON.parse(raw) as Record<string, LessonMasteryState> : {};
  } catch {
    return {};
  }
}

export function saveAllLessonMastery(state: Record<string, LessonMasteryState>) {
  localStorage.setItem(lessonMasteryStorageKey, JSON.stringify(state));
}

export function loadLessonMastery(lessonId: string): LessonMasteryState {
  return loadAllLessonMastery()[lessonId] ?? emptyLessonMastery(lessonId);
}

export function saveLessonMastery(nextState: LessonMasteryState) {
  const all = loadAllLessonMastery();
  all[nextState.lessonId] = nextState;
  saveAllLessonMastery(all);
}

export function isExpectedAnswer(answer: string, expected: string[]) {
  const normalized = normalizeAnswer(answer);
  return expected.some((item) => normalizeAnswer(item) === normalized || normalized.includes(normalizeAnswer(item)));
}

export function classifyMistake(answer: string, expected: string[], skill: string): LessonMistake {
  const normalized = normalizeAnswer(answer);
  const type: MistakeType = !normalized
    ? 'concept'
    : /\d/.test(normalized) && expected.every((item) => !normalizeAnswer(item).includes(normalized))
      ? 'calculation'
      : normalized.length < 4
        ? 'notation'
        : 'method';

  const explanationByType: Record<MistakeType, string> = {
    concept: `Похоже, пока не схвачена главная идея темы «${skill}». Вернись к объяснению и сформулируй смысл своими словами.`,
    method: `Идея близко, но способ решения выбран неточно. Сначала назови тему, затем шаг решения.`,
    calculation: `Похоже на вычислительную ошибку. Проверь действие по шагам и не спеши с финальным ответом.`,
    notation: `Ответ слишком короткий или записан не в той форме. Напиши полную тему или ключевой навык.`,
  };

  return {
    type,
    skill,
    answer,
    explanation: explanationByType[type],
    createdAt: new Date().toISOString(),
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function recordLessonAttempt(
  state: LessonMasteryState,
  options: { answer: string; expected: string[]; skill: string; phase: 'practice' | 'test' },
): { nextState: LessonMasteryState; correct: boolean; feedback: string } {
  const correct = isExpectedAnswer(options.answer, options.expected);
  const attempts = state.attempts + 1;

  if (correct) {
    const practiceCorrect = state.practiceCorrect + (options.phase === 'practice' ? 1 : 0);
    const testCorrect = state.testCorrect + (options.phase === 'test' ? 1 : 0);
    const shouldMaster = options.phase === 'test' && testCorrect >= 2 && state.mistakes.length <= 1;
    const stage: LessonStage = shouldMaster ? 'mastered' : options.phase === 'practice' ? 'test' : 'review';

    return {
      correct,
      feedback: shouldMaster
        ? 'Урок усвоен. Контрольная пройдена уверенно.'
        : options.phase === 'practice'
          ? 'Практика решена. Теперь нужна короткая контрольная.'
          : 'Ответ верный. Для полного усвоения закрепи ещё один контрольный вопрос.',
      nextState: {
        ...state,
        attempts,
        practiceCorrect,
        testCorrect,
        stage,
        masteredAt: shouldMaster ? new Date().toISOString() : state.masteredAt,
      },
    };
  }

  const mistake = classifyMistake(options.answer, options.expected, options.skill);
  return {
    correct,
    feedback: mistake.explanation,
    nextState: {
      ...state,
      attempts,
      stage: 'review',
      weakSkills: unique([...state.weakSkills, options.skill]),
      mistakes: [...state.mistakes, mistake].slice(-6),
    },
  };
}

export function nextLessonStageLabel(stage: LessonStage) {
  const labels: Record<LessonStage, string> = {
    learn: 'Обучение',
    practice: 'Закрепление',
    test: 'Контрольная',
    review: 'Разбор ошибок',
    mastered: 'Усвоено',
  };
  return labels[stage];
}
