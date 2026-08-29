export * from './curriculumBase';

import {
  GRADE_OPTIONS,
  getCurriculumPlanByGrade,
  getLessonForGrade,
  parseGradeLevel,
  type GradeLevel,
} from './curriculumBase';
import type { Lesson } from './lessons';

export type GradeId = GradeLevel;
export type CurriculumLesson = Lesson & { topic: string };

function topicFromLesson(lesson: Lesson, fallback: string) {
  const [firstPart] = lesson.title.split(':');
  const topic = firstPart.trim();
  return topic || fallback;
}

export function normalizeGradeId(grade?: string): GradeLevel {
  return parseGradeLevel(grade);
}

export function getAllGradeOptions() {
  return GRADE_OPTIONS.map((option) => ({ id: String(option.value), label: option.label }));
}

export function getGradeCurriculum(grade?: string | GradeLevel) {
  const plan = getCurriculumPlanByGrade(grade);
  const lesson = getLessonForGrade(plan.grade);
  const primaryLesson: CurriculumLesson = {
    ...lesson,
    topic: topicFromLesson(lesson, plan.units[0]?.title ?? plan.label),
  };

  return {
    id: String(plan.grade),
    label: plan.label,
    stage: plan.stage,
    focus: plan.outcome,
    outcomes: [plan.outcome],
    units: plan.units.map((unit) => unit.title),
    lessons: [primaryLesson],
    sourceBlend: plan.sourceBlend,
    capstone: plan.capstone,
  };
}

export function getLessonForGradeTopic(grade: string | GradeLevel | undefined, topic?: string): CurriculumLesson {
  const curriculum = getGradeCurriculum(grade);
  if (!topic) return curriculum.lessons[0];

  const normalizedTopic = topic.toLowerCase();
  return curriculum.lessons.find(
    (lesson) => lesson.topic.toLowerCase() === normalizedTopic || lesson.title.toLowerCase() === normalizedTopic,
  ) ?? curriculum.lessons[0];
}
