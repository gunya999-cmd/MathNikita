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
- Ready after this change: **lessons 1–80**.
- Next locked lesson: **81 — § 23 `Объём прямоугольного параллелепипеда`**.
- Integrated control works: **20, 33, 53, 73**.
- Lessons 62–72 and 74–80 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane: **360 tasks / exactly 900 response slots for lessons 62–72 and 74–80**; control lesson 73 remains source-exact and does not receive artificial 20/50 practice.
- The unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific runtime tests must not freeze an obsolete future boundary.
- Common mandatory-practice count and curated-majority tests now cover ordinary lessons through **80**.

## Lesson 80 — § 22 pyramid

- Third and final §22 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified technological route: oral **№5–6 p.150**; theory **§22 pp.148–149**; **№604**; repeat **№614**; questions **14–18**; homework **§22, №605, 611, 615**.
- Core concepts:
  - pyramid surface = one base plus lateral triangular faces with a common apex;
  - sides of the base are base edges; sides of lateral faces outside the base are lateral edges;
  - pyramids are classified by the number of sides of the base;
  - triangular pyramid has four triangular faces and any face can serve as its base;
  - a pyramid can be made from a flat net;
  - four equal equilateral triangles form a **regular tetrahedron**;
  - a pyramid is a **polyhedron** because its surface consists of polygons.
- Exact oral results: `6 ц = 600 кг`, `600:12=50` boxes; square areas `36 cm²` and `4 cm²`, ratio **9**.
- №604 uses the exact textbook figure-172 labels: pyramid **MABC**, base **ABC**, apex **M**, lateral faces `MAB/MBC/MAC`, lateral edges `MA/MB/MC`, base edges `AB/BC/AC`.
- Homework/source transfer includes №605 pyramid **SABCD**; №611 painted `4×5×6` block gives **8 / 36 / 52** cubes with 3/2/1 painted faces and method-guide extension **24** unpainted; №615 roots **102** and **405**.
- №614 exact repeat result: first train covers `8·54=432 km`, second covers `210 km` in `5 h`, speed **42 km/h**.
- Mandatory practice: **20 tasks / exactly 50 response slots**.
- Persistence, retry state, Pythagoras help, analytics, Sulafat sequencing/interruption, Chromium and iPad/WebKit coverage are included.
- **§22 is complete after lesson 80.**

## Lesson 79 — § 22 nets and polyhedra

- Second §22 lesson; **36 meaningful stages / 21 checked main-lesson actions**, mandatory practice **20/50**.
- Route: oral №3–4 p.150; №608, 610; theory §22 pp.147–148; №606; repeat №613; homework №607, 609, additional №616.
- Core: rectangular-parallelepiped net, draw→cut→fold→glue, polyhedron definition, spatial construction.
- Exact source calculations: №608 **4800 cm²**; №610 surface **864 m²**, equal-surface cube edge **12 m**; №606 net area **242 cm²**; №607 **88 cm²**; №609 `a+b+c=7 cm`; №613 **9 sheets**.
- №606 preserves the original figure dependency; №616 remains a source challenge without a fabricated author solution.

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
- 78 — §22 rectangular-parallelepiped foundations.
- 79 — §22 nets and polyhedra.
- 80 — §22 pyramid, nets and regular tetrahedron; **§22 complete**.
- 81 starts §23 volume.

## Release protection after lesson 80

- Earlier cumulative workflows continue to protect previous lessons.
- `Course 1-80 certification` is the lesson-80 delta gate: source fidelity, full flow, 20/50 practice, Chromium, iPad/WebKit and Sulafat interruption.
- `Course 62-80 hard certification` protects the mature block with:
  - build + course/source contract through 80;
  - Chromium hard runtime 62–80;
  - iPad/WebKit hard runtime 62–80;
  - complete **360-task/900-response** ordinary practice for 62–72 and 74–80;
  - Sulafat sequencing/interruption;
  - D1/cloud/multi-student/dashboard regression;
  - lesson-73 control-work integrity.
- Lesson 81 is the centralized locked boundary.

## Ordinary interactive lesson quality contract

Unless the source requires a deliberate exception: about 36 meaningful stages; source fidelity before embellishment; about 21 checked main-lesson activities; mandatory practice exactly 20 tasks with at least 12 curated and no more than 8 parametric; exactly 50 response slots in the mature series; Pythagoras progressive help; persistence and analytics; Sulafat with immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

Control works are intentionally different: source-exact assessment workload, no tutoring before submission, frozen primary attempt, optional correction that cannot alter the primary score.

## Development rule

For every release: inspect exact textbook/method-guide source → implement → add/extend automated tests → open PR → require exact-head delta/hard gates → merge exact tested head → wait for Cloudflare deployment → verify exact merged SHA through `/api/version` → only then call production updated.
