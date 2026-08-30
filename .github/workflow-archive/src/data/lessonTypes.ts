export type LessonBlockKind =
  | 'motivation'
  | 'explanation'
  | 'guided'
  | 'practice'
  | 'mistakes'
  | 'checkpoint'
  | 'thinking'
  | 'olympiad'
  | 'summary';

export type LessonBlock = {
  kind: LessonBlockKind;
  title: string;
  text: string;
  items?: string[];
  answers?: string[];
};

export type RichLessonContent = {
  lessonNumber: number;
  title: string;
  goal: string;
  durationMinutes: number;
  blocks: LessonBlock[];
};
