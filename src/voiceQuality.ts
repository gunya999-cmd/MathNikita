export type SpeechVoiceLike = {
  name: string;
  lang: string;
  voiceURI: string;
  localService: boolean;
};

const RUSSIAN_LOCALE = /^ru(?:[-_]|$)/i;
const NATURAL_QUALITY = /premium|enhanced|natural|siri|нейрон/i;
const KNOWN_RUSSIAN_VOICES = /milena|yuri|юрий|katya|irina|alena|ал[её]на/i;
const LOW_QUALITY = /compact|espeak|piper|basic/i;

export function isRussianVoice(voice: SpeechVoiceLike) {
  return RUSSIAN_LOCALE.test(voice.lang.trim());
}

export function scoreRussianVoice(voice: SpeechVoiceLike) {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (NATURAL_QUALITY.test(name)) score += 120;
  if (KNOWN_RUSSIAN_VOICES.test(name)) score += 90;
  if (/apple/.test(name)) score += 45;
  if (/microsoft|google/.test(name)) score += 30;
  if (voice.localService) score += 20;
  if (LOW_QUALITY.test(name)) score -= 100;
  return score;
}

export function rankRussianVoices<T extends SpeechVoiceLike>(voices: readonly T[]) {
  return voices
    .filter(isRussianVoice)
    .slice()
    .sort((a, b) => scoreRussianVoice(b) - scoreRussianVoice(a) || a.name.localeCompare(b.name, 'ru'));
}

export function selectBestRussianVoice<T extends SpeechVoiceLike>(voices: readonly T[], storedVoiceURI?: string) {
  const ranked = rankRussianVoices(voices);
  if (!ranked.length) return undefined;
  const stored = storedVoiceURI ? ranked.find(voice => voice.voiceURI === storedVoiceURI) : undefined;
  return stored ?? ranked[0];
}

export function isNaturalRussianVoice(voice?: SpeechVoiceLike) {
  if (!voice || !isRussianVoice(voice)) return false;
  const name = voice.name.toLowerCase();
  return !LOW_QUALITY.test(name) && (NATURAL_QUALITY.test(name) || KNOWN_RUSSIAN_VOICES.test(name));
}

const LATIN_LETTER_NAMES: Record<string, string> = {
  A: 'А', B: 'Бэ', C: 'Цэ', D: 'Дэ', E: 'Е', F: 'Эф', G: 'Жэ', H: 'Аш', I: 'И',
  J: 'Жи', K: 'Ка', L: 'Эль', M: 'Эм', N: 'Эн', O: 'О', P: 'Пэ', Q: 'Ку', R: 'Эр',
  S: 'Эс', T: 'Тэ', U: 'У', V: 'Вэ', W: 'Дабл-ю', X: 'Икс', Y: 'Игрек', Z: 'Зет',
};

type UnitForms = readonly [string, string, string];
const UNIT_FORMS: Record<string, UnitForms> = {
  мм: ['миллиметр', 'миллиметра', 'миллиметров'],
  см: ['сантиметр', 'сантиметра', 'сантиметров'],
  дм: ['дециметр', 'дециметра', 'дециметров'],
  м: ['метр', 'метра', 'метров'],
  км: ['километр', 'километра', 'километров'],
  мл: ['миллилитр', 'миллилитра', 'миллилитров'],
  л: ['литр', 'литра', 'литров'],
  га: ['гектар', 'гектара', 'гектаров'],
};

const SQUARE_UNIT_FORMS: Record<string, UnitForms> = {
  мм: ['квадратный миллиметр', 'квадратных миллиметра', 'квадратных миллиметров'],
  см: ['квадратный сантиметр', 'квадратных сантиметра', 'квадратных сантиметров'],
  дм: ['квадратный дециметр', 'квадратных дециметра', 'квадратных дециметров'],
  м: ['квадратный метр', 'квадратных метра', 'квадратных метров'],
  км: ['квадратный километр', 'квадратных километра', 'квадратных километров'],
};

const CUBIC_UNIT_FORMS: Record<string, UnitForms> = {
  мм: ['кубический миллиметр', 'кубических миллиметра', 'кубических миллиметров'],
  см: ['кубический сантиметр', 'кубических сантиметра', 'кубических сантиметров'],
  дм: ['кубический дециметр', 'кубических дециметра', 'кубических дециметров'],
  м: ['кубический метр', 'кубических метра', 'кубических метров'],
  км: ['кубический километр', 'кубических километра', 'кубических километров'],
};

const PERCENT_FORMS: UnitForms = ['процент', 'процента', 'процентов'];
const DEGREE_FORMS: UnitForms = ['градус', 'градуса', 'градусов'];
const UNIT_TOKEN = 'км|дм|см|мм|мл|га|м|л';
const DIMENSION_UNIT_TOKEN = 'км|дм|см|мм|м';

const PRONUNCIATION_STRESS: Array<{ pattern: RegExp; stressed: string }> = [
  { pattern: /параллелепипед/gi, stressed: 'параллелепи́пед' },
  { pattern: /комбинаторик/gi, stressed: 'комбинато́рик' },
  { pattern: /равнобедрен/gi, stressed: 'равнобе́дрен' },
  { pattern: /транспортир/gi, stressed: 'транспорти́р' },
  { pattern: /координат/gi, stressed: 'координа́т' },
  { pattern: /диагонал/gi, stressed: 'диагона́л' },
  { pattern: /пирамид/gi, stressed: 'пирами́д' },
];

