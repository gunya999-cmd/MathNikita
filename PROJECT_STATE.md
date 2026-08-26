# MathNikita Project State

Use this file as the compact handoff context for continuing development without relying on a long ChatGPT thread.

## Project

- App: MathNikita — AI math tutor web app.
- Repository: `gunya999-cmd/MathNikita`
- Production URL: `https://mathnikita.gunya999.workers.dev`
- Production branch: `main`.
- Deployment: GitHub `main` -> Cloudflare Worker + static assets.
- Hosting rule: Cloudflare-first only. Do not move production hosting unless explicitly requested.
- Build command: `npm run build`.
- Deploy command: `npm run cf:deploy` or `npx wrangler deploy`.

## Stack

- Frontend: Vite + React + TypeScript.
- Backend: Cloudflare Worker with static assets and API routes.
- Auth/DB: Cloudflare D1 student/profile/progress flow; legacy Supabase-related code/config may still exist and must not be treated as the source of truth without checking current code.
- AI tutor: Gemini primary with local fallback; OpenAI is optional backup.
- Narration: studio narration path with Sulafat plus interruption/fallback handling.

## Production/deployment invariants

- `main` is the source of truth for production.
- `wrangler.jsonc` is the source of truth for Worker/static asset routing.
- `/api/*` must continue to run through the Worker via `run_worker_first`.
- Production deploy workflow builds the exact merged Git SHA, deploys it to Cloudflare, then checks `/api/version` until the deployed SHA equals `main`.
- Never claim production is updated until the `/api/version` verification job succeeds.

## Current course checkpoint

- Official year plan: 175 lessons, Merzlyak grade 5.
- Ready course sequence after this change: lessons **1–69**.
- Lesson 70 stays locked and is the next course item; it is the final § 19 `Деление с остатком` lesson and must be implemented from the exact lesson-70 method-guide route as an obобщение/systematization lesson.
- Control works 1–3 are integrated at lessons 20, 33 and 53.
- Current release protection is split into:
  - the established full regression gate protecting lessons 1–61;
  - the cumulative hard gate protecting lessons 62–69, including full runtime, Chromium, iPad WebKit, Sulafat sequencing/interruption, cloud/D1 regression and complete mandatory-practice solving;
  - a lesson-69 delta gate covering build/content, full-flow, Chromium, iPad WebKit, Sulafat interruption and the complete 20-task / 50-response mandatory-practice run.
- The cumulative 62–69 practice lane solves 160 mandatory tasks / exactly 400 response slots.
- Lesson-specific regression tests do not lock arbitrary future lessons; current unlock state is checked centrally in `course-plan.spec.ts`.

## Recent completed lessons

