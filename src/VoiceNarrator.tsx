import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import './voiceNarrator.css';

type VoiceNarratorProps = {
  rootRef: RefObject<HTMLElement | null>;
  mode: 'opening' | 'lesson';
};

type StoredVoiceSettings = {
  voiceURI?: string;
  rate?: number;
};

const STORAGE_KEY = 'mathnikita-voice-settings';

function loadSettings(): StoredVoiceSettings {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as StoredVoiceSettings;
  } catch {
    return {};
  }
}

function scoreVoice(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (voice.lang.toLowerCase().startsWith('ru')) score += 100;
  if (voice.localService) score += 40;
  if (/milena|katya|irina|алёна|alena|premium|enhanced|natural/.test(name)) score += 20;
  if (/google|microsoft|apple/.test(name)) score += 8;
  return score;
}

function getNarrationText(root: HTMLElement | null, mode: 'opening' | 'lesson') {
  if (!root) return '';
  const scope = mode === 'opening'
    ? root.querySelector<HTMLElement>('.opening-screen:not([hidden])')
    : root.querySelector<HTMLElement>('.lesson-runtime:not([hidden])');
  if (!scope) return '';

  const selectors = mode === 'opening'
    ? ['.lesson-opening-copy h1', '.lesson-opening-copy p', '.lesson-opening-question b', '.lesson-opening-plan li span']
    : ['.interactive-stage .stage-copy h2', '.interactive-stage .stage-copy p', '.interactive-stage .theory-note span', '.interactive-stage .activity-area h3', '.lesson-block h2', '.lesson-block .block-text', '.lesson-block .lesson-items li'];

  const parts = selectors.flatMap(selector =>
    Array.from(scope.querySelectorAll<HTMLElement>(selector))
      .filter(node => node.offsetParent !== null)
      .map(node => node.textContent?.trim() ?? '')
      .filter(Boolean),
  );

  return Array.from(new Set(parts)).join('. ');
}

function splitForSpeech(text: string) {
  const sentences = text.match(/[^.!?…]+[.!?…]?/g) ?? [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const next = `${current} ${sentence}`.trim();
    if (next.length > 220 && current) {
      chunks.push(current);
      current = sentence.trim();
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function VoiceNarrator({ rootRef, mode }: VoiceNarratorProps) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const initialSettings = useMemo(loadSettings, []);
  const [voiceURI, setVoiceURI] = useState(initialSettings.voiceURI ?? '');
  const [rate, setRate] = useState(initialSettings.rate ?? 0.94);
  const sessionRef = useRef(0);

  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => {
      const next = window.speechSynthesis.getVoices().sort((a, b) => scoreVoice(b) - scoreVoice(a));
      setVoices(next);
      if (!voiceURI && next.length) {
        const preferred = next.find(voice => voice.lang.toLowerCase().startsWith('ru')) ?? next[0];
        setVoiceURI(preferred.voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [supported, voiceURI]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ voiceURI, rate }));
  }, [voiceURI, rate]);

  useEffect(() => () => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  function stop() {
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function speak() {
    if (!supported) return;
    if (speaking) {
      stop();
      return;
    }

    const text = getNarrationText(rootRef.current, mode);
    if (!text) return;

    window.speechSynthesis.cancel();
    const session = sessionRef.current + 1;
    sessionRef.current = session;
    const chunks = splitForSpeech(text);
    const selectedVoice = voices.find(voice => voice.voiceURI === voiceURI)
      ?? voices.find(voice => voice.lang.toLowerCase().startsWith('ru'))
      ?? voices[0];

    setSpeaking(true);
    let index = 0;

    const playNext = () => {
      if (sessionRef.current !== session || index >= chunks.length) {
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = selectedVoice?.lang ?? 'ru-RU';
      utterance.voice = selectedVoice ?? null;
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => {
        index += 1;
        playNext();
      };
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };

    playNext();
  }

  if (!supported) return null;

  const russianVoices = voices.filter(voice => voice.lang.toLowerCase().startsWith('ru'));
  const voiceOptions = russianVoices.length ? russianVoices : voices;

  return (
    <div className="voice-narrator">
      <button type="button" className={speaking ? 'is-speaking' : ''} onClick={speak} aria-pressed={speaking}>
        <span aria-hidden="true">{speaking ? '■' : '🔊'}</span>
        {speaking ? 'Остановить' : 'Озвучить'}
      </button>
      <button type="button" className="voice-settings-button" onClick={() => setSettingsOpen(open => !open)} aria-expanded={settingsOpen} aria-label="Настройки голоса">⚙</button>
      {settingsOpen ? (
        <div className="voice-settings-panel">
          <label>
            <span>Голос</span>
            <select value={voiceURI} onChange={event => setVoiceURI(event.target.value)}>
              {voiceOptions.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}{voice.localService ? ' · на устройстве' : ''}</option>)}
            </select>
          </label>
          <label>
            <span>Скорость: {rate.toFixed(2)}×</span>
            <input type="range" min="0.78" max="1.12" step="0.02" value={rate} onChange={event => setRate(Number(event.target.value))} />
          </label>
          <small>Используется системный голос устройства: без подписки, сервера и загрузки аудио.</small>
        </div>
      ) : null}
    </div>
  );
}
