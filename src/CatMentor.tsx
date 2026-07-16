import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import mentorScriptsData from './data/mentorScripts.json';
import { MentorMarkerOverlay } from './MentorMarkerOverlay';
import './catMentor.css';

export type MentorSignal = {
  kind: 'idle' | 'correct' | 'wrong';
  version: number;
};

type CatMentorProps = {
  rootRef: RefObject<HTMLElement | null>;
  lessonNumber: number;
  mode: 'opening' | 'lesson';
  signal: MentorSignal;
};

type SceneSnapshot = {
  key: string;
  title: string;
  body: string;
  prompt: string;
  note: string;
};

type MentorAction = 'welcome' | 'different' | 'example' | 'hint' | 'why';
type MentorResponse = MentorAction | 'success' | 'retry';
type MentorMood = 'calm' | 'thinking' | 'happy' | 'encouraging' | 'speaking';
type MentorScriptKey = keyof typeof mentorScriptsData;
type MentorScript = Record<MentorResponse, string>;

type NeuralNarrationManifest = {
  voice: string;
  clips: Record<string, string>;
};

const MANIFEST_URL = '/audio/neural/manifest.json';
const AUTO_GUIDE_KEY = 'mathnikita-mentor-auto-guide';

const emptyScene: SceneSnapshot = {
  key: 'empty',
  title: '',
  body: '',
  prompt: '',
  note: '',
};

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function readVisibleScene(root: HTMLElement | null, mode: 'opening' | 'lesson'): SceneSnapshot {
  if (!root) return emptyScene;

  if (mode === 'opening') {
    const scope = root.querySelector<HTMLElement>('.opening-screen:not([hidden])');
    if (!scope) return emptyScene;
    const title = cleanText(scope.querySelector('.lesson-opening-copy h1')?.textContent);
    const body = cleanText(scope.querySelector('.lesson-opening-copy p')?.textContent);
    const prompt = cleanText(scope.querySelector('.lesson-opening-question b')?.textContent);
    return { key: `opening:${title}`, title, body, prompt, note: '' };
  }

  const scope = root.querySelector<HTMLElement>('.lesson-runtime:not([hidden])');
  const stage = scope?.querySelector<HTMLElement>('.interactive-stage');
  if (!stage) return emptyScene;

  const title = cleanText(stage.querySelector('.stage-copy h2')?.textContent);
  const body = cleanText(stage.querySelector('.stage-copy p')?.textContent);
  const prompt = cleanText(stage.querySelector('.activity-area h3')?.textContent);
  const note = cleanText(stage.querySelector('.theory-note span')?.textContent);
  return { key: `${title}|${prompt}`, title, body, prompt, note };
}

function selectScriptKey(scene: SceneSnapshot, lessonNumber: number, mode: 'opening' | 'lesson'): MentorScriptKey {
  if (mode === 'opening') return lessonNumber === 1 ? 'opening-1' : 'opening-2';
  const text = `${scene.title} ${scene.body} ${scene.prompt} ${scene.note}`.toLowerCase();
  if (/между|границ|промежут|включительно|k\s*[−-]\s*1|n\s*\+\s*k/.test(text)) return 'between';
  if (/последователь|закономер|шаг|продолж|пропуск/.test(text)) return 'sequence';
  if (/следующ|предыдущ|натуральн.*ряд|соседн/.test(text)) return 'natural-row';
  if (/измер|мерк|сч[её]т|предмет/.test(text)) return 'measurement';
  return 'generic';
}

function loadAutoGuide() {
  try {
    return localStorage.getItem(AUTO_GUIDE_KEY) === 'true';
  } catch {
    return false;
  }
}

