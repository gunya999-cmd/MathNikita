import { useState } from 'react';
import { Button } from '../components/Button';
import { formatTutorResponse, getTutorResponse } from '../data/tutor';
import type { DiagnosticSummary } from '../types';

export function Chat({ summary }: { summary: DiagnosticSummary | null }) {
  const [messages, setMessages] = useState([
    summary?.weak[0]
      ? `Привет! Судя по диагностике, начнём с темы “${summary.weak[0]}”. Напиши, что именно непонятно.`
      : 'Привет! Я помогу тебе с математикой. Напиши задачу, которую хочешь разобрать.',
  ]);
  const [input, setInput] = useState('');

  function send() {
    if (!input.trim()) return;
    const response = formatTutorResponse(getTutorResponse(input, summary?.weak[0]));
    setMessages((previous) => [...previous, `Ты: ${input}`, `Репетитор: ${response}`]);
    setInput('');
  }

  return (
    <section className="panel wide">
      <h2>Чат с репетитором</h2>
      <div className="chat-box">{messages.map((message, index) => <div className="bubble" key={index}>{message}</div>)}</div>
      <div className="chat-input">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Например: объясни дроби" />
        <Button onClick={send}>Отправить</Button>
      </div>
    </section>
  );
}
