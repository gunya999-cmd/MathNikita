import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { isNaturalRussianVoice, isRussianVoice, prepareRussianSpeechText, rankRussianVoices, selectBestRussianVoice } from './voiceQuality';
import './voiceNarrator.css';

type VoiceNarratorProps = {
  rootRef: RefObject<HTMLElement | null>;
  mode: 'opening' | 'lesson';
};

type VoiceEngine = 'neural' | 'system';
type StoredVoiceSettings = { engine?: VoiceEngine; voiceURI?: string; rate?: number };
type NeuralNarrationManifest = { engine: string; voice: string; license?: string; clips: Record<string, string> };
type AudioRequestDetail = { source?: 'narrator' | 'mentor' | string };

const STORAGE_KEY = 'mathnikita-voice-settings-v3';
const MANIFEST_URL = '/audio/neural/manifest.json';
const DEFAULT_RATE = 0.94;

function loadSettings(): StoredVoiceSettings {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as StoredVoiceSettings; }
  catch { return {}; }
}

function visiblePractice(root: HTMLElement) {
  return root.querySelector<HTMLElement>('.lesson-reflection .extended-practice[data-practice-task]');
}

function visibleFinalReflection(root: HTMLElement) {
  const finalStep = root.querySelector<HTMLElement>('.lesson-reflection .reflection-final-step');
  return finalStep && !finalStep.hidden && finalStep.offsetParent !== null ? finalStep : null;
}

function getNarrationText(root: HTMLElement | null, mode: VoiceNarratorProps['mode']) {
  if (!root) return '';
  if (mode === 'opening') {
    const scope = root.querySelector<HTMLElement>('.opening-screen:not([hidden])');
    if (!scope) return '';
    const selectors = ['.lesson-opening-copy h1', '.lesson-opening-copy p', '.lesson-opening-question b', '.lesson-opening-plan li span'];
    const parts = selectors.flatMap(selector => Array.from(scope.querySelectorAll<HTMLElement>(selector))
      .filter(node => node.offsetParent !== null)
      .map(node => node.textContent?.trim() ?? '')
      .filter(Boolean));
    return Array.from(new Set(parts)).join('. ');
  }

  const practice = visiblePractice(root);
  if (practice) {
    const selectors = ['h3', '.extended-practice-instruction', '.extended-practice-input span'];
    const parts = selectors.flatMap(selector => Array.from(practice.querySelectorAll<HTMLElement>(selector))
      .filter(node => node.offsetParent !== null)
      .map(node => node.textContent?.trim() ?? '')
      .filter(Boolean));
    return Array.from(new Set(parts)).join('. ');
  }

  const finalReflection = visibleFinalReflection(root);
  if (finalReflection) {
    const selectors = ['.reflection-heading h2', '.reflection-heading p', 'blockquote', '.reflection-answer > span'];
    const parts = selectors.flatMap(selector => Array.from(finalReflection.querySelectorAll<HTMLElement>(selector))
      .filter(node => node.offsetParent !== null)
      .map(node => node.textContent?.trim() ?? '')
      .filter(Boolean));
    return Array.from(new Set(parts)).join('. ');
  }

  const scope = root.querySelector<HTMLElement>('.lesson-runtime:not([hidden])');
  if (!scope) return '';
  const selectors = ['.interactive-stage .stage-copy h2', '.interactive-stage .stage-copy p', '.interactive-stage .theory-note span', '.interactive-stage .activity-area h3', '.lesson-block h2', '.lesson-block .block-text', '.lesson-block .lesson-items li'];
  const parts = selectors.flatMap(selector => Array.from(scope.querySelectorAll<HTMLElement>(selector))
    .filter(node => node.offsetParent !== null)
    .map(node => node.textContent?.trim() ?? '')
    .filter(Boolean));
  return Array.from(new Set(parts)).join('. ');
}

