import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import './voiceNarrator.css';

type VoiceNarratorProps = {
  rootRef: RefObject<HTMLElement | null>;
  mode: 'opening' | 'lesson';
};

type VoiceEngine = 'neural' | 'system';
type StoredVoiceSettings = { engine?: VoiceEngine; voiceURI?: string; rate?: number };
type NeuralNarrationManifest = { engine: string; voice: string; license?: string; clips: Record<string, string> };
type AudioRequestDetail = { source?: 'narrator' | 'mentor' | string };

const STORAGE_KEY = 'mathnikita-voice-settings-v2';
const MANIFEST_URL = '/audio/neural/manifest.json';

function loadSettings(): StoredVoiceSettings {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as StoredVoiceSettings; }
  catch { return {}; }
}

function scoreVoice(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (voice.lang.toLowerCase().startsWith('ru')) score += 100;
  if (/milena|katya|irina|алёна|alena/.test(name)) score += 55;
  if (/premium|enhanced|natural/.test(name)) score += 50;
  if (/apple/.test(name)) score += 35;
  if (/microsoft|google/.test(name)) score += 25;
  if (voice.localService) score += 12;
  if (/compact|espeak|piper/.test(name)) score -= 30;
  return score;
}

function getNarrationText(root: HTMLElement | null, mode: VoiceNarratorProps['mode']) {
  if (!root) return '';
  const scope = mode === 'opening'
    ? root.querySelector<HTMLElement>('.opening-screen:not([hidden])')
    : root.querySelector<HTMLElement>('.lesson-runtime:not([hidden])');
  if (!scope) return '';
  const selectors = mode === 'opening'
    ? ['.lesson-opening-copy h1', '.lesson-opening-copy p', '.lesson-opening-question b', '.lesson-opening-plan li span']
    : ['.interactive-stage .stage-copy h2', '.interactive-stage .stage-copy p', '.interactive-stage .theory-note span', '.interactive-stage .activity-area h3', '.lesson-block h2', '.lesson-block .block-text', '.lesson-block .lesson-items li'];
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
  const [rate, setRate] = useState(initialSettings.rate ?? 0.96);
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
      const next = window.speechSynthesis.getVoices().sort((a, b) => scoreVoice(b) - scoreVoice(a));
      setVoices(next);
      if (!voiceURI && next.length) setVoiceURI(next[0].voiceURI);
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [systemSupported, voiceURI]);

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
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => { observer.disconnect(); stop(); };
  }, [mode, rootRef]);

  function startSystemSpeech(text: string, session: number) {
    if (!systemSupported || !text) { setSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const chunks = splitForSpeech(text);
    const selectedVoice = voices.find(voice => voice.voiceURI === voiceURI)
      ?? voices.find(voice => voice.lang.toLowerCase().startsWith('ru'))
      ?? voices[0];
    setSpeaking(true);
    let index = 0;
    const playNext = () => {
      if (sessionRef.current !== session || index >= chunks.length) { setSpeaking(false); return; }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = selectedVoice?.lang ?? 'ru-RU';
      utterance.voice = selectedVoice ?? null;
      utterance.rate = rate;
      utterance.pitch = 1.02;
      utterance.volume = 1;
      utterance.onend = () => { index += 1; window.setTimeout(playNext, 90); };
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
  const russianVoices = voices.filter(voice => voice.lang.toLowerCase().startsWith('ru'));
  const voiceOptions = russianVoices.length ? russianVoices : voices;
  const neuralReady = Boolean(manifest && Object.keys(manifest.clips).length);

  return <div className="voice-narrator">
    <button type="button" className={speaking ? 'is-speaking' : ''} onClick={speak} aria-pressed={speaking}><span aria-hidden="true">{speaking ? '■' : '▶'}</span>{speaking ? 'Остановить' : 'Слушать'}</button>
    <button type="button" className="voice-settings-button" onClick={() => setSettingsOpen(open => !open)} aria-expanded={settingsOpen} aria-label="Настройки голоса">⚙</button>
    {settingsOpen ? <div className="voice-settings-panel">
      <label><span>Режим озвучки</span><select value={engine} onChange={event => setEngine(event.target.value as VoiceEngine)}><option value="system">Естественный голос устройства · рекомендуется</option><option value="neural">Встроенная офлайн-дорожка «Ирина»</option></select></label>
      {engine === 'system' ? <label><span>Голос</span><select value={voiceURI} onChange={event => setVoiceURI(event.target.value)}>{voiceOptions.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}{voice.localService ? ' · на устройстве' : ''}</option>)}</select></label> : null}
      <label><span>Скорость: {rate.toFixed(2)}×</span><input type="range" min="0.86" max="1.08" step="0.02" value={rate} onChange={event => setRate(Number(event.target.value))}/></label>
      <small className={engine === 'system' ? 'voice-engine-ready' : neuralReady ? 'voice-engine-ready' : 'voice-engine-pending'}>{engine === 'system' ? 'На iPad сначала выбирается лучший русский голос Premium/Enhanced, если он установлен в iOS.' : neuralReady ? `Офлайн-дорожка «${manifest?.voice}» работает одинаково на всех устройствах, но звучит более синтетически.` : manifestChecked ? 'Офлайн-дорожка недоступна — используется системный голос.' : 'Загружаем офлайн-дорожку…'}</small>
    </div> : null}
  </div>;
}
