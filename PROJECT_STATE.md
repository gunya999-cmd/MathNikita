# MathNikita Project State

## Project
- App: MathNikita — AI math tutor web app.
- Repository: `gunya999-cmd/MathNikita`.
- Production: `https://mathnikita.gunya999.workers.dev`.
- Production branch: `main`.
- Stack: Vite + React + TypeScript, Cloudflare Worker/static assets, Cloudflare D1.
- Narration: studio Sulafat path with immediate interruption/fallback handling.

## Non-negotiable deployment invariant
`main` is the production source of truth. A lesson is production-ready only after exact-head delta + cumulative hard certification, merge of that exact tested head, Cloudflare deployment, and `Production · deployed SHA matches main` for the merge SHA.

## Current course checkpoint
- Official plan: **175 Merzlyak grade-5 lessons**.
- Ready after this change: **lessons 1–86**.
- Next locked lesson: **87 — §24 `Комбинаторные задачи`**.
- Integrated control works: **20, 33, 53, 73**.
- Ordinary lessons 62–72 and 74–86 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane: **480 tasks / exactly 1200 response slots**; control lesson 73 remains source-exact.
- Unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific tests must not freeze future availability.

## Lesson 86 — §24 combinatorics reinforcement
- Second §24 lesson; **36 meaningful stages / 21 checked main actions**.
- Type: consolidation/reinforcement.
- Verified route: oral **№2–3 p.163**; workbook **№160, 161**; textbook **№651, 653, 655, 656, 658**; workbook **№299, 301, 303, 305**; repeat **№670**; homework **№652, 654, 657, 671** plus workbook **№159, 162**.
- Exact source-aligned results used:
  - oral №2: **5·6·8=240 → option 2**;
  - oral №3: **16·8=128 m³**;
  - №651: **8** numbers from 1/2 and **4** numbers from 0/1 because leading zero is forbidden for a three-digit number;
  - №653: **67, 68, 69, 78, 79, 89 → 6**;
  - №655: **14, 23, 32, 41, 50 → 5**;
  - №656: even digit sum with 1,2,3,4 gives **8** numbers;
  - №658: two-position code from 0,1,2,3 allows leading zero, so **16** codes;
  - №670: answers **15** and **13**;
  - №671: **1872 l**, **47** forty-litre cans required, so 42 are short by **5**;
  - homework №652: **12**; №654: **6**; №657: **6**.
- Workbook items without reliably recovered wording remain explicit source checkpoints; no invented textbook wording.
- Mandatory practice: **20 tasks / exactly 50 responses**.
- Persistence, Pythagoras help, analytics, Sulafat interruption, Chromium and iPad/WebKit coverage included.

## Lesson 85 — §24 introduction
- First §24 lesson; **36/21**, mandatory practice **20/50**.
- Route: theory §24; №645, 647, 649, 650; repeat №669(1,2); homework №646, 648, 668.
- Core: systematic enumeration, tree of variants, digit constraints, leading zero, no-repeat constraints, product rule.

## Recent course sequence
- 68–70 — §19 division with remainder.
- 71–72 — §20 powers.
- 73 — control work №4.
- 74–77 — §21 area.
- 78–80 — §22 rectangular parallelepiped / nets / pyramid.
- 81–84 — complete §23 volume sequence.
- 85 — §24 introduction.
- 86 — §24 reinforcement.
- 87 — locked; next §24 lesson.

## CI / release protection after lesson 86
- `Build` remains always-on for PRs.
- `Course 1-86 certification` is the focused lesson-86 delta gate: boundary, source, runtime, 20/50 practice, Chromium, iPad/WebKit and Sulafat.
- `Course 62-86 hard certification` is cumulative and expensive. Ordinary PR commits skip heavy jobs server-side. Add `[hard-certify]` only for the exact final release-candidate SHA; weekly/manual full certification remains available.
- Hard coverage includes Chromium and WebKit runtime 62–86, **480 tasks / 1200 responses**, Sulafat sequencing/interruption, D1/cloud/multi-student/dashboard regression and control-work integrity.

## Ordinary interactive lesson quality contract
Unless source requires a deliberate exception: ~36 stages; source fidelity first; ~21 checked main actions; exactly 20 mandatory practice tasks with curated majority and no more than 8 parametric; exactly 50 response slots; Pythagoras progressive help; persistence/analytics; Sulafat immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

## Development rule
Inspect exact source → implement → tests → PR → exact-head focused/hard gates → merge exact tested head → Cloudflare deploy → verify exact merged SHA through `/api/version` → only then call production updated.