function getNarrationId(root: HTMLElement | null, mode: VoiceNarratorProps['mode']) {
  if (!root) return '';
  const lessonLabel = root.querySelector<HTMLElement>('.lesson-mode-toolbar > div > span')?.textContent ?? '';
  const lessonMatch = lessonLabel.match(/Урок\s+(\d+)/i);
  if (!lessonMatch) return '';
  const lessonNumber = String(Number(lessonMatch[1])).padStart(2, '0');
  if (mode === 'opening') return `lesson-${lessonNumber}-opening`;

  const practice = visiblePractice(root);
  const practiceId = practice?.dataset.practiceTask;
  if (practiceId) return `lesson-${lessonNumber}-practice-${practiceId}`;
  if (visibleFinalReflection(root)) return `lesson-${lessonNumber}-reflection`;

  const stageLabel = root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .stage-counter')?.textContent ?? '';
  const stageMatch = stageLabel.match(/Этап\s+(\d+)/i);
  if (!stageMatch) return '';
  return `lesson-${lessonNumber}-stage-${String(Number(stageMatch[1])).padStart(2, '0')}`;
}

function splitForSpeech(text: string) {
  const sentences = text.match(/[^.!?…]+[.!?…]?/g) ?? [text];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    const next = `${current} ${sentence}`.trim();
    if (next.length > 180 && current) { chunks.push(current); current = sentence.trim(); }
    else current = next;
  }
  if (current) chunks.push(current);
  return chunks;
}

