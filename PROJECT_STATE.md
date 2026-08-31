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
- Ready after this change: **lessons 1–89**.
- Next locked lesson: **90 — Control work №5**.
- Integrated control works currently released: **20, 33, 53, 73**.
- Ordinary lessons 62–72 and 74–89 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane: **540 tasks / exactly 1350 response slots**; control lesson 73 remains source-exact.
- Unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific tests must not freeze future availability.

## Lesson 89 — Chapter 3 correction before Control work №5
- Second of two official lessons **«Повторение и систематизация учебного материала»** before Control work №5.
- The method guide explicitly omits separate technological maps for review/systematization lessons; no numbered route is invented.
- Source basis is the official 88–89 review slot plus the exact skill structure of **Control work №5: «Деление с остатком. Площадь прямоугольника. Прямоугольный параллелепипед и его объём. Комбинаторные задачи»**.
- The control itself is **not exposed as training**: lesson 89 uses analogous tasks with deliberately changed numbers so the learner practices methods instead of memorizing the upcoming variant.
- **36 meaningful stages / 21 checked main actions**.
- Eight rehearsal models:
  1. division with remainder and `a=bq+r`, `r<b`;
  2. rectangle side relationship and area;
  3. cube volume vs surface area;
  4. reconstructing prism dimensions and `V=abc`;
  5. restoring the dividend from divisor, incomplete quotient and remainder;
  6. hectares → square metres → missing side → perimeter;
  7. three-digit combinatorics with no leading zero or repeated digits;
  8. edge-sum formula `4(a+b+c)` and a missing dimension.
- Main rehearsal values include `563=17·33+2`, rectangle `16×48 → 768 cm²`, cube edge `5 → V=125 cm³, S=150 cm²`, prism `20×10×16 → 3200 cm³`, dividend `13·8+5=109`, field `8 ha → 80 000 m² → 400×200 → P=1200 m`, digits `0,3,7 → 307,370,703,730`, edge sum `132 → a+b+c=33 → third dimension 9`.
- Mandatory practice: **20 tasks / exactly 50 responses**, using different values from the control work.
- Persistence, two-wrong-attempt continuation, Pythagoras help, analytics, Sulafat interruption, Chromium and iPad/WebKit coverage included.
- Lesson 89 completes Chapter 3 preparation. Lesson 90 must preserve the control-work contract: no tutoring before submission, frozen primary attempt, correction mode cannot change primary score.

## Lesson 88 — released production checkpoint
- First Chapter 3 diagnostic review; all 12 source self-check questions in original order; **36/21**, mandatory practice **20/50**.
- Exact-head Build + focused + cumulative hard passed.
- Merge/deploy SHA: `e1d2f3c790dc828e5864f449657aa12df028781a`.
- `Production · deployed SHA matches main` passed for that merge SHA.

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
- 91 — §25 ordinary fractions begins.

## CI / release protection after lesson 89
- `Build` remains always-on for PRs.
- `Course 1-89 certification` is the focused lesson-89 delta gate: boundary, source, runtime, 20/50 practice, Chromium, iPad/WebKit and Sulafat.
- `Course 62-89 hard certification` is cumulative and expensive. Ordinary PR commits skip heavy jobs server-side. Add `[hard-certify]` only for the exact final release-candidate SHA; weekly/manual full certification remains available.
- Hard coverage includes Chromium and WebKit runtime 62–89, **540 tasks / 1350 responses**, Sulafat sequencing/interruption, D1/cloud/multi-student/dashboard regression and control-work integrity.

## Ordinary interactive lesson quality contract
Unless source requires a deliberate exception: ~36 stages; source fidelity first; ~21 checked main actions; exactly 20 mandatory practice tasks with curated majority and no more than 8 parametric; exactly 50 response slots; Pythagoras progressive help; persistence/analytics; Sulafat immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

## Development rule
Inspect exact source → implement → tests → PR → exact-head focused/hard gates → merge exact tested head → Cloudflare deploy → verify exact merged SHA through `/api/version` → only then call production updated.
