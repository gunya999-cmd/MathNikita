import { getGradeCurriculum } from './curriculum';

export type DiagnosticQuestion = {
  id: string;
  prompt: string;
  answer: string;
  skillTitle: string;
};

export function getDiagnosticQuestionsForGrade(grade?: string): DiagnosticQuestion[] {
  return getGradeCurriculum(grade).lessons.map((lesson, index) => ({
    id: `g${getGradeCurriculum(grade).id}-q${index + 1}`,
    prompt: lesson.practice,
    answer: lesson.answer,
    skillTitle: lesson.topic,
  }));
}

export const diagnosticQuestions: DiagnosticQuestion[] = getDiagnosticQuestionsForGrade('7');

export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(',', '.').replace(/\s+/g, '');
}
