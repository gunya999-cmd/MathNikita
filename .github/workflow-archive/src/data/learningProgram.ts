import {
  getCurriculumPlanByGrade,
  parseGradeLevel,
  type CurriculumUnit,
  type GradeLevel,
} from './curriculumBase';
import { getLessonsForModule, type LessonRoadmapItem } from './lessonRoadmap';

export type ExerciseDifficulty = 'warmup' | 'core' | 'challenge';

export type LearningStep = {
  prompt: string;
  expected: string[];
  hint: string;
  success: string;
};

export type LearningExercise = {
  id: string;
  title: string;
  difficulty: ExerciseDifficulty;
  skill: string;
  problem: string;
  answer: string;
  lessonOrder: number;
  steps: LearningStep[];
};

export type LearningModule = {
  id: string;
  grade: GradeLevel;
  order: number;
  title: string;
  focus: string;
  skills: string[];
  outcome: string;
  lessons: LessonRoadmapItem[];
  exercises: LearningExercise[];
};

export type LearningProgram = {
  grade: GradeLevel;
  label: string;
  stage: string;
  sourceBlend: string;
  outcome: string;
  capstone: string;
  modules: LearningModule[];
  totalLessons: number;
  totalSkills: number;
  totalExercises: number;
};

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'module';
}

function compactExpected(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function difficultyForLesson(order: number): ExerciseDifficulty {
  if (order % 4 === 1) return 'warmup';
  if (order % 4 === 0) return 'challenge';
  return 'core';
}

function makeLessonExercise(unit: CurriculumUnit, lesson: LessonRoadmapItem): LearningExercise {
  const skill = lesson.skills[0] ?? unit.skills[0] ?? lesson.title;
  const difficulty = difficultyForLesson(lesson.order);
  const expected = compactExpected([lesson.title, skill, ...lesson.skills, ...unit.skills]);

  return {
    id: `grade-${lesson.grade}-m${lesson.moduleOrder}-lesson-${lesson.order}`,
    title: `Урок ${lesson.order}: ${lesson.title}`,
    difficulty,
    skill,
    lessonOrder: lesson.order,
    problem: `Тема урока: «${lesson.title}». Сначала назови главную идею темы, затем сформулируй короткий способ решения типовой задачи.`,
    answer: lesson.title,
    steps: [
      {
        prompt: 'Шаг 1: назови главную тему урока или ключевой навык.',
        expected,
        hint: `Посмотри на название урока: ${lesson.title}. Фокус модуля: ${unit.focus}.`,
        success: 'Верно. Ты определил тему урока.',
      },
      {
        prompt: 'Шаг 2: напиши, зачем эта тема нужна в задачах.',
        expected: compactExpected([skill, unit.focus, lesson.objective, ...unit.skills]),
        hint: lesson.objective,
        success: 'Хорошо. Ты связал тему с практическим навыком.',
      },
      {
        prompt: 'Финальный ответ: повтори название темы урока.',
        expected: [lesson.title],
        hint: `Тема урока: ${lesson.title}.`,
        success: `Урок ${lesson.order} зафиксирован: ${lesson.title}.`,
      },
    ],
  };
}

function makeModule(unit: CurriculumUnit, grade: GradeLevel, index: number, outcome: string): LearningModule {
  const order = index + 1;
  const lessons = getLessonsForModule(grade, order);
  const lessonSkills = lessons.flatMap((lesson) => lesson.skills);
  const skills = Array.from(new Set([...unit.skills, ...lessonSkills]));

  return {
    id: `grade-${grade}-${slug(unit.title)}`,
    grade,
    order,
    title: unit.title,
    focus: unit.focus,
    skills,
    outcome,
    lessons,
    exercises: lessons.map((lesson) => makeLessonExercise(unit, lesson)),
  };
}

export function getLearningProgram(grade?: string | GradeLevel): LearningProgram {
  const gradeLevel = typeof grade === 'number' ? grade : parseGradeLevel(grade);
  const plan = getCurriculumPlanByGrade(gradeLevel);
  const modules = plan.units.map((unit, index) => makeModule(unit, plan.grade, index, plan.outcome));

  return {
    grade: plan.grade,
    label: plan.label,
    stage: plan.stage,
    sourceBlend: plan.sourceBlend,
    outcome: plan.outcome,
    capstone: plan.capstone,
    modules,
    totalLessons: modules.reduce((sum, module) => sum + module.lessons.length, 0),
    totalSkills: modules.reduce((sum, module) => sum + module.skills.length, 0),
    totalExercises: modules.reduce((sum, module) => sum + module.exercises.length, 0),
  };
}

export function getProgramProgress(solvedTasks: number, program: LearningProgram) {
  const total = Math.max(program.totalExercises, 1);
  const completedExercises = Math.min(Math.max(solvedTasks, 0), total);
  const percent = Math.round((completedExercises / total) * 100);
  const completedModules = Math.min(Math.floor(completedExercises / 4), program.modules.length);

  return {
    completedExercises,
    totalExercises: total,
    completedModules,
    totalModules: program.modules.length,
    percent,
  };
}

export function getActiveLearningModule(program: LearningProgram, solvedTasks: number) {
  const moduleIndex = Math.min(Math.floor(Math.max(solvedTasks, 0) / 4), program.modules.length - 1);
  return program.modules[moduleIndex] ?? program.modules[0];
}
