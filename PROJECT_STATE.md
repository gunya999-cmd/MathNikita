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
- Ready after this change: **lessons 1–81**.
- Next locked lesson: **82 — § 23 `Объём прямоугольного параллелепипеда`**.
- Integrated control works: **20, 33, 53, 73**.
- Lessons 62–72 and 74–81 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane: **380 tasks / exactly 950 response slots for lessons 62–72 and 74–81**; control lesson 73 remains source-exact and does not receive artificial 20/50 practice.
- The unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific runtime tests must not freeze an obsolete future boundary.
- Common mandatory-practice count and curated-majority tests cover ordinary lessons through **81**.

## Lesson 81 — § 23 volume figure

- First §23 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified technological route: oral **№2 p.156**; theory **§23 pp.153–154**; **№617, 618, 622**; repeat **№643 (1, 2)**; homework **questions 1–4, №623, 641**.
- Core concepts:
  - volume characterizes how much space a solid occupies;
  - equal figures have equal volumes;
  - volume of a composite figure equals the sum of the volumes of its non-overlapping parts;
  - a unit cube has an edge equal to the chosen unit segment;
  - measuring volume means counting how many unit cubes fit in the figure;
  - cubic units: `mm³`, `cm³`, `dm³`, `m³`, `km³`; **1 l = 1 dm³**.
- Exact source checkpoints: oral №2 = **8 unit cubes**; figure 176 volumes = **5, 5, 18, 9** cubic units; №617 gives `1 dm³ = 1000 cm³` and `1 m³ = 1,000,000 cm³`; №622 provides the cubic-unit conversion set.
- №618 depends on textbook figure 179; the available extraction does not reproduce that figure reliably, so the lesson keeps a source checkpoint and does not invent a replacement drawing.
- Repeat №643 (1, 2) is preserved as a route checkpoint because its full wording was not reliably recovered from this edition's extraction.
- **The formula `V=abc` is deliberately deferred to lesson 82**; lesson 81 teaches the meaning and units of volume without jumping ahead.
- Mandatory practice: **20 tasks / exactly 50 response slots**.
- Persistence, retry state, Pythagoras help, analytics, Sulafat sequencing/interruption, Chromium and iPad/WebKit coverage are included.

## Lesson 80 — § 22 pyramid

- Third and final §22 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified route: oral **№5–6 p.150**; theory **§22 pp.148–149**; **№604**; repeat **№614**; questions **14–18**; homework **§22, №605, 611, 615**.
- Core: base/apex, lateral faces and edges, classification by base, nets, regular tetrahedron, pyramid as polyhedron.
- №604 uses exact textbook labels **MABC**, base **ABC**, apex **M**.
- №614 exact repeat result: **42 km/h**.
- Mandatory practice **20/50**. **§22 is complete after lesson 80.**

## Recent course sequence

- 68–70 — §19 division with remainder.
- 71–72 — §20 powers.
- 73 — source-exact Control work №4.
- 74–77 — complete §21 area sequence; every ordinary lesson 36/21 and 20/50.
- 78 — §22 rectangular-parallelepiped foundations.
- 79 — §22 nets and polyhedra.
- 80 — §22 pyramid, nets and regular tetrahedron; §22 complete.
- 81 — §23 meaning of volume, unit cube and cubic units.
- 82 — locked; next step introduces the rectangular-parallelepiped volume formula.

## Release protection after lesson 81

- Earlier cumulative workflows continue to protect previous lessons.
- `Course 1-81 certification` is the lesson-81 delta gate: source fidelity, full flow, 20/50 practice, Chromium, iPad/WebKit and Sulafat interruption.
- `Course 62-81 hard certification` protects the mature block with:
  - build + course/source contract through 81;
  - Chromium hard runtime 62–81;
  - iPad/WebKit hard runtime 62–81;
  - complete **380-task/950-response** ordinary practice for 62–72 and 74–81;
  - Sulafat sequencing/interruption;
  - D1/cloud/multi-student/dashboard regression;
  - lesson-73 control-work integrity.
- Lesson 82 is the centralized locked boundary.

## Ordinary interactive lesson quality contract

Unless the source requires a deliberate exception: about 36 meaningful stages; source fidelity before embellishment; about 21 checked main-lesson activities; mandatory practice exactly 20 tasks with at least 12 curated and no more than 8 parametric; exactly 50 response slots in the mature series; Pythagoras progressive help; persistence and analytics; Sulafat with immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

Control works are intentionally different: source-exact assessment workload, no tutoring before submission, frozen primary attempt, optional correction that cannot alter the primary score.

## Development rule

For every release: inspect exact textbook/method-guide source → implement → add/extend automated tests → open PR → require exact-head delta/hard gates → merge exact tested head → wait for Cloudflare deployment → verify exact merged SHA through `/api/version` → only then call production updated.