- Lesson 53 — `Контрольная работа № 3`.
- Lesson 54 — `Умножение. Переместительное свойство умножения`.
- Lesson 55 — multiplication practice / round factors.
- Lesson 56 — `Письменное умножение на однозначное число`.
- Lesson 57 — `Итоговая практика умножения`.
- Lesson 58 — `Сочетательное свойство умножения`.
- Lesson 59 — `Распределительное свойство умножения`.
- Lesson 60 — `Стратегии свойств умножения`.
- Lesson 61 — `Смысл деления`, §18, №447–453; 36 stages, 21 checked activities, 20 mandatory-practice tasks / 50 responses.
- Lesson 62 — `Деление: вычисления и задачи`, §18 reinforcement based on the official lesson-62 methodology map. Main textbook route: №452, 455, 465, 466, 468, 470; homework/transfer practice uses №453, 456, 467, 469, 471. It has 36 stages, 21 checked activities and 20 mandatory-practice tasks / exactly 50 responses. It covers round divisors, order of operations, inverse checking, proportional word problems, current/river motion and meeting motion.
- Lesson 63 — `Деление: текстовые задачи арифметическим способом`, §18, based on the official lesson-63 method guide and textbook tasks №454, 472, 474, 476, 478, 480. It has 36 meaningful stages, 21 checked activities and 20 curated mandatory-practice tasks / exactly 50 responses. The route covers meeting motion, different start times, catch-up motion, S=v·t relations, unit conversion, schedules/time-of-day, inverse checking and semantic validation of intermediate quantities.
- Lesson 64 — `Деление: решение уравнений`, §18, based on the official lesson-64 method guide. It teaches the links between unknown factor, dividend and divisor using the textbook examples `12x=84`, `x:21=16`, `576:x=18`, then completes exercises №457–458 and transfers the same reasoning to №459–460. It has 36 meaningful stages, 21 checked activities and 20 curated mandatory-practice tasks / exactly 50 responses, with root verification by substitution.
- Lesson 65 — `Деление: комплексное закрепление`, §18, based on the official lesson-65 method guide route: №461 (2), 483, 491 (3–4), 499, 501, 512 plus repeat №519. The interactive route uses exact source wording where the uploaded textbook text was recoverable and explicitly treats partially retrieved exercises as method-guide checkpoints rather than inventing missing wording. It has 36 meaningful stages, 21 checked activities and 20 curated mandatory-practice tasks / exactly 50 responses.
- Lesson 66 — `Деление: уравнения и составные задачи`, §18, based on the official lesson-66 method guide route: №461 (3), 485, 493, 503, 505, 513, 515 plus repeat №520; homework transfer №462 (3), 486, 494, 504, 506, 514, 516. It has 36 meaningful stages, 21 checked activities and 20 curated mandatory-practice tasks / exactly 50 responses. Missing source wording is not fabricated.
- Lesson 67 — `Деление: итоговое обобщение`, final lesson of §18, based on the official lesson-67 method guide: oral №510; consolidation №487, 497, 507, 509, 517; homework transfer №488, 498, 508, 511. It has 36 meaningful stages, 21 checked activities and 20 curated mandatory-practice tasks / exactly 50 responses. The lesson closes §18 and deliberately does not pre-teach remainder division from §19.
- Lesson 68 — `Деление с остатком: смысл и правило`, first lesson of §19 and a new-material lesson. It follows the verified method-guide route: theory §19; main consolidation №521, 523, 525, 527; repeat №545 (1–2); homework transfer №522, 524, 526. It has 36 meaningful stages, 21 checked activities and 20 curated mandatory-practice tasks / exactly 50 responses. Core concepts are the incomplete quotient, remainder, `a = b·q + r`, the invariant `0 ≤ r < b`, exact division as `r=0`, and the case `a<b` as `q=0, r=a`.
- Lesson 69 — `Деление с остатком: задачи и закономерности`, second lesson of §19 and a reinforcement lesson. It follows the verified method-guide route: oral №2–3 on p.132; main №528, 530, 533, 535, 541, 542; repeat №546; homework transfer №529, 534, 536. It has 36 meaningful stages, 21 checked activities and 20 curated mandatory-practice tasks / exactly 50 responses. Core skills are interpreting whether the answer is `q`, `r` or `q+1`, restoring components through `a=b·q+r`, finding minimal natural values and residue patterns, calendar reasoning and the `a<b` boundary case. The incompletely retrieved №530 table remains an explicit textbook checkpoint; structural training rows are labelled as such instead of fabricating source wording.

## Lesson quality contract

For normal interactive lessons, preserve the established release standard unless the source material requires a deliberate exception:

- about 36 meaningful learning stages, not filler;
- textbook/method-guide fidelity first;
- interactive checked activities embedded in the main lesson;
- mandatory practice: exactly 20 tasks, with at least 12 curated tasks and no more than 8 parametric tasks;
- for the current mature lesson series, keep the 50-response practice contract;
- Pythagoras progressive help, persistence and learner analytics;
- Sulafat narration and immediate cancellation of stale narration when the learner navigates forward/back/jumps to another stage;
- Chromium and iPad/WebKit full-flow/regression coverage;
- do not unlock the next lesson until the current lesson is implemented and release-tested.

## Working platform status

- Cloudflare deployment workflow is active.
- D1-backed student authentication/profile/progress flows have production regression coverage.
- Multi-student isolation and learner/parent dashboards have automated regression coverage.
- Gemini tutor endpoint and local fallback exist in the Worker flow.
- Voice sequencing/interruption is protected by automated tests.

## Development rule for future ChatGPT work

- Use this file as the handoff checkpoint instead of relying on a long conversation.
- Keep GitHub commits small and inspect CI failures rather than guessing.
- For each completed lesson: implement -> add/extend tests -> open PR -> pass release gates -> merge to `main` -> allow Cloudflare deploy -> verify exact production SHA through `/api/version`.
- After completion, update this checkpoint to the newly ready lesson and identify the next locked lesson.
- Keep production on Cloudflare by default.