export function VoiceNarrator({ rootRef, mode }: VoiceNarratorProps) {
  const systemSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const audioSupported = typeof window !== 'undefined' && typeof Audio !== 'undefined';
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [manifest, setManifest] = useState<NeuralNarrationManifest | null>(null);
  const [manifestChecked, setManifestChecked] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const initialSettings = useMemo(loadSettings, []);
  const [engine, setEngine] = useState<VoiceEngine>(initialSettings.engine ?? 'system');
  const [voiceURI, setVoiceURI] = useState(initialSettings.voiceURI ?? '');
  const [rate, setRate] = useState(initialSettings.rate ?? DEFAULT_RATE);
  const sessionRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function stop() {
    sessionRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (systemSupported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  useEffect(() => {
    if (!systemSupported) return;
    const loadVoices = () => {
      const next = rankRussianVoices(window.speechSynthesis.getVoices());
      setVoices(next);
      setVoiceURI(current => selectBestRussianVoice(next, current)?.voiceURI ?? '');
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [systemSupported]);

  useEffect(() => {
    let active = true;
    fetch(MANIFEST_URL, { cache: 'no-cache' })
      .then(response => response.ok ? response.json() as Promise<NeuralNarrationManifest> : Promise.reject(new Error(`Narration manifest: ${response.status}`)))
      .then(next => { if (active) setManifest(next); })
      .catch(() => { if (active) setManifest(null); })
      .finally(() => { if (active) setManifestChecked(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ engine, voiceURI, rate })); }, [engine, voiceURI, rate]);

  useEffect(() => {
    const stopHandler = () => stop();
    const requestHandler = (event: Event) => {
      const source = (event as CustomEvent<AudioRequestDetail>).detail?.source;
      if (source !== 'narrator') stop();
    };
    window.addEventListener('mathnikita-stop-narration', stopHandler);
    window.addEventListener('mathnikita-audio-request', requestHandler);
    return () => {
      window.removeEventListener('mathnikita-stop-narration', stopHandler);
      window.removeEventListener('mathnikita-audio-request', requestHandler);
    };
  }, []);

  useEffect(() => {
    stop();
    const root = rootRef.current;
    if (!root) return;
    let currentId = getNarrationId(root, mode);
    const observer = new MutationObserver(() => {
      const nextId = getNarrationId(root, mode);
      if (nextId && nextId !== currentId) { currentId = nextId; stop(); }
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-practice-task', 'data-stage-id', 'hidden'] });
    return () => { observer.disconnect(); stop(); };
  }, [mode, rootRef]);

  function startSystemSpeech(text: string, session: number) {
    if (!systemSupported || !text) { setSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const chunks = splitForSpeech(prepareRussianSpeechText(text));
    const selectedVoice = selectBestRussianVoice(voices, voiceURI);
    setSpeaking(true);
    let index = 0;
    const playNext = () => {
      if (sessionRef.current !== session || index >= chunks.length) { setSpeaking(false); return; }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = 'ru-RU';
      utterance.voice = selectedVoice ?? null;
      utterance.rate = Math.min(Math.max(rate, 0.88), 1.04);
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => { index += 1; window.setTimeout(playNext, 130); };
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };
    playNext();
  }

  function speak() {
    if (speaking) { stop(); return; }
    const text = getNarrationText(rootRef.current, mode);
    if (!text) return;
    stop();
    const session = sessionRef.current + 1;
    sessionRef.current = session;
    window.dispatchEvent(new CustomEvent('mathnikita-audio-request', { detail: { source: 'narrator' } }));
    const narrationId = getNarrationId(rootRef.current, mode);
    const neuralSource = narrationId ? manifest?.clips[narrationId] : undefined;
    if (engine === 'neural' && audioSupported && neuralSource) {
      const audio = new Audio(neuralSource);
      audio.preload = 'auto';
      audio.playbackRate = rate;
      audioRef.current = audio;
      setSpeaking(true);
      const fallback = () => {
        if (sessionRef.current !== session) return;
        audioRef.current = null;
        startSystemSpeech(text, session);
      };
      audio.onended = () => {
        if (sessionRef.current === session) setSpeaking(false);
        audioRef.current = null;
      };
      audio.onerror = fallback;
      void audio.play().catch(fallback);
      return;
    }
    startSystemSpeech(text, session);
  }

  if (!audioSupported && !systemSupported) return null;
  const voiceOptions = rankRussianVoices(voices);
  const selectedVoice = selectBestRussianVoice(voiceOptions, voiceURI);
  const neuralReady = Boolean(manifest && Object.keys(manifest.clips).length);
  const systemVoiceMessage = !selectedVoice
    ? 'На устройстве не найден русский голос. iOS попробует подобрать его по языку ru-RU; для лучшего результата установите расширенный русский голос в настройках устройства.'
    : isNaturalRussianVoice(selectedVoice)
      ? `Выбран лучший доступный русский голос: ${selectedVoice.name}.`
      : `Выбран базовый русский голос: ${selectedVoice.name}. Для максимально естественного звучания установите версию Premium или Enhanced в настройках устройства.`;

  return <div className="voice-narrator">
    <button type="button" className={speaking ? 'is-speaking' : ''} onClick={speak} aria-pressed={speaking}><span aria-hidden="true">{speaking ? '■' : '▶'}</span>{speaking ? 'Остановить' : 'Слушать'}</button>
    <button type="button" className="voice-settings-button" onClick={() => setSettingsOpen(open => !open)} aria-expanded={settingsOpen} aria-label="Настройки голоса">⚙</button>
    {settingsOpen ? <div className="voice-settings-panel">
      <label><span>Режим озвучки</span><select value={engine} onChange={event => setEngine(event.target.value as VoiceEngine)}><option value="system">Естественный русский голос устройства · рекомендуется</option><option value="neural">Резервная офлайн-дорожка «Ирина» · более синтетическая</option></select></label>
      {engine === 'system' && voiceOptions.length ? <label><span>Русский голос</span><select value={selectedVoice?.voiceURI ?? ''} onChange={event => setVoiceURI(event.target.value)}>{voiceOptions.map((voice, index) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}{index === 0 ? ' · рекомендуется' : ''}{voice.localService ? ' · на устройстве' : ''}</option>)}</select></label> : null}
      <label><span>Скорость: {rate.toFixed(2)}×</span><input type="range" min="0.88" max="1.04" step="0.02" value={rate} onChange={event => setRate(Number(event.target.value))}/></label>
      <small className={engine === 'system' ? isRussianVoice(selectedVoice ?? { name: '', lang: '', voiceURI: '', localService: false }) ? 'voice-engine-ready' : 'voice-engine-pending' : neuralReady ? 'voice-engine-ready' : 'voice-engine-pending'}>{engine === 'system' ? systemVoiceMessage : neuralReady ? `Офлайн-дорожка «${manifest?.voice}» доступна только как резерв и звучит более синтетически.` : manifestChecked ? 'Офлайн-дорожка недоступна — используется естественный системный голос.' : 'Загружаем резервную офлайн-дорожку…'}</small>
    </div> : null}
  </div>;
}