function CatAvatar({ mood }: { mood: MentorMood }) {
  const happy = mood === 'happy';
  const thinking = mood === 'thinking';
  const encouraging = mood === 'encouraging';
  const speaking = mood === 'speaking';

  return (
    <svg className={`cat-mentor-avatar mood-${mood}`} viewBox="0 0 240 210" role="img" aria-label="Кот-наставник Пифагор">
      <defs>
        <linearGradient id="mentor-fur" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb338" /><stop offset="1" stopColor="#e97722" /></linearGradient>
        <linearGradient id="mentor-hoodie" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1596a8" /><stop offset="1" stopColor="#12538b" /></linearGradient>
      </defs>
      <ellipse cx="122" cy="192" rx="82" ry="13" fill="rgba(19,38,68,.12)" />
      <path d="M54 164c9-35 31-55 67-56 37-1 62 19 70 56l5 35H46z" fill="url(#mentor-hoodie)" />
      <path d="M74 126c10 19 26 29 48 29 23 0 40-10 49-30" fill="none" stroke="#0e466f" strokeWidth="8" strokeLinecap="round" />
      <path d="M65 72 52 20l47 29M175 71l16-51-49 30" fill="url(#mentor-fur)" stroke="#c85a1d" strokeWidth="5" strokeLinejoin="round" />
      <path d="m63 38 24 17-18 8zM179 37l-25 18 19 8z" fill="#f58a72" />
      <ellipse cx="121" cy="88" rx="67" ry="59" fill="url(#mentor-fur)" stroke="#c85a1d" strokeWidth="4" />
      <path d="M78 73c9-9 19-11 29-4M136 69c10-7 21-5 29 4" fill="none" stroke="#8d3f19" strokeWidth="5" strokeLinecap="round" />
      {thinking ? (
        <><ellipse cx="93" cy="88" rx="14" ry="17" fill="#fff" /><ellipse cx="151" cy="88" rx="14" ry="17" fill="#fff" /><circle cx="97" cy="84" r="7" fill="#286b3a" /><circle cx="155" cy="84" r="7" fill="#286b3a" /></>
      ) : (
        <><path d={happy ? 'M80 88q13 14 26 0' : 'M80 91q13-12 26 0'} fill={happy ? 'none' : '#fff'} stroke="#6f3218" strokeWidth="4" strokeLinecap="round" /><path d={happy ? 'M136 88q13 14 26 0' : 'M136 91q13-12 26 0'} fill={happy ? 'none' : '#fff'} stroke="#6f3218" strokeWidth="4" strokeLinecap="round" />{!happy ? <><circle cx="95" cy="88" r="7" fill="#286b3a" /><circle cx="151" cy="88" r="7" fill="#286b3a" /></> : null}</>
      )}
      <path d="m121 96-9 8 10 5 9-5z" fill="#d85d45" stroke="#8d3f19" strokeWidth="2" />
      <path d={speaking ? 'M104 113q18 26 37 0q-18 13-37 0' : happy ? 'M103 112q19 23 39 0' : encouraging ? 'M105 116q17 12 34 0' : 'M108 118q14 8 28 0'} fill="#fff4dc" stroke="#8d3f19" strokeWidth="3" strokeLinecap="round" />
      <path d="M67 101 28 94M69 112l-41 5M174 101l39-8M173 113l40 7" fill="none" stroke="#8d3f19" strokeWidth="3" strokeLinecap="round" />
      <circle cx="121" cy="166" r="25" fill="#f8bd36" stroke="#8a5a0b" strokeWidth="4" />
      <text x="121" y="177" textAnchor="middle" fontSize="34" fontWeight="800" fill="#70470a">π</text>
      <path className="cat-mentor-paw" d="M58 164c-21-9-34-3-36 9-1 11 14 16 39 7" fill="url(#mentor-fur)" stroke="#c85a1d" strokeWidth="4" strokeLinecap="round" />
      <path d="M27 165 14 132" fill="none" stroke="#26344f" strokeWidth="7" strokeLinecap="round" />
      <path d="m14 132 4-10 5 9z" fill="#26344f" />
    </svg>
  );
}

