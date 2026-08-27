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
- Ready after this change: **lessons 1–75**.
- Next locked lesson: **76 — § 21 `Площадь. Площадь прямоугольника` (дальнейшее закрепление)**.
- Integrated control works: lessons **20, 33, 53, 73**.
- Lessons 62–72 and 74–75 are protected by the mature ordinary-lesson contract, including complete mandatory-practice solving.
- The cumulative ordinary-practice lane is now **260 tasks / exactly 650 response slots for lessons 62–72 and 74–75**. Lesson 73 is a source-exact control work and deliberately does not receive artificial 20-task/50-response practice.
- Lesson-specific tests do not lock arbitrary future lessons; the current unlock boundary is checked centrally in `tests/course-plan.spec.ts`.

## Lesson 75 — § 21 reinforcement

- Second §21 ordinary lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified technological route: oral №2 p.141; №574, 576, 578, 589; repeat №596(2); homework §21, №575, 577, 579.
- Exact recovered material is used for №574–576: area-unit conversions and the field problem with `S=56 а`, length `80 м`, width `70 м`, perimeter `300 м`.
- Method-guide Dictation 18 provides additional exact §21 checks for mixed units, square area/perimeter, `1 га`, `4 а`, `2 дм² 4 см²`, and a `40 м × 25 м` plot.
- №578 and №596(2) remain explicit source checkpoints where full wording was not recovered reliably. №589 uses only the verified methodological idea: the compared figures are decomposed into four correspondingly equal triangles; no missing diagram/text is fabricated.
- Homework №575 is represented from exact recovered textbook data. №577 and the diagram-dependent №579 remain source checkpoints where needed.
- Mandatory practice: **20 tasks / exactly 50 response slots**, curated from verified №574–576, №575 and Dictation 18 rather than invented textbook wording.
- Persistence, retry state, Pythagoras help, analytics and completion follow the mature ordinary-lesson contract.
- Sulafat sequencing and immediate interruption on navigation are covered.
- Chromium and iPad/WebKit full-flow/practice coverage is included.

## Lesson 74 — § 21 `Площадь. Площадь прямоугольника`

- First §21 ordinary lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Exact route from the technological map: oral №1 p.141; §21 theory; №564, 565, 566, 567, 569, 571, 572; repeat №595; questions 1–7; homework §21, №568, 570, 573 and №596(1).
- Core concepts: properties of area, unit square, square units, equal vs equal-area figures, rectangle formula `S=ab`, square formula `S=a²`, and the requirement to express side lengths in the same units before multiplication.
- №595 and №596(1) remain explicit source checkpoints where exact wording was not recovered reliably; no fabricated replacement wording is introduced.
- Mandatory practice: **20 tasks / exactly 50 response slots**.

## Lesson 73 — Control work № 4

- Source: Merzlyak method guide, **Контрольная работа № 4 — `Умножение и деление натуральных чисел. Свойства умножения`, вариант 1**.
- Exact source workload: **7 tasks / 13 evaluated answer fields**.
- Primary submission is frozen in `submittedResponses`; correction can open only originally incorrect fields and never rewrites the primary score.
- Control integrity: no Pythagoras, mentor, ordinary lesson feedback or answer reveal before final submission.
- Chromium and iPad/WebKit coverage protects submission, persistence, correction and immutable primary result.

## Recent ordinary lessons

- 68 — first §19 lesson: remainder meaning/rule, route №521, 523, 525, 527; 36 stages / 21 checks / 20 tasks / 50 responses.
- 69 — §19 reinforcement: №528, 530, 533, 535, 541, 542 + repeat №546; no fabricated source wording.
- 70 — §19 synthesis: №531, 537, 538, 540, 543, 544 + repeat №547; no fabricated oral №6 wording.
- 71 — first §20 lesson: degree `aⁿ`, base/exponent, square/cube, `a¹=a`, №548, 549, 550, 552 + №560(1–2); 36/21 and 20/50.
- 72 — §20 reinforcement: oral №3–5; №554, 556, 558; repeat №560(3–4), 562; homework №555, 557, 559 and optional №563; 36/21 and 20/50.
- 74 — first §21 lesson: area meaning/properties, square units, `S=ab`, `S=a²`, equal-area figures; route №564, 565, 566, 567, 569, 571, 572; 36/21 and 20/50.
- 75 — §21 reinforcement: area-unit conversions, inverse `S=ab`, perimeter after restoring a side, equal-area decomposition; route №574, 576, 578, 589 + №596(2); 36/21 and 20/50.

## Release protection after lesson 75

- Established full regression gate continues to protect lessons 1–61.
- `Course 62-75 hard certification` protects the current block:
  - build + course/source contract through 75;
  - Chromium hard runtime;
  - iPad/WebKit hard runtime;
  - complete **260-task/650-response** ordinary practice for 62–72 and 74–75;
  - Sulafat sequencing/interruption for ordinary lessons 62–72 and 74–75;
  - D1/cloud/multi-student/dashboard regression;
  - exact lesson-73 control-work runtime/integrity.
- `Course 1-75 certification` is the lesson-75 delta gate for source fidelity, full flow, mandatory practice, Chromium, iPad/WebKit and Sulafat behavior.
- Lesson 76 is the centralized locked boundary.

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
