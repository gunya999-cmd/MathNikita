import { useState } from 'react';
import { Button } from '../components/Button';
import { formatTutorResponse, getTutorResponse } from '../data/tutor';
import type { DiagnosticSummary } from '../types';

type TutorApiResponse = {
  answer?: string;
  mode?: 'ai' | 'fallback';
  error?: string;
};

async function askTutorApi(message: string, summary: DiagnosticSummary | null) {
  const response = await fetch('/api/tutor', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      message,
      diagnosticSummary: summary,
    }),
  });

  if (!response.ok) {
    throw new Error('Tutor API request failed');
  }

  return response.json() as Promise<TutorApiResponse>;
}

export function Chat({ summary }: { summary: DiagnosticSummary | null }) {
  const [messages, setMessages] = useState([
    summary?.weak[0]
      ? `Привет! Судя по диагностике, начнём с темы “${summary.weak[0]}”. Напиши, что именно непонятно.`
      : 'Привет! Я помогу тебе с математикой. Напиши задачу, которую хочешь разобрать.',
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
      const result = await askTutorApi(message, summary);
      const answer = result.answer || formatTutorResponse(getTutorResponse(message, summary?.weak[0]));
      const label = result.mode === 'ai' ? 'AI-репетитор' : 'Репетитор';
      setMessages((previous) => [...previous.slice(0, -1), `${label}: ${answer}`]);
    } catch {
      const fallback = formatTutorResponse(getTutorResponse(message, summary?.weak[0]));
      setMessages((previous) => [...previous.slice(0, -1), `Репетитор: ${fallback}`]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="panel wide">
      <h2>Чат с репетитором</h2>
      <p className="muted">Если AI backend недоступен, чат автоматически использует локальные объяснения.</p>
      <div className="chat-box">{messages.map((message, index) => <div className="bubble" key={index}>{message}</div>)}</div>
      <div className="chat-input">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Например: объясни дроби" />
        <Button onClick={send}>{isSending ? 'Отправляю…' : 'Отправить'}</Button>
      </div>
    </section>
  );
}
