# MathNikita Project State

Use this file as the compact handoff context for continuing development without relying on a long ChatGPT thread.

## Project

- App: MathNikita — AI math tutor web app.
- Repository: `gunya999-cmd/MathNikita`.
- Production: `https://mathnikita.gunya999.workers.dev`.
- Production branch: `main`.
- Stack: Vite + React + TypeScript, Cloudflare Worker/static assets, Cloudflare D1 for student/profile/progress data.
- AI tutor: Gemini primary with local fallback; OpenAI optional backup.
- Narration: studio Sulafat path with interruption/fallback handling.

## Non-negotiable deployment invariant

`main` is the production source of truth. The production workflow builds the exact merged Git SHA, deploys Worker/assets, and polls `/api/version`. Never claim a release is in production until `Production · deployed SHA matches main` succeeds for that exact merge SHA.

## Current course checkpoint

- Official plan: 175 Merzlyak grade-5 lessons.
- Ready after this change: **lessons 1–73**.
- Next locked lesson: **74 — § 21 `Площадь. Площадь прямоугольника`**.
- Integrated control works: lessons **20, 33, 53, 73**.
- Lessons 62–72 remain protected by the mature ordinary-lesson contract, including complete mandatory-practice solving.
- The cumulative ordinary-practice lane remains **220 tasks / exactly 550 response slots for lessons 62–72**. Lesson 73 is a source-exact control work and deliberately does not receive artificial 20-task/50-response practice.
- Lesson-specific tests do not lock arbitrary future lessons; the current unlock boundary is checked centrally in `tests/course-plan.spec.ts`.

## Lesson 73 — Control work № 4

- Source: Merzlyak method guide, **Контрольная работа № 4 — `Умножение и деление натуральных чисел. Свойства умножения`, вариант 1**.
- Exact source workload: **7 tasks / 13 evaluated answer fields**.
- Task 1: `36 · 2418`, `175 · 204`, `1456 : 28`, `177 000 : 120`.
- Task 2: `(326 · 48 − 9 587) : 29`.
- Task 3: `x · 14 = 364`, `324 : x = 9`, `19x − 12x = 126`.
- Task 4: `25 · 79 · 4`, `43 · 89 + 89 · 57`, using multiplication properties efficiently.
- Task 5: 7 kg candies + 9 kg cookies for 1,200 rubles; candies 120 rubles/kg; find cookie price/kg.
- Task 6: two trains from one station in one direction at 56 and 64 km/h; distance after 6 h.
- Task 7: number of trailing zeros in the product of all natural numbers from 19 through 35.
- Exact answers: `87048`, `35700`, `52`, `1475`, `209`, `26`, `36`, `18`, `7900`, `8900`, `40`, `48`, `5`.
- Control integrity: no Pythagoras, mentor, ordinary lesson feedback or answer reveal before final submission.
- Learner may revise any response before submission.
- On submission, `submittedResponses` freezes the primary attempt. The primary score is immutable.
- Correction mode opens only originally incorrect fields; successful correction never rewrites the primary score.
- Control progress/completion persists locally and emits the normal lesson-completed event.
- Chromium and iPad/WebKit full-flow tests cover correct submission, persistence, one-error correction and immutable primary result.

## Recent ordinary lessons

- 68 — first §19 lesson: remainder meaning/rule, route №521, 523, 525, 527; 36 stages / 21 checks / 20 tasks / 50 responses.
- 69 — §19 reinforcement: №528, 530, 533, 535, 541, 542 + repeat №546; no fabricated source wording.
- 70 — §19 synthesis: №531, 537, 538, 540, 543, 544 + repeat №547; no fabricated oral №6 wording.
- 71 — first §20 lesson: degree `aⁿ`, base/exponent, square/cube, `a¹=a`, №548, 549, 550, 552 + №560(1–2); 36/21 and 20/50.
- 72 — §20 reinforcement: oral №3–5; №554, 556, 558; repeat №560(3–4), 562; homework №555, 557, 559 and optional №563; 36/21 and 20/50. Optional №563 is not reconstructed where exact wording was unavailable.

## Release protection after lesson 73

- Established full regression gate continues to protect lessons 1–61.
- `Course 62-73 hard certification` protects the current block:
  - build + course/source contract through 73;
  - Chromium hard runtime;
  - iPad/WebKit hard runtime;
  - complete 220-task/550-response ordinary practice for 62–72;
  - Sulafat sequencing/interruption for ordinary lessons 62–72;
  - D1/cloud/multi-student/dashboard regression;
  - exact lesson-73 control-work runtime/integrity.
- `Course 1-73 certification` is the lesson-73 delta gate for source contract, Chromium and iPad/WebKit control runtime.

## Ordinary interactive lesson quality contract

Unless the source requires a deliberate exception:

- about 36 meaningful stages;
- source fidelity before embellishment;
- about 21 checked main-lesson activities in the mature series;
- mandatory practice exactly 20 tasks, at least 12 curated and no more than 8 parametric;
- exactly 50 response slots in the current mature series;
- Pythagoras progressive help, persistence and analytics;
- Sulafat narration with immediate cancellation of stale narration on navigation;
- Chromium + iPad/WebKit release coverage.

Control works are intentionally different: source-exact assessment workload, no tutoring before submission, frozen primary attempt, and optional correction that cannot alter the primary score.

## Development rule

For every next release: inspect exact textbook/method-guide source -> implement -> add/extend automated tests -> open PR -> require delta/hard gates -> merge exact tested head -> wait for Cloudflare deployment -> verify exact merged SHA through `/api/version` -> only then call production updated.
