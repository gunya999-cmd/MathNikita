export type ExtendedPracticeTask =
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
    };

export type ExtendedPracticeSet = {
  title: string;
  subtitle: string;
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
