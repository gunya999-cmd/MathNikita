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
- Ready after this change: **lessons 1–77**.
- Next locked lesson: **78 — § 22 `Прямоугольный параллелепипед. Пирамида`**.
- Integrated control works: lessons **20, 33, 53, 73**.
- Lessons 62–72 and 74–77 are protected by the mature ordinary-lesson contract, including complete mandatory-practice solving.
- The cumulative ordinary-practice lane is now **300 tasks / exactly 750 response slots for lessons 62–72 and 74–77**. Lesson 73 is a source-exact control work and deliberately does not receive artificial 20-task/50-response practice.
- Lesson-specific tests do not lock arbitrary future lessons; the current unlock boundary is checked centrally in `tests/course-plan.spec.ts`.

## Lesson 77 — § 21 synthesis

- Fourth and final §21 ordinary lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified technological route: oral №4 p.142; №584, 586, 587, 593, 594; repeat №597.
- Exact textbook material is used for №584–587:
  - №584 — square side `12 см` is equal-area with a rectangle length `18 см`; rectangle width `8 см`, perimeter `52 см`;
  - №585 is exact adjacent transfer: rectangle `3 см × 12 см` is equal-area with a square; square side `6 см`, perimeter `24 см`;
  - №586 — width `26 см`, length increased by `4 см`; area increases by `104 см²`;
  - №587 — increasing each side by factor `4` multiplies perimeter by `4` and area by `16`.
- Method-guide Dictation 18 provides exact independent synthesis checks for rectangle/square formulas, area units and true/false properties of area.
- Oral №4 p.142, №593 and №597 remain explicit source checkpoints because their full wording/diagram was not recovered reliably.
- №594 uses only the verified author indication: `25=3²+4²`, while `36` cannot be represented as the sum of squares of two positive natural numbers. The missing original drawing/statement is not reconstructed.
- Mandatory practice: **20 tasks / exactly 50 response slots**, curated from verified §21 material rather than invented textbook wording.
- Persistence, retry state, Pythagoras help, analytics and completion follow the mature ordinary-lesson contract.
- Sulafat sequencing and immediate interruption on navigation are covered.
- Chromium and iPad/WebKit full-flow/practice coverage is included.
- §21 is complete after lesson 77.

## Lesson 76 — § 21 applied practice

- Third §21 ordinary lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified route: oral №3 p.141; №580, 581, 583, 590, 592; homework §21, №582, 591.
- Exact applied tasks cover field seeding, wall tiles, paint consumption and greenhouse yield.
- №590 uses the verified factor-pair/table model; №592 uses only the verified equal-halves conclusion; №591 remains a source checkpoint.
- Mandatory practice: **20 tasks / exactly 50 response slots**.

## Lessons 74–75 — § 21 foundation and reinforcement

- 74 — first §21 lesson: properties of area, unit square, square units, `S=ab`, `S=a²`, equal-area figures; route №564, 565, 566, 567, 569, 571, 572; 36/21 and 20/50.
- 75 — second §21 lesson: area-unit conversion, inverse `S=ab`, perimeter after recovering a side, equal-area decomposition; route №574, 576, 578, 589 + №596(2); 36/21 and 20/50.

## Lesson 73 — Control work № 4

- Source: Merzlyak method guide, **Контрольная работа № 4 — `Умножение и деление натуральных чисел. Свойства умножения`, вариант 1**.
- Exact source workload: **7 tasks / 13 evaluated answer fields**.
- Primary submission is frozen in `submittedResponses`; correction can open only originally incorrect fields and never rewrites the primary score.
- Control integrity: no Pythagoras, mentor, ordinary lesson feedback or answer reveal before final submission.
- Chromium and iPad/WebKit coverage protects submission, persistence, correction and immutable primary result.

## Recent ordinary lessons

- 68 — first §19 lesson: remainder meaning/rule, route №521, 523, 525, 527; 36/21 and 20/50.
- 69 — §19 reinforcement: №528, 530, 533, 535, 541, 542 + repeat №546.
- 70 — §19 synthesis: №531, 537, 538, 540, 543, 544 + repeat №547.
- 71 — first §20 lesson: degree `aⁿ`, base/exponent, square/cube, `a¹=a`, №548, 549, 550, 552 + №560(1–2); 36/21 and 20/50.
- 72 — §20 reinforcement: oral №3–5; №554, 556, 558; repeat №560(3–4), 562; 36/21 and 20/50.
- 74 — first §21 lesson; 36/21 and 20/50.
- 75 — second §21 lesson; 36/21 and 20/50.
- 76 — third §21 lesson; 36/21 and 20/50.
- 77 — final §21 synthesis; 36/21 and 20/50.

## Release protection after lesson 77

- Established full regression gate continues to protect lessons 1–61.
- `Course 62-77 hard certification` protects the current block:
  - build + course/source contract through 77;
  - Chromium hard runtime;
  - iPad/WebKit hard runtime;
  - complete **300-task/750-response** ordinary practice for 62–72 and 74–77;
  - Sulafat sequencing/interruption for ordinary lessons 62–72 and 74–77;
  - D1/cloud/multi-student/dashboard regression;
  - exact lesson-73 control-work runtime/integrity.
- `Course 1-77 certification` is the lesson-77 delta gate for source fidelity, full flow, mandatory practice, Chromium, iPad/WebKit and Sulafat behavior.
- Lesson 78 is the centralized locked boundary and starts §22.

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
