export type ExtendedPracticeField = {
  id: string;
  label: string;
  answers: string[];
  placeholder?: string;
  validation?: 'loose' | 'decimal';
};

export type ExtendedPracticeProvenance = 'curated' | 'parametric';
type ExtendedPracticeTaskMeta = { provenance?: ExtendedPracticeProvenance };

export type ExtendedPracticeTask = ExtendedPracticeTaskMeta & (
  | {
      id: string;
      type: 'input';
      prompt: string;
      instruction?: string;
      answers: string[];
      hint: string;
      explanation: string;
    }
  | {
      id: string;
      type: 'choice';
      prompt: string;
      instruction?: string;
      options: string[];
      answer: string;
      hint: string;
      explanation: string;
    }
  | {
      id: string;
      type: 'multi-input';
      prompt: string;
      instruction?: string;
      fields: ExtendedPracticeField[];
      hint: string;
      explanation: string;
    }
);

export type ExtendedPracticeSet = {
  title: string;
  subtitle: string;
  /** Planning metadata only. The UI must not present this value as measured duration. */
  estimatedMinutes: number;
  tasks: ExtendedPracticeTask[];
};

export const inputTask = (
  id: string,
  prompt: string,
  answers: string[],
  hint: string,
  explanation: string,
  instruction = 'Запиши решение на бумаге, затем введи только ответ.',
): ExtendedPracticeTask => ({ id, type:'input', prompt, instruction, answers, hint, explanation });

export const choiceTask = (
  id: string,
  prompt: string,
  options: string[],
  answer: string,
  hint: string,
  explanation: string,
  instruction = 'Выбери один ответ и объясни себе, почему остальные не подходят.',
): ExtendedPracticeTask => ({ id, type:'choice', prompt, instruction, options, answer, hint, explanation });

export const multiInputTask = (
  id: string,
  prompt: string,
  fields: ExtendedPracticeField[],
  hint: string,
  explanation: string,
  instruction = 'Реши задачу полностью на бумаге и заполни все поля. Проверка засчитывается только целиком.',
): ExtendedPracticeTask => ({ id, type:'multi-input', prompt, instruction, fields, hint, explanation });

export function extendedPracticeTaskResponseCount(task:ExtendedPracticeTask){
  return task.type==='multi-input'?task.fields.length:1;
}

export function extendedPracticeSetResponseCount(practice:ExtendedPracticeSet){
  return practice.tasks.reduce((total,task)=>total+extendedPracticeTaskResponseCount(task),0);
}
