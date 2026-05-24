import type { EliteLessonContent } from './eliteLessonContent';
import type { LessonMasteryState } from './lessonMastery';
import type { LessonRoadmapItem } from './lessonRoadmap';
import type { StudentProfile } from './profile';

export type AgeTone = 'playful' | 'curious' | 'independent' | 'strategic' | 'advanced';

export type AdaptiveLessonView = {
  tone: AgeTone;
  ageLabel: string;
  teacherVoice: string;
  hook: string;
  interestBridge: string;
  motivation: {
    title: string;
    message: string;
    points: number;
    badge: string;
    nextReward: string;
  };
  adaptedTeaching: {
    opening: string;
    explanation: string;
    exampleIntro: string;
    questionStyle: string;
    practiceInstruction: string;
    testInstruction: string;
  };
};

function gradeNumberFrom(profile: StudentProfile) {
  return Number(profile.grade.match(/\d+/)?.[0] ?? 7);
}

function toneForGrade(grade: number): AgeTone {
  if (grade <= 3) return 'playful';
  if (grade <= 5) return 'curious';
  if (grade <= 8) return 'independent';
  if (grade <= 10) return 'strategic';
  return 'advanced';
}

function firstInterest(profile: StudentProfile) {
  return profile.interests.split(',').map((item) => item.trim()).filter(Boolean)[0] || 'твоих интересов';
}

function ageLabel(tone: AgeTone) {
  const labels: Record<AgeTone, string> = {
    playful: 'детская подача: коротко, образно, через игру',
    curious: 'младшая школа: понятные шаги, истории и рисунки',
    independent: 'средняя школа: самостоятельность и объяснение метода',
    strategic: 'старшие классы: стратегия, смысл и перенос',
    advanced: 'продвинутый уровень: строгость, обобщение и доказательство',
  };
  return labels[tone];
}

function teacherVoice(tone: AgeTone) {
  const voices: Record<AgeTone, string> = {
    playful: 'Говорю простыми словами, как добрый тренер: один маленький шаг за раз.',
    curious: 'Объясняю через понятную историю, рисунок и вопрос “почему так?”.',
    independent: 'Даю ученику роль исследователя: сначала гипотеза, потом проверка.',
    strategic: 'Показываю, где эта идея экономит время и как использовать её в сложных задачах.',
    advanced: 'Веду как математический семинар: определение, пример, доказательный ход, обобщение.',
  };
  return voices[tone];
}

function hookFor(tone: AgeTone, lesson: LessonRoadmapItem, interest: string) {
  const hooks: Record<AgeTone, string> = {
    playful: `Представь, что тема «${lesson.title}» — это маленькая игра. Наша миссия: найти правило и получить звезду за объяснение.`,
    curious: `Сегодня мы разберём «${lesson.title}» как головоломку: сначала увидим картинку, потом найдём правило.`,
    independent: `Тема «${lesson.title}» станет инструментом: ты сам выбираешь способ, проверяешь его и объясняешь, почему он работает.`,
    strategic: `Тема «${lesson.title}» — это способ решать задачи быстрее и чище. Свяжем её с ${interest}, чтобы увидеть практический смысл.`,
    advanced: `Тема «${lesson.title}» — шаг к математическому мышлению высокого уровня: модель, доказательство, перенос, обобщение.`,
  };
  return hooks[tone];
}

function interestBridge(tone: AgeTone, lesson: LessonRoadmapItem, interest: string) {
  if (tone === 'playful') return `Связь с интересами: если тебе нравится ${interest}, будем считать очки, уровни и маленькие победы.`;
  if (tone === 'curious') return `Связь с интересами: используем ${interest} как сюжет для примеров, чтобы тема «${lesson.title}» была не абстрактной.`;
  if (tone === 'independent') return `Связь с интересами: попробуй придумать пример из области «${interest}», где нужен этот математический навык.`;
  if (tone === 'strategic') return `Связь с интересами: покажем, как идея урока может работать в ${interest}: сравнение вариантов, прогноз, оптимизация или оценка риска.`;
  return `Связь с интересами: рассматривай ${interest} как предмет моделирования — формализуй ситуацию, выбери переменные и проверь ограничения.`;
}

