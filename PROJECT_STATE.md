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
- Ready after this change: **lessons 1–90**.
- Next locked lesson: **91 — §25, ordinary fractions**.
- Integrated control works after this release: **20, 33, 53, 73, 90**.
- Ordinary lessons 62–72 and 74–89 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane remains **540 tasks / exactly 1350 response slots**; control lessons 73 and 90 are source-exact and do not use ordinary 20/50 practice.
- Unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific tests must not freeze future availability.

## Lesson 90 — Control work №5
- Exact source: Merzlyak teacher methodology, **Control work №5, Variant 1**: division with remainder; rectangle area; rectangular parallelepiped and volume; combinatorics.
- Assessment workload: **8 original tasks / 10 evaluated answer fields**.
- Exact answers used by the evaluator:
  1. `478:15 → incomplete quotient 31, remainder 13`;
  2. rectangle `14 × 42 → 588 cm²`;
  3. cube edge `3 cm → V=27 cm³, S=54 cm²`;
  4. prism `18 × 9 × 20 → 3240 cm³`;
  5. dividend `11·7+6=83`;
  6. `6 ha=60 000 m²`, second side `400 m`, perimeter `1100 m`;
  7. digits `5,6,0` without repetition → `506, 560, 605, 650` (order-independent answer matching);
  8. edge sum `116=4(a+b+c)`, dimensions 12 and 11 → third dimension `6 cm`.
- Before submission: no correct-answer feedback, no Pythagoras, no response coach, no explanations or hints.
- Draft responses persist locally; all 10 answer fields must be filled before submission.
- Submission freezes `submittedResponses`; the primary score is always computed from that immutable snapshot.
- Correction mode opens only fields missed on the primary attempt and cannot alter the primary score or submitted snapshot.
- Sulafat narration remains available for neutral task text and is immediately cancelled when the learner changes stage; solution text is absent from pre-submit DOM.
- Chromium + iPad/WebKit coverage includes exact source, full submit, frozen-score correction, layout and narration interruption.

## Lesson 89 — released production checkpoint
- Second Chapter 3 repetition/systematization lesson; **36/21**, mandatory practice **20/50**.
- Exact-head Build + focused Course 1–89 + cumulative Course 62–89 hard passed.
- Merge/deploy SHA: `b14c01f67847d75a4181d53bfe4c69861fe0e088`.
- `Production · deployed SHA matches main` passed for that SHA.

## Recent course sequence
- 68–70 — §19 division with remainder.
- 71–72 — §20 powers.
- 73 — Control work №4.
- 74–77 — §21 area.
- 78–80 — §22 rectangular parallelepiped / nets / pyramid.
- 81–84 — complete §23 volume sequence.
- 85–87 — complete §24 combinatorics sequence.
- 88–89 — Chapter 3 repetition/systematization.
- 90 — Control work №5.
- 91 — §25 ordinary fractions begins.

## CI / release protection after lesson 90
- `Build` remains always-on for PRs.
- `Course 1-90 certification` is the focused Control work №5 delta gate: course boundary, source fidelity, frozen-primary-score assessment integrity, Chromium, iPad/WebKit and Sulafat.
- Existing `Course 62-89 hard certification` remains the cumulative baseline and retains the **540 tasks / 1350 responses** ordinary-practice lane plus runtime, voice and D1/cloud regression.
- `Course 90 hard extension` adds the exact Control work №5 assessment/runtime/voice contract. On the final release SHA, the cumulative baseline and the 90 extension must both pass; together they certify 62–90 without duplicating the expensive ordinary-practice lane.
- Ordinary PR commits skip both hard paths server-side. Add the hard-certification marker only for the exact final release-candidate SHA; remove it from PR text after the runs have started without changing the SHA.

## Ordinary interactive lesson quality contract
Unless source requires a deliberate exception: ~36 stages; source fidelity first; ~21 checked main actions; exactly 20 mandatory practice tasks with curated majority and no more than 8 parametric; exactly 50 response slots; Pythagoras progressive help; persistence/analytics; Sulafat immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

## Control-work contract
Source-exact workload; no tutoring before submission; primary attempt frozen; correction mode cannot change primary score; no ordinary 20/50 practice unless the source explicitly calls for it.

## Development rule
Inspect exact source → implement → tests → PR → exact-head focused/hard gates → merge exact tested head → Cloudflare deploy → verify exact merged SHA through `/api/version` → only then call production updated.
