import type { EliteLessonContent } from './eliteLessonContent';
import type { LessonStage } from './lessonMastery';
import type { LessonRoadmapItem } from './lessonRoadmap';

export type TeacherMood = 'greeting' | 'explaining' | 'question' | 'success' | 'review';

export type BoardBlock =
  | { type: 'title'; text: string }
  | { type: 'idea'; text: string }
  | { type: 'model'; text: string }
  | { type: 'steps'; title: string; items: string[] }
  | { type: 'example'; problem: string; steps: string[]; answer: string }
  | { type: 'question'; text: string }
  | { type: 'summary'; text: string };

export type LessonBoardScene = {
  mood: TeacherMood;
  teacherLine: string;
  boardTitle: string;
  blocks: BoardBlock[];
};

function stageTitle(stage: LessonStage) {
  const titles: Record<LessonStage, string> = {
    learn: 'Объяснение на доске',
    practice: 'Закрепление на доске',
    test: 'Контрольная на доске',
    review: 'Разбор ошибки на доске',
    mastered: 'Итог урока',
  };
  return titles[stage];
}

function moodForStage(stage: LessonStage): TeacherMood {
  if (stage === 'learn') return 'explaining';
  if (stage === 'practice') return 'question';
  if (stage === 'test') return 'question';
  if (stage === 'review') return 'review';
  if (stage === 'mastered') return 'success';
  return 'greeting';
}

export function getLessonBoardScene(stage: LessonStage, lesson: LessonRoadmapItem, content: EliteLessonContent): LessonBoardScene {
  const title = `Урок ${lesson.order}: ${lesson.title}`;

  if (stage === 'learn') {
    return {
      mood: 'explaining',
      teacherLine: 'Смотри на доску: сначала поймём идею, потом разберём пример по шагам.',
      boardTitle: stageTitle(stage),
      blocks: [
        { type: 'title', text: title },
        { type: 'idea', text: content.bigIdea },
        { type: 'model', text: content.teaching.mentalModel },
        { type: 'example', problem: content.teaching.workedExample.problem, steps: content.teaching.workedExample.steps, answer: content.teaching.workedExample.answer },
        { type: 'summary', text: content.teaching.workedExample.whyItWorks },
      ],
    };
  }

  if (stage === 'practice') {
    return {
      mood: 'question',
      teacherLine: 'Теперь твоя очередь. Доска оставляет план, а решение ты объясняешь сам.',
      boardTitle: stageTitle(stage),
      blocks: [
        { type: 'title', text: title },
        { type: 'steps', title: 'План решения', items: ['Построй модель или рисунок', 'Запиши математически', 'Реши по шагам', 'Проверь ответ'] },
        { type: 'question', text: content.practice.proofOrExplain },
        { type: 'summary', text: content.practice.base },
      ],
    };
  }

  if (stage === 'test') {
    return {
      mood: 'question',
      teacherLine: 'Контрольная: работаем без подсказки. Докажи, что идея стала твоей.',
      boardTitle: stageTitle(stage),
      blocks: [
        { type: 'title', text: title },
        { type: 'question', text: content.control.quickCheck },
        { type: 'question', text: content.control.transferProblem },
        { type: 'steps', title: 'Критерии успеха', items: content.control.masteryCriteria },
      ],
    };
  }

  if (stage === 'review') {
    return {
      mood: 'review',
      teacherLine: 'Ошибка — это подсказка. Найдём место, где мысль свернула не туда, и исправим.',
      boardTitle: stageTitle(stage),
      blocks: [
        { type: 'title', text: title },
        { type: 'idea', text: 'Сначала возвращаемся к модели, затем проверяем один шаг.' },
        { type: 'steps', title: 'Как исправляем', items: content.aiRemediation },
        { type: 'steps', title: 'Типичные ошибки', items: content.commonMistakes },
      ],
    };
  }

  return {
    mood: 'success',
    teacherLine: 'Отлично. Урок закрыт: ты понял идею, решил пример и прошёл контроль.',
    boardTitle: stageTitle(stage),
    blocks: [
      { type: 'title', text: title },
      { type: 'summary', text: content.teaching.studentTakeaway },
      { type: 'steps', title: 'Что получилось', items: content.control.masteryCriteria },
    ],
  };
}
