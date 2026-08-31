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
- Ready after this change: **lessons 1–87**.
- Next locked lesson: **88 — Chapter 3 repetition/systematization**.
- Integrated control works: **20, 33, 53, 73**.
- Ordinary lessons 62–72 and 74–87 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane: **500 tasks / exactly 1250 response slots**; control lesson 73 remains source-exact.
- Unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific tests must not freeze future availability.

## Lesson 87 — §24 combinatorics synthesis
- Final §24 lesson; **36 meaningful stages / 21 checked main actions**.
- Type: generalization/systematization.
- Verified route: oral **№4 p.163**; textbook **№659, 661, 663, 664, 666, 667**; workbook **№302–304**; didactic **№158,160–162**; repeat **№672**; homework **№660, 662, 665**; additional **№673**.
- Exact source-aligned results:
  - oral №4 differences: **24, 32, 90**;
  - №659: **6 rectangles**, with swapped side pairs counted once;
  - №661: **6 segments** from four marked points;
  - №663: **6** team-uniform combinations;
  - №664: **8** dress/shoe combinations;
  - №666: author answer **6 routes**; figure 185 remains a source checkpoint rather than reconstructed geometry;
  - №667: maximum **25**, achieved by `1+2·3·4`;
  - homework №660: **5** different rectangular parallelepipeds from 30 cubes;
  - №662: **9 routes**; №665: **6 crews**;
  - №673: **No**; otherwise both counts of girls and boys would be divisible by 4, contradicting total 30.
- Workbook/didactic wording and №672 crossword layout not reliably recovered remain explicit source checkpoints; no invented author text.
- Mandatory practice: **20 tasks / exactly 50 responses**.
- Persistence, Pythagoras help, analytics, Sulafat interruption, Chromium and iPad/WebKit coverage included.

## Recent course sequence
- 68–70 — §19 division with remainder.
- 71–72 — §20 powers.
- 73 — control work №4.
- 74–77 — §21 area.
- 78–80 — §22 rectangular parallelepiped / nets / pyramid.
- 81–84 — complete §23 volume sequence.
- 85–87 — complete §24 combinatorics sequence.
- 88–89 — Chapter 3 repetition/systematization.
- 90 — Control work №5.

## CI / release protection after lesson 87
- `Build` remains always-on for PRs.
- `Course 1-87 certification` is the focused lesson-87 delta gate: boundary, source, runtime, 20/50 practice, Chromium, iPad/WebKit and Sulafat.
- `Course 62-87 hard certification` is cumulative and expensive. Ordinary PR commits skip heavy jobs server-side. Add `[hard-certify]` only for the exact final release-candidate SHA; weekly/manual full certification remains available.
- Hard coverage includes Chromium and WebKit runtime 62–87, **500 tasks / 1250 responses**, Sulafat sequencing/interruption, D1/cloud/multi-student/dashboard regression and control-work integrity.

## Ordinary interactive lesson quality contract
Unless source requires a deliberate exception: ~36 stages; source fidelity first; ~21 checked main actions; exactly 20 mandatory practice tasks with curated majority and no more than 8 parametric; exactly 50 response slots; Pythagoras progressive help; persistence/analytics; Sulafat immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

## Development rule
Inspect exact source → implement → tests → PR → exact-head focused/hard gates → merge exact tested head → Cloudflare deploy → verify exact merged SHA through `/api/version` → only then call production updated.