function motivationFor(profile: StudentProfile, mastery: LessonMasteryState, tone: AgeTone) {
  const basePoints = Math.max(profile.solvedTasks, 0) * 10;
  const lessonPoints = mastery.practiceCorrect * 15 + mastery.testCorrect * 25 - mastery.weakSkills.length * 5;
  const points = Math.max(0, basePoints + lessonPoints);
  const badge = mastery.stage === 'mastered'
    ? 'Мастер урока'
    : mastery.testCorrect > 0
      ? 'Контрольный боец'
      : mastery.practiceCorrect > 0
        ? 'Исследователь'
        : tone === 'playful'
          ? 'Стартовая звезда'
          : 'Стартовый уровень';

  const title = tone === 'playful' ? 'Мотивация: собираем звёзды' : 'Мотивация: прогресс навыка';
  const message = mastery.stage === 'mastered'
    ? 'Урок закрыт: ты понял идею, прошёл контрольную и можешь двигаться дальше.'
    : mastery.weakSkills.length > 0
      ? 'Ошибка — это не провал, а карта: она показывает, какой шаг нужно усилить.'
      : 'Твоя цель — не угадать ответ, а объяснить идею так, чтобы самому стало понятно.';

  return {
    title,
    message,
    points,
    badge,
    nextReward: mastery.testCorrect < 2 ? 'Следующая награда: пройти 2 контрольных ответа подряд.' : 'Следующая награда: новый урок без подсказок.',
  };
}

function adaptedTeaching(tone: AgeTone, content: EliteLessonContent, lesson: LessonRoadmapItem, interest: string) {
  if (tone === 'playful') {
    return {
      opening: `Давай сыграем в “найди правило”. ${content.teaching.teacherOpening}`,
      explanation: `Очень просто: ${content.teaching.conceptExplanation} Представь это как предметы, кубики или очки в игре.`,
      exampleIntro: 'Сейчас решим пример маленькими шагами. Не спешим: один шаг — одна победа.',
      questionStyle: 'Отвечай коротко. Можно словами, рисунком или примером.',
      practiceInstruction: `Закрепление: реши похожую мини-задачу и объясни, как будто учишь друга из игры про ${interest}.`,
      testInstruction: 'Контрольная: без подсказки назови правило и реши маленький пример.',
    };
  }

  if (tone === 'curious') {
    return {
      opening: `Начнём с понятной истории. ${content.teaching.teacherOpening}`,
      explanation: `${content.teaching.conceptExplanation} Сначала ищем картинку или модель, потом превращаем её в запись.`,
      exampleIntro: 'Пример разберём как расследование: что известно, что ищем, какой шаг самый удобный?',
      questionStyle: 'Отвечай полным предложением: “я думаю так, потому что…”.',
      practiceInstruction: `Закрепление: реши похожую задачу и придумай свой пример про ${interest}.`,
      testInstruction: 'Контрольная: объясни идею, реши пример и проверь ответ.',
    };
  }

  if (tone === 'independent') {
    return {
      opening: `Работаем как исследователи. ${content.teaching.teacherOpening}`,
      explanation: `${content.teaching.conceptExplanation} Важно не повторить формулу, а выбрать стратегию и проверить её.`,
      exampleIntro: 'Перед примером сделай прогноз: какой метод будет самым коротким?',
      questionStyle: 'Объясняй ход решения и называй причину каждого ключевого шага.',
      practiceInstruction: `Закрепление: реши базовую задачу, затем измени условие под тему ${interest}.`,
      testInstruction: 'Контрольная: покажи перенос метода на новую задачу.',
    };
  }

  if (tone === 'strategic') {
    return {
      opening: `Смотрим на тему как на инструмент. ${content.teaching.teacherOpening}`,
      explanation: `${content.teaching.conceptExplanation} Свяжи идею с задачами выбора, оптимизации, прогноза или проверки гипотез.`,
      exampleIntro: 'В примере отметь не только вычисления, но и стратегию: почему выбран именно этот путь?',
      questionStyle: 'Отвечай как на олимпиадном разборе: идея → метод → проверка → обобщение.',
      practiceInstruction: `Закрепление: сформулируй прикладной пример из области ${interest} и реши его математически.`,
      testInstruction: 'Контрольная: реши переносную задачу и объясни, где метод может сломаться.',
    };
  }

  return {
    opening: `Работаем строго. ${content.teaching.teacherOpening}`,
    explanation: `${content.teaching.conceptExplanation} Отделяем интуицию от формального условия применимости.`,
    exampleIntro: 'В примере выдели определение, допустимые шаги, проверку и возможное обобщение.',
    questionStyle: 'Отвечай в формате: утверждение → обоснование → вывод → проверка границ.',
    practiceInstruction: `Закрепление: построй модель из области ${interest}, укажи ограничения и проверь частный случай.`,
    testInstruction: 'Контрольная: дай строгое объяснение и проверь контрпример или граничный случай.',
  };
}

export function getAdaptiveLessonView(profile: StudentProfile, lesson: LessonRoadmapItem, content: EliteLessonContent, mastery: LessonMasteryState): AdaptiveLessonView {
  const grade = gradeNumberFrom(profile);
  const tone = toneForGrade(grade);
  const interest = firstInterest(profile);

  return {
    tone,
    ageLabel: ageLabel(tone),
    teacherVoice: teacherVoice(tone),
    hook: hookFor(tone, lesson, interest),
    interestBridge: interestBridge(tone, lesson, interest),
    motivation: motivationFor(profile, mastery, tone),
    adaptedTeaching: adaptedTeaching(tone, content, lesson, interest),
  };
}
