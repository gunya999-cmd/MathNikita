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
- Ready after this change: **lessons 1–76**.
- Next locked lesson: **77 — § 21 `Площадь. Площадь прямоугольника` (обобщение и систематизация)**.
- Integrated control works: lessons **20, 33, 53, 73**.
- Lessons 62–72 and 74–76 are protected by the mature ordinary-lesson contract, including complete mandatory-practice solving.
- The cumulative ordinary-practice lane is now **280 tasks / exactly 700 response slots for lessons 62–72 and 74–76**. Lesson 73 is a source-exact control work and deliberately does not receive artificial 20-task/50-response practice.
- Lesson-specific tests do not lock arbitrary future lessons; the current unlock boundary is checked centrally in `tests/course-plan.spec.ts`.

## Lesson 76 — § 21 applied practice

- Third §21 ordinary lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified technological route: oral №3 p.141; №580, 581, 583, 590, 592; homework §21, №582, 591.
- Oral №3 is source-exact: five identical pumps move 450 l in 6 min; one pump in 8 min gives 120 l after unit-rate reasoning.
- Exact textbook applications:
  - №580 — field `500 м × 400 м`, sowing rate `260 кг/га`, compare with `5 т`; result `20 га`, `5200 кг`, shortage `200 кг`;
  - №581 — wall `4 м 50 см × 3 м`, square tile `15 см`, 30 tiles per box, 20 boxes; exactly `600` tiles required and available;
  - №583 — `180 г/м²` paint for wall `6 м × 3 м`; need `3240 г`, so `3 кг` is short by `240 г`;
  - homework №582 — greenhouse `16 м 50 см × 12 м`, yield `30 кг/м²`; area `198 м²`, harvest `5940 кг`.
- №590 uses only the verified method-guide model rather than a fabricated full statement: enumerate natural factor pairs with product 12 and count `2 см × 2 см` squares. Confirmed table: `1×12→0`, `2×6→3`, `3×4→2`, `4×3→2`, `6×2→3`, `12×1→0`.
- №592 uses only the verified method-guide conclusion: a line through the intersection of the rectangle diagonals divides it into two equal parts; the missing original diagram/text is not reconstructed.
- №591 remains an explicit homework source checkpoint because its exact wording/diagram was not recovered reliably.
- Additional curated transfer is drawn from exact nearby §21 tasks №584–587 and exact Method-guide Dictation 18, never represented as missing textbook wording.
- Mandatory practice: **20 tasks / exactly 50 response slots**.
- Persistence, retry state, Pythagoras help, analytics and completion follow the mature ordinary-lesson contract.
- Sulafat sequencing and immediate interruption on navigation are covered.
- Chromium and iPad/WebKit full-flow/practice coverage is included.

## Lessons 74–75 — § 21 foundation and reinforcement

- 74 — first §21 lesson: properties of area, unit square, square units, `S=ab`, `S=a²`, equal-area figures; route №564, 565, 566, 567, 569, 571, 572; 36/21 and 20/50. №595 and №596(1) stay source checkpoints where exact wording was unavailable.
- 75 — second §21 lesson: area-unit conversion, inverse `S=ab`, perimeter after recovering a side, equal-area decomposition; route №574, 576, 578, 589 + №596(2); 36/21 and 20/50. Missing №578/596(2) wording remains source checkpoints.

## Lesson 73 — Control work № 4

- Source: Merzlyak method guide, **Контрольная работа № 4 — `Умножение и деление натуральных чисел. Свойства умножения`, вариант 1**.
- Exact source workload: **7 tasks / 13 evaluated answer fields**.
- Primary submission is frozen in `submittedResponses`; correction can open only originally incorrect fields and never rewrites the primary score.
- Control integrity: no Pythagoras, mentor, ordinary lesson feedback or answer reveal before final submission.
- Chromium and iPad/WebKit coverage protects submission, persistence, correction and immutable primary result.

## Recent ordinary lessons

- 68 — first §19 lesson: remainder meaning/rule, route №521, 523, 525, 527; 36/21 and 20/50.
- 69 — §19 reinforcement: №528, 530, 533, 535, 541, 542 + repeat №546; no fabricated source wording.
- 70 — §19 synthesis: №531, 537, 538, 540, 543, 544 + repeat №547.
- 71 — first §20 lesson: degree `aⁿ`, base/exponent, square/cube, `a¹=a`, №548, 549, 550, 552 + №560(1–2); 36/21 and 20/50.
- 72 — §20 reinforcement: oral №3–5; №554, 556, 558; repeat №560(3–4), 562; homework №555, 557, 559 and optional №563; 36/21 and 20/50.
- 74 — first §21 lesson; 36/21 and 20/50.
- 75 — second §21 lesson; 36/21 and 20/50.
- 76 — third §21 lesson: applied resource/area problems, factor-pair search and equal halves; 36/21 and 20/50.

## Release protection after lesson 76

- Established full regression gate continues to protect lessons 1–61.
- `Course 62-76 hard certification` protects the current block:
  - build + course/source contract through 76;
  - Chromium hard runtime;
  - iPad/WebKit hard runtime;
  - complete **280-task/700-response** ordinary practice for 62–72 and 74–76;
  - Sulafat sequencing/interruption for ordinary lessons 62–72 and 74–76;
  - D1/cloud/multi-student/dashboard regression;
  - exact lesson-73 control-work runtime/integrity.
- `Course 1-76 certification` is the lesson-76 delta gate for source fidelity, full flow, mandatory practice, Chromium, iPad/WebKit and Sulafat behavior.
- Lesson 77 is the centralized locked boundary.

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
