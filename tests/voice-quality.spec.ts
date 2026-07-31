import { expect, test } from '@playwright/test';
import { prepareRussianSpeechText, rankRussianVoices, selectBestRussianVoice } from '../src/voiceQuality';

type MockVoice = { name:string; lang:string; voiceURI:string; localService:boolean };

const voices:MockVoice[]=[
  {name:'Ava Premium',lang:'en-US',voiceURI:'en-premium',localService:true},
  {name:'Русский Compact',lang:'ru-RU',voiceURI:'ru-compact',localService:true},
  {name:'Milena Enhanced',lang:'ru-RU',voiceURI:'ru-enhanced',localService:true},
];

test('voice ranking never puts an English premium voice ahead of Russian voices',()=>{
  const ranked=rankRussianVoices(voices);
  expect(ranked.map(voice=>voice.voiceURI)).toEqual(['ru-enhanced','ru-compact']);
  expect(selectBestRussianVoice(voices)?.voiceURI).toBe('ru-enhanced');
});

test('a stale stored English voice is ignored',()=>{
  expect(selectBestRussianVoice(voices,'en-premium')?.voiceURI).toBe('ru-enhanced');
  expect(selectBestRussianVoice(voices,'ru-compact')?.voiceURI).toBe('ru-compact');
});

test('math notation is converted into natural Russian speech',()=>{
  const spoken=prepareRussianSpeechText('§ 4. № 99: AB = AC + CB. 18 см. 7 · 2 = 14.');
  expect(spoken).toContain('параграф 4');
  expect(spoken).toContain('номер 99');
  expect(spoken).toContain('А Бэ');
  expect(spoken).toContain('равно');
  expect(spoken).toContain('18 сантиметров');
  expect(spoken).toContain('7 умножить на 2');
  expect(spoken).not.toMatch(/[§№=·]/);
  expect(spoken).not.toContain('AB');
});
