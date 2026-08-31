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
- Ready after this change: **lessons 1–88**.
- Next locked lesson: **89 — Chapter 3 repetition/systematization, lesson 2 of 2**.
- Lesson 90 remains **Control work №5**.
- Integrated control works currently released: **20, 33, 53, 73**.
- Ordinary lessons 62–72 and 74–88 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane: **520 tasks / exactly 1300 response slots**; control lesson 73 remains source-exact.
- Unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific tests must not freeze future availability.

## Lesson 88 — Chapter 3 diagnostic review
- First of two official lessons **«Повторение и систематизация учебного материала»** before Control work №5.
- The method guide does not provide a separate technological card for review/systematization lessons, so lesson 88 is anchored directly in the textbook chapter-end source rather than an invented numbered route.
- Exact source: **Задание №3 «Проверьте себя»**, pp.167–168, plus **«Итоги главы 3»**, pp.168–169.
- **36 meaningful stages / 21 checked main actions**.
- All 12 self-check questions are included in original order with source-aligned answers. Author key: **ВААГБГББВВБА**.
- Exact results used:
  - Q1: **1 ha** is an area unit;
  - Q2: `(x−28)·16=1632 → x=130`;
  - Q3: `52·m·3=156m`;
  - Q4: `2(5+x)=10+2x`;
  - Q5: `7x+x−5x=132 → x=44`;
  - Q6: possible remainder on division by 98 is **96**;
  - Q7: catch-up time **2 h**;
  - Q8: apartment №173 is on **floor 4**;
  - Q9: **800 tiles → 6 boxes**;
  - Q10: aquarium height **50 cm**;
  - Q11: freight-train length **375 m**;
  - Q12: `2·2·2=8` meal combinations.
- Review map covers §§16–24: multiplication and properties, division, division with remainder, powers, area, rectangular parallelepiped/pyramid, volume and combinatorics.
- Mandatory practice: **20 tasks / exactly 50 responses**.
- Persistence, Pythagoras help, analytics, Sulafat interruption, Chromium and iPad/WebKit coverage included.
- Lesson 89 is intentionally reserved for correction of diagnostic gaps and final mixed preparation for Control work №5.

## Lesson 87 — released production checkpoint
- Final §24 combinatorics synthesis; **36/21**, mandatory practice **20/50**.
- Exact-head focused + hard gates passed; merge/deploy SHA: `8dcb3c503e0096eb3711cc728c4eb5ed0f757568`.
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

## CI / release protection after lesson 88
- `Build` remains always-on for PRs.
- `Course 1-88 certification` is the focused lesson-88 delta gate: boundary, source, runtime, 20/50 practice, Chromium, iPad/WebKit and Sulafat.
- `Course 62-88 hard certification` is cumulative and expensive. Ordinary PR commits skip heavy jobs server-side. Add `[hard-certify]` only for the exact final release-candidate SHA; weekly/manual full certification remains available.
- Hard coverage includes Chromium and WebKit runtime 62–88, **520 tasks / 1300 responses**, Sulafat sequencing/interruption, D1/cloud/multi-student/dashboard regression and control-work integrity.

## Ordinary interactive lesson quality contract
Unless source requires a deliberate exception: ~36 stages; source fidelity first; ~21 checked main actions; exactly 20 mandatory practice tasks with curated majority and no more than 8 parametric; exactly 50 response slots; Pythagoras progressive help; persistence/analytics; Sulafat immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

## Development rule
Inspect exact source → implement → tests → PR → exact-head focused/hard gates → merge exact tested head → Cloudflare deploy → verify exact merged SHA through `/api/version` → only then call production updated.
