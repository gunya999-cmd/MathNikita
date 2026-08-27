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
- Ready after this change: **lessons 1–78**.
- Next locked lesson: **79 — § 22 `Прямоугольный параллелепипед. Пирамида` (закрепление)**.
- Integrated control works: lessons **20, 33, 53, 73**.
- Lessons 62–72 and 74–78 are protected by the mature ordinary-lesson contract, including complete mandatory-practice solving.
- The cumulative ordinary-practice lane is now **320 tasks / exactly 800 response slots for lessons 62–72 and 74–78**. Lesson 73 is a source-exact control work and deliberately does not receive artificial 20-task/50-response practice.
- The current unlock boundary is checked centrally in `tests/course-plan.spec.ts`; lesson-specific runtime tests must not freeze an obsolete future boundary.

## Lesson 78 — § 22 rectangular parallelepiped foundations

- First §22 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified technological route: oral №1–2 p.150; theory §22 pp.145–146; №598, 599, 602; repeat №612; questions 1–12; homework §22, №600, 601, 603.
- Exact theory establishes:
  - **6 rectangular faces, 12 edges, 8 vertices**;
  - three pairs of equal opposite faces;
  - three measurements: length, width and height;
  - surface area as the sum of six face areas, represented as `Sпов = 2(ab + bc + ac)`;
  - cube as a rectangular parallelepiped with all three measurements equal and six equal square faces.
- Exact oral warm-up:
  - `13·4·25=1300`;
  - `4·5·78·5=7800`;
  - `125·943·8=943000`;
  - `3a·16b=48ab`, `4m·9n·5k=180mnk`, `7a·2b·50c·8d=5600abcd`.
- №598 remains dependent on the original textbook figure 169; the app does not invent or approximately redraw its lettered spatial diagram.
- №599 uses exact dimensions `9 см × 5 см × 6 см`: sum of all edges `80 см`, surface area `258 см²`.
- №602 uses a cube with edge `5 см`: one face `25 см²`, total surface `150 см²`, sum of edges `60 см`.
- Homework transfer is exact for №600 (`13,16,21 см`), №601 (`9,24,11 м`) and №603 (cube edge `7 см`).
- №612 remains an explicit source checkpoint because its full wording was not reliably recovered.
- Method-guide Dictation 19 provides independent checks, including a cube built from 64 unit cubes (`4 см` edge), wireframe `2×4×5` (`44 см`) and surface `10×20×30` (`2200 см²`).
- Mandatory practice: **20 tasks / exactly 50 response slots**.
- Persistence, retry state, Pythagoras help, analytics and completion follow the mature ordinary-lesson contract.
- Sulafat sequencing and immediate interruption on navigation are covered.
- Chromium and iPad/WebKit full-flow/practice coverage is included.

## Lesson 77 — § 21 synthesis

- Fourth and final §21 ordinary lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified technological route: oral №4 p.142; №584, 586, 587, 593, 594; repeat №597.
- Exact textbook material is used for №584–587; method-guide Dictation 18 supplies independent synthesis checks.
- Oral №4, №593 and №597 remain source checkpoints where the complete source was not reliably recovered.
- №594 uses only the verified author indication `25=3²+4²`, while `36` cannot be represented as the sum of squares of two positive natural numbers.
- Mandatory practice: **20 tasks / exactly 50 response slots**.
- §21 is complete after lesson 77.

## Lessons 74–76 — § 21

- 74 — foundations: properties of area, unit square, square units, `S=ab`, `S=a²`, equal-area figures; 36/21 and 20/50.
- 75 — area-unit conversion, inverse `S=ab`, perimeter after recovering a side, equal-area decomposition; 36/21 and 20/50.
- 76 — applied area/resource problems, factor-pair search and equal halves; 36/21 and 20/50.

## Lesson 73 — Control work № 4

- Source: Merzlyak method guide, **Контрольная работа № 4 — `Умножение и деление натуральных чисел. Свойства умножения`, вариант 1**.
- Exact source workload: **7 tasks / 13 evaluated answer fields**.
- Primary submission is frozen in `submittedResponses`; correction can open only originally incorrect fields and never rewrites the primary score.
- Control integrity: no Pythagoras, mentor, ordinary lesson feedback or answer reveal before final submission.

## Recent ordinary lessons

- 68 — first §19 lesson: remainder meaning/rule; 36/21 and 20/50.
- 69 — §19 reinforcement; 36/21 and 20/50.
- 70 — §19 synthesis; 36/21 and 20/50.
- 71 — first §20 lesson: degree `aⁿ`, base/exponent, square/cube; 36/21 and 20/50.
- 72 — §20 reinforcement; 36/21 and 20/50.
- 74–77 — complete §21 sequence; each ordinary lesson 36/21 and 20/50.
- 78 — first §22 lesson: rectangular parallelepiped and cube foundations; 36/21 and 20/50.

## Release protection after lesson 78

- Established full regression gate continues to protect lessons 1–61.
- `Course 62-78 hard certification` protects the current block:
  - build + course/source contract through 78;
  - Chromium hard runtime;
  - iPad/WebKit hard runtime;
  - complete **320-task/800-response** ordinary practice for 62–72 and 74–78;
  - Sulafat sequencing/interruption for ordinary lessons 62–72 and 74–78;
  - D1/cloud/multi-student/dashboard regression;
  - exact lesson-73 control-work integrity.
- `Course 1-78 certification` is the lesson-78 delta gate for source fidelity, full flow, mandatory practice, Chromium, iPad/WebKit and Sulafat behavior.
- Lesson 79 is the centralized locked boundary.

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
