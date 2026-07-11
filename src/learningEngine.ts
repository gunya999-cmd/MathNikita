import { diagnosticTaskIds, reviewTaskBySkill, skillLabels, syllabus, taskBank, type CourseTask, type SkillId } from './data/course';

export type SkillState = {
  mastery: number;
  attempts: number;
  correct: number;
  firstTryCorrect: number;
  streak: number;
  hintUses: number;
  needsReview: boolean;
  lastSeenLesson: number;
};

export type Attempt = {
  taskId: string;
  skill: SkillId;
  correct: boolean;
  firstTry: boolean;
  usedHint: boolean;
  atLesson: number;
  createdAt: string;
};

export type LearnerState = {
  version: 3;
  diagnosticDone: boolean;
  currentLessonIndex: number;
  currentSessionTaskIds: string[];
  currentTaskIndex: number;
  xp: number;
  completedSessions: number;
  completedTaskIds: string[];
  skills: Record<SkillId, SkillState>;
  attempts: Attempt[];
  lastSessionSummary?: {
    correct: number;
    total: number;
    reviewsAdded: string[];
    accelerated: boolean;
  };
};

const skillIds: SkillId[] = ['arithmetic','expressions','wordProblems','fractions','geometry','logic','combinatorics'];

const defaultSkill = (): SkillState => ({
  mastery: 40,
  attempts: 0,
  correct: 0,
  firstTryCorrect: 0,
  streak: 0,
  hintUses: 0,
  needsReview: false,
  lastSeenLesson: 0,
});

export function createInitialState(): LearnerState {
  const skills = Object.fromEntries(skillIds.map(id => [id, defaultSkill()])) as Record<SkillId, SkillState>;
  return {
    version: 3,
    diagnosticDone: false,
    currentLessonIndex: 0,
    currentSessionTaskIds: diagnosticTaskIds,
    currentTaskIndex: 0,
    xp: 0,
    completedSessions: 0,
    completedTaskIds: [],
    skills,
    attempts: [],
  };
}

