# MathNikita Project State

Use this file as the compact handoff context for continuing development without relying on a long ChatGPT thread.

## Project

- App: MathNikita — AI math tutor web app.
- Repository: `gunya999-cmd/MathNikita`.
- Production: `https://mathnikita.gunya999.workers.dev`.
- Production branch: `main`.
- Stack: Vite + React + TypeScript, Cloudflare Worker/static assets, Cloudflare D1.
- Narration: studio Sulafat path with immediate interruption/fallback handling.

## Non-negotiable deployment invariant

`main` is the production source of truth. The production workflow builds the exact merged Git SHA, deploys Worker/assets, and polls `/api/version`. Never call a release production-ready until `Production · deployed SHA matches main` succeeds for that exact merge SHA.

## Current course checkpoint

- Official plan: **175 Merzlyak grade-5 lessons**.
- Ready after this change: **lessons 1–85**.
- Next locked lesson: **86 — § 24 `Комбинаторные задачи`**.
- Integrated control works: **20, 33, 53, 73**.
- Ordinary lessons 62–72 and 74–85 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane: **460 tasks / exactly 1150 response slots for lessons 62–72 and 74–85**; control lesson 73 remains source-exact and does not receive artificial 20/50 practice.
- The unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific runtime tests must not freeze a future locked lesson.
- Common mandatory-practice count and curated-majority tests cover ordinary lessons through **85**.

## Lesson 85 — § 24 combinatorics introduction

- First §24 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Core: systematic enumeration, the **tree of possible variants**, digit constraints, leading zero, no-repeat constraints, and the product rule for sequential choices.
- Verified route: theory **§24**; main **№645, 647, 649, 650**; repeat **№669(1,2)**; questions **1–2**; homework **№646, 648, 668**.
- Exact recovered source-aligned results:
  - №645: `11, 12, 13, 21, 22, 23, 31, 32, 33` — **9** numbers;
  - №647: `15, 24, 33, 42, 51, 60` — **6** numbers;
  - №649: **9** two-digit numbers;
  - №650: `102, 120, 201, 210` — **4** three-digit numbers;
  - №646: `40, 44, 47, 49, 70, 74, 77, 79, 90, 94, 97, 99` — **12** numbers;
  - №648: `17, 26, 35, 44, 53, 62, 71, 80` — **8** numbers;
  - №668: **20** envelope/stamp combinations;
  - №669(1,2): **12** ways to choose one girl and **15** ways to choose one boy.
- Exact wording of questions 1–2 was not recovered reliably, so they remain explicit **source checkpoints**; the app does not invent substitute wording.
- Mandatory practice: **20 tasks / exactly 50 response slots**.
- Persistence, Pythagoras help, analytics, Sulafat sequencing/interruption, Chromium and iPad/WebKit coverage are included.
- Lesson **86 remains locked** until its own source-verified release.

## Recent course sequence

- 68–70 — §19 division with remainder.
- 71–72 — §20 powers.
- 73 — source-exact Control work №4.
- 74–77 — complete §21 area sequence.
- 78–80 — complete §22 rectangular parallelepiped / nets / pyramid.
- 81–84 — complete §23 volume sequence.
- 85 — §24 systematic combinatorial enumeration.
- 86 — locked; next §24 lesson.

## CI / release protection after lesson 85

The CI architecture is deliberately impact-based to avoid re-running stable lessons on every intermediate commit.

- `Build` remains the always-on PR build/Worker dry-run.
- `Course 1-85 certification` is the focused lesson-85 delta gate: course boundary, source fidelity, full flow, 20/50 practice, Chromium, iPad/WebKit and Sulafat interruption.
- `Course 62-85 hard certification` is the cumulative release gate. On ordinary PR commits its expensive jobs are skipped; add `[hard-certify]` to the PR body only for the exact final release SHA. It also remains manually dispatchable and scheduled weekly.
- Final cumulative certification must run only on the exact branch SHA that will be merged.
- The cumulative hard gate covers:
  - build + course/source contract through 85;
  - Chromium hard runtime 62–85;
  - iPad/WebKit hard runtime 62–85;
  - complete **460-task/1150-response** practice for ordinary lessons 62–72 and 74–85;
  - Sulafat sequencing/interruption;
  - D1/cloud/multi-student/dashboard regression;
  - lesson-73 control-work integrity.
- Legacy focused checks for old lessons stay manual/weekly instead of consuming runner time on every new lesson.

## Ordinary interactive lesson quality contract

Unless the source requires a deliberate exception: about 36 meaningful stages; source fidelity before embellishment; about 21 checked main-lesson activities; mandatory practice exactly 20 tasks with at least 12 curated and no more than 8 parametric; exactly 50 response slots in the mature series; Pythagoras progressive help; persistence and analytics; Sulafat with immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

Control works are intentionally different: source-exact assessment workload, no tutoring before submission, frozen primary attempt, optional correction that cannot alter the primary score.

## Development rule

For every release: inspect exact textbook/method-guide source → implement → add/extend automated tests → open PR → require exact-head delta/hard gates → merge exact tested head → wait for Cloudflare deployment → verify exact merged SHA through `/api/version` → only then call production updated.