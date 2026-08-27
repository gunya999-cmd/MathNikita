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
- Ready after this change: **lessons 1–79**.
- Next locked lesson: **80 — § 22 `Прямоугольный параллелепипед. Пирамида` (пирамида)**.
- Integrated control works: **20, 33, 53, 73**.
- Lessons 62–72 and 74–79 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane: **340 tasks / exactly 850 response slots for lessons 62–72 and 74–79**; control lesson 73 remains source-exact and does not receive artificial 20/50 practice.
- The unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific runtime tests must move with that boundary.

## Lesson 79 — § 22 nets and polyhedra

- Second §22 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified technological route: oral **№3–4 p.150**; **№608, 610**; theory **§22 pp.147–148**; **№606**; repeat **№613**; homework **№607, 609**, additional **№616**.
- Oral warm-up: `2(a+b)=2a+2b`, `(3-b)·5=15-5b`, `6m(7n+8p)=42mn+48mp`; rectangle `S=28 cm²`, side `7 cm` gives other side `4 cm`, perimeter `22 cm`.
- Core spatial concepts:
  - a rectangular-parallelepiped net is the flat surface pattern used to make a model;
  - model sequence: draw → cut → fold along edges → glue;
  - a rectangular parallelepiped is a **polyhedron** because its surface consists of polygons;
  - drawing/net work explicitly develops spatial imagination.
- Exact source calculations:
  - №608: dimensions `60×15×20 cm`, surface area **4800 cm²**;
  - №610: dimensions `18×9×10 m`, surface **864 m²**, equal-surface cube edge **12 m**;
  - №606: dimensions `10×7×3 cm`, 6 rectangles / 3 equal pairs, net area **242 cm²**;
  - №607: dimensions `4×6×2 cm`, surface **88 cm²**;
  - №609: if all 12 edges total 28 cm, then `a+b+c=7 cm`;
  - №613: 50 squares at 6 per sheet require **9 sheets**.
- №606 remains tied to the original textbook figure 174; the app does not invent an approximate replacement drawing.
- №616 remains an explicit source challenge without fabricating an author solution.
- Mandatory practice: **20 tasks / exactly 50 response slots**.
- Persistence, retry state, Pythagoras help, analytics, Sulafat sequencing/interruption, Chromium and iPad/WebKit coverage are included.

## Lesson 78 — § 22 foundations

- First §22 lesson; **36 stages / 21 checked actions**, mandatory practice **20/50**.
- Route: oral №1–2 p.150; theory §22 pp.145–146; №598, 599, 602; repeat №612; homework №600, 601, 603.
- Core facts: **6 faces, 12 edges, 8 vertices**, three pairs of equal opposite faces, length/width/height, `Sпов=2(ab+bc+ac)`, cube as equal-measurement case.
- №598 preserves original-figure dependency; №612 remains a source checkpoint where full wording was not reliably recovered.

## Recent course sequence

- 68–70 — §19 division with remainder.
- 71–72 — §20 powers.
- 73 — source-exact Control work №4.
- 74–77 — complete §21 area sequence; every ordinary lesson 36/21 and 20/50.
- 78–79 — §22 rectangular parallelepiped: foundations, then nets/polyhedra; every ordinary lesson 36/21 and 20/50.

## Release protection after lesson 79

- Earlier cumulative workflows continue to protect previous lessons.
- `Course 1-79 certification` is the lesson-79 delta gate: source fidelity, full flow, 20/50 practice, Chromium, iPad/WebKit and Sulafat interruption.
- `Course 62-79 hard certification` protects the mature block with:
  - build + course/source contract through 79;
  - Chromium hard runtime 62–79;
  - iPad/WebKit hard runtime 62–79;
  - complete **340-task/850-response** ordinary practice for 62–72 and 74–79;
  - Sulafat sequencing/interruption;
  - D1/cloud/multi-student/dashboard regression;
  - lesson-73 control-work integrity.
- Lesson 80 is the centralized locked boundary.

## Ordinary interactive lesson quality contract

Unless the source requires a deliberate exception: about 36 meaningful stages; source fidelity before embellishment; about 21 checked main-lesson activities; mandatory practice exactly 20 tasks with at least 12 curated and no more than 8 parametric; exactly 50 response slots; Pythagoras progressive help; persistence and analytics; Sulafat with immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

Control works are intentionally different: source-exact assessment workload, no tutoring before submission, frozen primary attempt, optional correction that cannot alter the primary score.

## Development rule

For every release: inspect exact textbook/method-guide source → implement → add/extend automated tests → open PR → require exact-head delta/hard gates → merge exact tested head → wait for Cloudflare deployment → verify exact merged SHA through `/api/version` → only then call production updated.