export function loadLearnerState(): LearnerState {
  try {
    const raw = localStorage.getItem('math-course-state-v3');
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as LearnerState;
    if (parsed.version !== 3) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveLearnerState(state: LearnerState) {
  localStorage.setItem('math-course-state-v3', JSON.stringify(state));
}

export function getCurrentTask(state: LearnerState): CourseTask {
  const id = state.currentSessionTaskIds[Math.min(state.currentTaskIndex, state.currentSessionTaskIds.length - 1)];
  const task = taskBank.get(id);
  if (!task) throw new Error(`Task not found: ${id}`);
  return task;
}

export function recordAttempt(
  state: LearnerState,
  task: CourseTask,
  options: { correct: boolean; firstTry: boolean; usedHint: boolean },
): LearnerState {
  const skill = state.skills[task.skill];
  const gain = options.correct ? (options.firstTry && !options.usedHint ? 9 : 4) : -7;
  const nextMastery = Math.max(5, Math.min(100, skill.mastery + gain));
  const attempts = skill.attempts + 1;
  const accuracy = (skill.correct + (options.correct ? 1 : 0)) / attempts;
  const needsReview = options.correct
    ? nextMastery < 55 || (attempts >= 3 && accuracy < 0.7)
    : true;

  const updatedSkill: SkillState = {
    ...skill,
    mastery: nextMastery,
    attempts,
    correct: skill.correct + (options.correct ? 1 : 0),
    firstTryCorrect: skill.firstTryCorrect + (options.correct && options.firstTry ? 1 : 0),
    streak: options.correct ? skill.streak + 1 : 0,
    hintUses: skill.hintUses + (options.usedHint ? 1 : 0),
    needsReview,
    lastSeenLesson: state.currentLessonIndex + 1,
  };

  return {
    ...state,
    xp: state.xp + (options.correct ? (options.firstTry ? 12 : 7) : 0),
    skills: { ...state.skills, [task.skill]: updatedSkill },
    attempts: [
      ...state.attempts.slice(-199),
      {
        taskId: task.id,
        skill: task.skill,
        correct: options.correct,
        firstTry: options.firstTry,
        usedHint: options.usedHint,
        atLesson: state.currentLessonIndex + 1,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function weakestReviewTasks(state: LearnerState, lessonSkills: SkillId[]) {
  const candidates = (Object.entries(state.skills) as [SkillId, SkillState][])
    .filter(([id, skill]) => skill.needsReview || lessonSkills.includes(id) && skill.mastery < 60)
    .sort((a, b) => a[1].mastery - b[1].mastery)
    .slice(0, 2);
  return candidates.map(([id]) => reviewTaskBySkill[id]);
}

export function buildLessonSession(state: LearnerState): { taskIds: string[]; accelerated: boolean; reviews: string[] } {
  const lesson = syllabus[state.currentLessonIndex % syllabus.length];
  const reviews = weakestReviewTasks(state, lesson.prerequisiteSkills);
  const lessonMastery = lesson.prerequisiteSkills.reduce((sum, id) => sum + state.skills[id].mastery, 0) / lesson.prerequisiteSkills.length;
  const strong = lesson.prerequisiteSkills.every(id => state.skills[id].mastery >= 82 && state.skills[id].streak >= 2);
  const accelerated = strong || lessonMastery >= 88;
  const core = accelerated ? [lesson.coreTaskIds[0], lesson.coreTaskIds.at(-1)!] : lesson.coreTaskIds;
  return {
    taskIds: [...reviews, ...core, lesson.olympiadTaskId, lesson.checkpointTaskId],
    accelerated,
    reviews,
  };
}

export function advanceAfterCorrect(state: LearnerState): LearnerState {
  const taskId = state.currentSessionTaskIds[state.currentTaskIndex];
  const completedTaskIds = [...state.completedTaskIds, taskId].slice(-500);
  if (state.currentTaskIndex < state.currentSessionTaskIds.length - 1) {
    return { ...state, currentTaskIndex: state.currentTaskIndex + 1, completedTaskIds };
  }

  if (!state.diagnosticDone) {
    const diagnosticDone = { ...state, diagnosticDone: true, currentLessonIndex: 0, completedTaskIds };
    const session = buildLessonSession(diagnosticDone);
    return {
      ...diagnosticDone,
      currentSessionTaskIds: session.taskIds,
      currentTaskIndex: 0,
      lastSessionSummary: {
        correct: diagnosticDone.attempts.filter(a => a.correct).length,
        total: diagnosticTaskIds.length,
        reviewsAdded: session.reviews.map(id => skillLabels[taskBank.get(id)!.skill]),
        accelerated: session.accelerated,
      },
    };
  }

  const sessionAttempts = state.attempts.filter(a => state.currentSessionTaskIds.includes(a.taskId));
  const nextBase: LearnerState = {
    ...state,
    currentLessonIndex: state.currentLessonIndex + 1,
    completedSessions: state.completedSessions + 1,
    completedTaskIds,
  };
  const session = buildLessonSession(nextBase);
  return {
    ...nextBase,
    currentSessionTaskIds: session.taskIds,
    currentTaskIndex: 0,
    lastSessionSummary: {
      correct: sessionAttempts.filter(a => a.correct).length,
      total: state.currentSessionTaskIds.length,
      reviewsAdded: session.reviews.map(id => skillLabels[taskBank.get(id)!.skill]),
      accelerated: session.accelerated,
    },
  };
}

export function currentLesson(state: LearnerState) {
  return syllabus[state.currentLessonIndex % syllabus.length];
}

export function averageMastery(state: LearnerState) {
  return Math.round(skillIds.reduce((sum, id) => sum + state.skills[id].mastery, 0) / skillIds.length);
}

export function weakSkills(state: LearnerState) {
  return (Object.entries(state.skills) as [SkillId, SkillState][])
    .filter(([, skill]) => skill.needsReview || skill.mastery < 60)
    .sort((a, b) => a[1].mastery - b[1].mastery);
}