export function CatMentor({ rootRef, lessonNumber, mode, signal }: CatMentorProps) {
  const [scene, setScene] = useState<SceneSnapshot>(emptyScene);
  const [action, setAction] = useState<MentorAction>('welcome');
  const [collapsed, setCollapsed] = useState(false);
  const [manifest, setManifest] = useState<NeuralNarrationManifest | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [autoGuide, setAutoGuide] = useState(loadAutoGuide);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;
    fetch(MANIFEST_URL, { cache: 'no-cache' })
      .then(response => response.ok ? response.json() as Promise<NeuralNarrationManifest> : Promise.reject())
      .then(next => { if (active) setManifest(next); })
      .catch(() => { if (active) setManifest(null); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const refresh = () => {
      const next = readVisibleScene(root, mode);
      setScene(previous => previous.key === next.key ? previous : next);
    };
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    return () => observer.disconnect();
  }, [rootRef, lessonNumber, mode]);

  const scriptKey = useMemo(() => selectScriptKey(scene, lessonNumber, mode), [scene, lessonNumber, mode]);
  const script = mentorScriptsData[scriptKey] as MentorScript;
  const responseKey: MentorResponse = signal.kind === 'correct' ? 'success' : signal.kind === 'wrong' ? 'retry' : action;
  const message = script[responseKey];

  function stopSpeech() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setSpeaking(false);
  }

  function playSpeech(key: MentorScriptKey, response: MentorResponse) {
    const source = manifest?.clips[`mentor-${key}-${response}`];
    if (!source) return;
    window.speechSynthesis?.cancel();
    window.dispatchEvent(new CustomEvent('mathnikita-audio-request', { detail: { source: 'mentor' } }));
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.pause();
    audio.src = source;
    audio.preload = 'auto';
    audio.playbackRate = 0.96;
    audio.onended = () => setSpeaking(false);
    audio.onerror = () => setSpeaking(false);
    setSpeaking(true);
    void audio.play().catch(() => setSpeaking(false));
  }

  useEffect(() => {
    stopSpeech();
    setAction('welcome');
    if (!autoGuide || !manifest || scene.key === 'empty') return;
    const timer = window.setTimeout(() => playSpeech(scriptKey, 'welcome'), 120);
    return () => window.clearTimeout(timer);
  }, [scene.key, lessonNumber, mode, autoGuide, manifest, scriptKey]);

  useEffect(() => {
    if (!autoGuide || !manifest || signal.kind === 'idle') return;
    const response: MentorResponse = signal.kind === 'correct' ? 'success' : 'retry';
    const timer = window.setTimeout(() => playSpeech(scriptKey, response), 100);
    return () => window.clearTimeout(timer);
  }, [signal.version, signal.kind, autoGuide, manifest, scriptKey]);

  useEffect(() => () => stopSpeech(), []);

  function chooseAction(next: MentorAction) {
    setAction(next);
    playSpeech(scriptKey, next);
  }

  function toggleAutoGuide() {
    const next = !autoGuide;
    setAutoGuide(next);
    localStorage.setItem(AUTO_GUIDE_KEY, String(next));
    if (next) playSpeech(scriptKey, responseKey);
    else stopSpeech();
  }

  const mood: MentorMood = speaking
    ? 'speaking'
    : signal.kind === 'correct'
      ? 'happy'
      : signal.kind === 'wrong'
        ? 'encouraging'
        : action === 'hint' || action === 'why'
          ? 'thinking'
          : 'calm';

  const marker = (
    <MentorMarkerOverlay
      rootRef={rootRef}
      lessonNumber={lessonNumber}
      mode={mode}
      sceneKey={scene.key}
      title={scene.title}
      body={scene.body}
      prompt={scene.prompt}
      action={action}
    />
  );

  if (collapsed) {
    return (
      <>
        <button className="cat-mentor-collapsed" type="button" onClick={() => setCollapsed(false)} aria-label="Открыть наставника Пифагора">
          <CatAvatar mood={mood} /><span>Пифагор</span>{signal.kind !== 'idle' ? <i aria-hidden="true" /> : null}
        </button>
        {marker}
      </>
    );
  }

  return (
    <>
      <aside className={`cat-mentor-panel is-${mood}`} aria-label="Виртуальный наставник Пифагор">
        <header>
          <div><span>Наставник</span><b>Кот Пифагор</b></div>
          <button type="button" onClick={() => setCollapsed(true)} aria-label="Свернуть наставника">×</button>
        </header>

        <div className="cat-mentor-portrait"><CatAvatar mood={mood} /></div>

        <div className="cat-mentor-bubble" key={`${scene.key}-${action}-${signal.version}`}>
          <p>{message}</p>
          <button className={speaking ? 'cat-mentor-speak is-speaking' : 'cat-mentor-speak'} type="button" onClick={() => speaking ? stopSpeech() : playSpeech(scriptKey, responseKey)} aria-label={speaking ? 'Остановить реплику' : 'Озвучить реплику'}>
            {speaking ? '■' : '▶'}
          </button>
        </div>

        <div className="cat-mentor-voice-row">
          <button type="button" className={autoGuide ? 'is-on' : ''} onClick={toggleAutoGuide} aria-pressed={autoGuide}>
            <span aria-hidden="true">{autoGuide ? '🔊' : '🔈'}</span>
            {autoGuide ? 'Ведёт голосом' : 'Голос по кнопке'}
          </button>
          <small>{manifest ? `Нейроголос ${manifest.voice}` : 'Загружаем голос…'}</small>
        </div>

        <div className="cat-mentor-actions" aria-label="Помощь наставника">
          <button type="button" className={action === 'different' ? 'active' : ''} onClick={() => chooseAction('different')}><span aria-hidden="true">↻</span> Объясни иначе</button>
          <button type="button" className={action === 'example' ? 'active' : ''} onClick={() => chooseAction('example')}><span aria-hidden="true">▣</span> Дай пример</button>
          <button type="button" className={action === 'hint' ? 'active' : ''} onClick={() => chooseAction('hint')}><span aria-hidden="true">✦</span> Подсказка</button>
          <button type="button" className={action === 'why' ? 'active' : ''} onClick={() => chooseAction('why')}><span aria-hidden="true">?</span> Почему так?</button>
        </div>
      </aside>
      {marker}
    </>
  );
}