function inflectedUnit(numberText: string, forms: UnitForms) {
  const value = Math.abs(Number(numberText.replace(',', '.')));
  if (!Number.isInteger(value)) return forms[2];
  const mod100 = value % 100;
  const mod10 = value % 10;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

function speakLatinToken(token: string) {
  return token.toUpperCase().split('').map(letter => LATIN_LETTER_NAMES[letter] ?? letter).join(' ');
}

function preserveInitialCase(source: string, replacement: string) {
  return /^[А-ЯЁ]/.test(source) ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
}

function applyPronunciationStress(value: string) {
  return PRONUNCIATION_STRESS.reduce(
    (text, entry) => text.replace(entry.pattern, match => preserveInitialCase(match, entry.stressed)),
    value,
  );
}

function replaceDimensionUnits(value: string) {
  let text = value;
  text = text.replace(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${DIMENSION_UNIT_TOKEN})\\s*(?:²|\\^\\s*2\\b)`, 'gi'), (_, numberText: string, unit: string) => {
    const forms = SQUARE_UNIT_FORMS[unit.toLowerCase()];
    return forms ? `${numberText} ${inflectedUnit(numberText, forms)}` : `${numberText} ${unit} в квадрате`;
  });
  text = text.replace(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${DIMENSION_UNIT_TOKEN})\\s*(?:³|\\^\\s*3\\b)`, 'gi'), (_, numberText: string, unit: string) => {
    const forms = CUBIC_UNIT_FORMS[unit.toLowerCase()];
    return forms ? `${numberText} ${inflectedUnit(numberText, forms)}` : `${numberText} ${unit} в кубе`;
  });
  text = text.replace(/([A-Za-zА-Яа-яЁё0-9)])\s*(?:²|\^\s*2\b)/g, '$1 в квадрате');
  text = text.replace(/([A-Za-zА-Яа-яЁё0-9)])\s*(?:³|\^\s*3\b)/g, '$1 в кубе');
  return text;
}

export function prepareRussianSpeechText(value: string) {
  let text = replaceDimensionUnits(value);
  text = text.replace(/№\s*(\d+)/g, 'номер $1').normalize('NFKC').replace(/\u00a0/g, ' ');
  text = text.replace(/§\s*(\d+)/g, 'параграф $1');
  text = text.replace(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${UNIT_TOKEN})(?=\\s|[.,;:!?)]|$)`, 'gi'), (_, numberText: string, unit: string) => {
    const forms = UNIT_FORMS[unit.toLowerCase()];
    return forms ? `${numberText} ${inflectedUnit(numberText, forms)}` : `${numberText} ${unit}`;
  });
  text = text.replace(/(\d+(?:[.,]\d+)?)\s*%/g, (_, numberText: string) => `${numberText} ${inflectedUnit(numberText, PERCENT_FORMS)}`);
  text = text.replace(/(\d+(?:[.,]\d+)?)\s*°/g, (_, numberText: string) => `${numberText} ${inflectedUnit(numberText, DEGREE_FORMS)}`);
  text = text.replace(/(\d)\s+[–—]\s+(\d)/g, '$1 минус $2');
  text = text.replace(/(\d)[–—](\d)/g, '$1 до $2');
  text = text.replace(/(\d)\s*−\s*(\d)/g, '$1 минус $2');
  text = text.replace(/(\d)\s+-\s+(\d)/g, '$1 минус $2');
  text = text.replace(/\s*≥\s*/g, ' больше или равно ');
  text = text.replace(/\s*≤\s*/g, ' меньше или равно ');
  text = text.replace(/\s*>\s*/g, ' больше ');
  text = text.replace(/\s*<\s*/g, ' меньше ');
  text = text.replace(/(\d)\s*[×*·]\s*([\dA-Za-z])/g, (_, left: string, right: string) => {
    const spokenRight = /^[A-Za-z]$/.test(right) ? speakLatinToken(right) : right;
    return `${left} умножить на ${spokenRight}`;
  });
  text = text.replace(/([\d)])\s*[×*·]\s*(?=[\d(])/g, '$1 умножить на ');
  text = text.replace(/([\d)])\s*[÷:]\s*(?=[\d(])/g, '$1 разделить на ');
  text = text.replace(/(\d)([A-Za-z]{1,4})\b/g, (_, number: string, token: string) => `${number} умножить на ${speakLatinToken(token)}`);
  text = text.replace(/\b([A-Za-z]{1,4})\b/g, token => speakLatinToken(token));
  text = text.replace(/\s*[×*·]\s*/g, ' умножить на ');
  text = text.replace(/\s*=\s*/g, ' равно ');
  text = text.replace(/\s*\+\s*/g, ' плюс ');
  text = text.replace(/\s*→\s*/g, ' переходит в ');
  text = text.replace(/\s*↔\s*/g, ' продолжается в обе стороны ');
  text = applyPronunciationStress(text);
  return text
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([.!?]){2,}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
