import { FormEvent, useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { getAllGradeOptions, getGradeCurriculum } from '../data/curriculum';
import type { StudentProfile } from '../data/profile';

export function Profile({ profile, onSave }: { profile: StudentProfile; onSave: (profile: StudentProfile) => void }) {
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const selectedCurriculum = getGradeCurriculum(draft.grade);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave(draft);
    setSaved(true);
  }

  return (
    <section className="panel narrow">
      <div className="eyebrow">Профиль ученика</div>
      <h2>{draft.name}</h2>
      <form className="form" onSubmit={submit}>
        <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Имя" />
        <label className="question compact">
          <span>Класс математики</span>
          <select value={selectedCurriculum.id} onChange={(event) => setDraft((current) => ({ ...current, grade: `${event.target.value} класс` }))}>
            {getAllGradeOptions().map((grade) => <option key={grade.id} value={grade.id}>{grade.label}</option>)}
          </select>
        </label>
        <input value={draft.goal} onChange={(event) => setDraft((current) => ({ ...current, goal: event.target.value }))} placeholder="Цель обучения" />
        <Button type="submit">Сохранить профиль</Button>
      </form>
      {saved && <div className="success-box">Профиль сохранён.</div>}
      <div className="stats profile-stats">
        <div><strong>{selectedCurriculum.label}</strong><span>{selectedCurriculum.focus}</span></div>
        <div><strong>{selectedCurriculum.units.length}</strong><span>{selectedCurriculum.units.join(' · ')}</span></div>
        <div><strong>{profile.solvedTasks}</strong><span>решённых задач</span></div>
        <div><strong>{profile.streakDays}</strong><span>дней подряд</span></div>
      </div>
    </section>
  );
}
