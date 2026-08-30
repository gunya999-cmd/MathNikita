import type { TeacherMood } from '../data/lessonBoard';
import type { AgeTone } from '../data/adaptiveLesson';

type TeacherAvatarProps = {
  name?: string;
  mood: TeacherMood;
  tone: AgeTone;
  line: string;
};

function moodLabel(mood: TeacherMood) {
  const labels: Record<TeacherMood, string> = {
    greeting: 'приветствует',
    explaining: 'объясняет',
    question: 'задаёт вопрос',
    success: 'хвалит',
    review: 'разбирает ошибку',
  };
  return labels[mood];
}

function faceFor(mood: TeacherMood) {
  const faces: Record<TeacherMood, string> = {
    greeting: '👋',
    explaining: '🧑‍🏫',
    question: '🤔',
    success: '🌟',
    review: '🔎',
  };
  return faces[mood];
}

function toneLabel(tone: AgeTone) {
  const labels: Record<AgeTone, string> = {
    playful: 'добрый игровой учитель',
    curious: 'учитель-рассказчик',
    independent: 'наставник-исследователь',
    strategic: 'математический коуч',
    advanced: 'семинарский преподаватель',
  };
  return labels[tone];
}

export function TeacherAvatar({ name = 'AI-учитель', mood, tone, line }: TeacherAvatarProps) {
  return (
    <aside className={`teacher-avatar mood-${mood} tone-${tone}`}>
      <div className="teacher-portrait" aria-hidden="true">
        <span>{faceFor(mood)}</span>
      </div>
      <div className="teacher-meta">
        <strong>{name}</strong>
        <span>{toneLabel(tone)} · {moodLabel(mood)}</span>
      </div>
      <div className="teacher-speech">{line}</div>
    </aside>
  );
}
