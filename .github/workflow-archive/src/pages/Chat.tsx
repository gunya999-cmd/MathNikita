import { useState } from 'react';
import { Button } from '../components/Button';
import { getGradeCurriculum } from '../data/curriculum';
import { formatTutorResponse, getTutorResponse } from '../data/tutor';
import type { DiagnosticSummary } from '../types';

type TutorApiResponse = {
  answer?: string;
  mode?: 'ai' | 'fallback';
  provider?: 'gemini' | 'openai';
  warning?: string;
  error?: string;
};

async function askTutorApi(message: string, summary: DiagnosticSummary | null, grade: string) {
  const curriculum = getGradeCurriculum(grade);
  const response = await fetch('/api/tutor', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      message,
      diagnosticSummary: summary,
      grade: curriculum.label,
      curriculumContext: {
        focus: curriculum.focus,
        units: curriculum.units,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Tutor API request failed');
  }

  return response.json() as Promise<TutorApiResponse>;
}

function formatApiLabel(result: TutorApiResponse) {
  if (result.mode !== 'ai') return 'Репетитор';
  if (result.provider === 'gemini') return 'AI-репетитор Gemini';
  if (result.provider === 'openai') return 'AI-репетитор OpenAI';
  return 'AI-репетитор';
}

export function Chat({ summary, grade }: { summary: DiagnosticSummary | null; grade: string }) {
  const curriculum = getGradeCurriculum(grade);
  const [messages, setMessages] = useState([
    summary?.weak[0]
      ? `Привет! Сейчас выбран ${curriculum.label}. Судя по диагностике, начнём с темы “${summary.weak[0]}”. Напиши, что именно непонятно.`
      : `Привет! Сейчас выбран ${curriculum.label}. Я помогу по программе: ${curriculum.units.join(', ')}.`,
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function send() {
    const message = input.trim();
    if (!message || isSending) return;

    setInput('');
    setIsSending(true);
    setMessages((previous) => [...previous, `Ты: ${message}`, 'Репетитор думает…']);

    try {
      const result = await askTutorApi(message, summary, grade);
      const answer = result.answer || formatTutorResponse(getTutorResponse(message, summary?.weak[0], grade));
      const label = formatApiLabel(result);
      const warning = result.warning ? `\n\nТехническая диагностика: ${result.warning}` : '';
      setMessages((previous) => [...previous.slice(0, -1), `${label}: ${answer}${warning}`]);
    } catch {
      const fallback = formatTutorResponse(getTutorResponse(message, summary?.weak[0], grade));
      setMessages((previous) => [...previous.slice(0, -1), `Репетитор: ${fallback}\n\nТехническая диагностика: запрос к API не прошёл`]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="panel wide">
      <h2>Чат с репетитором · {curriculum.label}</h2>
      <p className="muted">Если AI backend недоступен, чат автоматически использует локальные объяснения.</p>
      <div className="chat-box">{messages.map((message, index) => <div className="bubble" key={index}>{message}</div>)}</div>
      <div className="chat-input">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Например: объясни дроби" />
        <Button onClick={send}>{isSending ? 'Отправляю…' : 'Отправить'}</Button>
      </div>
    </section>
  );
}
