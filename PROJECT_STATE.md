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
- Ready after this change: **lessons 1–84**.
- Next locked lesson: **85 — § 24 `Комбинаторные задачи`**.
- Integrated control works: **20, 33, 53, 73**.
- Lessons 62–72 and 74–84 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane: **440 tasks / exactly 1100 response slots for lessons 62–72 and 74–84**; control lesson 73 remains source-exact and does not receive artificial 20/50 practice.
- The unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific runtime tests must not freeze a future locked lesson.
- Common mandatory-practice count and curated-majority tests cover ordinary lessons through **84**.

## Lesson 84 — § 23 volume synthesis

- Fourth and final §23 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Type: **generalization and systematization of knowledge**.
- Verified technological route: oral **№3 p.156**; control/correction **workbook №154, 157**; generalization **№635, 636, 638, 639, 640** plus workbook **№293–295**; repeat **№643(5,6)**; homework **§23, №637** plus didactic **№153, 155**.
- Exact source-aligned results used in the lesson:
  - oral №3: wire frame for 3×5×6 cm parallelepiped — **56 cm**;
  - №635: surface-area scale **16×**, volume scale **64×** when the cube edge is 4×;
  - №636: volume changes **40×** and **2×**;
  - №638: 1,000,000 l over 1 ha gives depth **10 cm**, so a swimming competition cannot be held;
  - №639: three intersecting 1×1 through-holes in a 3 cm cube remove **7 cm³**, leaving **20 cm³**;
  - №640: initial volume **288 cm³**, remaining **36 cm³**, used **252 cm³**, daily use **18 cm³**, remainder lasts **2 days**;
  - №637: volume changes **8×** in part 1 and **does not change** in part 2.
- Workbook/didactic tasks and №643(5,6) remain explicit source checkpoints where full wording was not recovered reliably; the app does not invent substitute conditions.
- Mandatory practice: **20 tasks / exactly 50 response slots**.
- Persistence, Pythagoras help, analytics, Sulafat sequencing/interruption, Chromium and iPad/WebKit coverage are included.
- **§23 is complete after lesson 84.**

## Lesson 83 — § 23 volume reinforcement

- Third §23 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Route: oral **№4 p.156**; **№626, 630, 633, 634**; repeat **№644**; homework **№627, 631, 643(3,4)**.
- Exact results include №626 height **5 cm**; №633 **72 m³**, **9 m³/h**, **300 workers**; №634 cube volume and surface area **216**.
- Mandatory practice: **20 tasks / 50 response slots**.

## Lesson 82 — § 23 volume formulas

- Second §23 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Route: oral №1 p.156; theory §23 pp.155–156; №619, 620, 624, 628, 632; repeat №642; homework questions 5–7, №621, 625, 629.
- Core: `V=abc`, `V=a³`, `V=Sh`, inverse relations and unit alignment.
- Mandatory practice: **20/50**.

## Lesson 81 — § 23 volume figure

- First §23 lesson; **36 meaningful stages / 21 checked main-lesson actions**, mandatory practice **20/50**.
- Route: oral №2 p.156; theory §23 pp.153–154; №617, 618, 622; repeat №643(1,2); homework questions 1–4, №623, 641.
- Core: meaning/properties of volume, unit cube and cubic units.
- Lesson 81 intentionally stops before `V=abc`; lesson 82 introduces that formula.

## Recent course sequence

- 68–70 — §19 division with remainder.
- 71–72 — §20 powers.
- 73 — source-exact Control work №4.
- 74–77 — complete §21 area sequence; every ordinary lesson 36/21 and 20/50.
- 78–80 — complete §22 rectangular parallelepiped / nets / pyramid.
- 81 — §23 meaning of volume.
- 82 — §23 volume formulas.
- 83 — §23 inverse, composite and applied volume problems.
- 84 — §23 final synthesis; §23 complete.
- 85 — locked; starts §24 combinatorial problems.

## CI / release protection after lesson 84

The CI architecture is deliberately impact-based to avoid re-running stable lessons on every intermediate commit.

- `Build` remains the always-on PR build/Worker dry-run.
- `Course 1-84 certification` is the focused lesson-84 delta gate: course boundary, source fidelity, full flow, 20/50 practice, Chromium, iPad/WebKit and Sulafat interruption.
- `Course 62-84 hard certification` is the cumulative release gate. On ordinary PR commits its expensive jobs are skipped; add `[hard-certify]` to the PR body only for the exact final release SHA. It also remains manually dispatchable and scheduled weekly.
- Final cumulative certification must run only on the exact branch SHA that will be merged.
- The cumulative hard gate covers:
  - build + course/source contract through 84;
  - Chromium hard runtime 62–84;
  - iPad/WebKit hard runtime 62–84;
  - complete **440-task/1100-response** practice for ordinary lessons 62–72 and 74–84;
  - Sulafat sequencing/interruption;
  - D1/cloud/multi-student/dashboard regression;
  - lesson-73 control-work integrity.
- Legacy focused checks for old lessons stay manual/weekly instead of consuming runner time on every new lesson.

## Ordinary interactive lesson quality contract

Unless the source requires a deliberate exception: about 36 meaningful stages; source fidelity before embellishment; about 21 checked main-lesson activities; mandatory practice exactly 20 tasks with at least 12 curated and no more than 8 parametric; exactly 50 response slots in the mature series; Pythagoras progressive help; persistence and analytics; Sulafat with immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

Control works are intentionally different: source-exact assessment workload, no tutoring before submission, frozen primary attempt, optional correction that cannot alter the primary score.

## Development rule

For every release: inspect exact textbook/method-guide source → implement → add/extend automated tests → open PR → require exact-head delta/hard gates → merge exact tested head → wait for Cloudflare deployment → verify exact merged SHA through `/api/version` → only then call production updated.
