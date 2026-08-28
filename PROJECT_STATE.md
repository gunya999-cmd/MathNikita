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
- Ready after this change: **lessons 1–83**.
- Next locked lesson: **84 — § 23 `Объём прямоугольного параллелепипеда`**.
- Integrated control works: **20, 33, 53, 73**.
- Lessons 62–72 and 74–83 use the mature ordinary-lesson contract.
- Cumulative ordinary-practice lane: **420 tasks / exactly 1050 response slots for lessons 62–72 and 74–83**; control lesson 73 remains source-exact and does not receive artificial 20/50 practice.
- The unlock boundary is centralized in `tests/course-plan.spec.ts`; lesson-specific runtime tests must follow the current boundary instead of freezing an obsolete future lock.
- Common mandatory-practice count and curated-majority tests cover ordinary lessons through **83**.

## Lesson 83 — § 23 volume reinforcement

- Third §23 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified technological route: oral **№4 p.156**; main work **№626, 630, 633, 634**; repeat **№644**; homework **№627, 631, 643 (3, 4)**.
- The lesson consolidates direct and inverse volume relations, composite-volume reasoning, productivity/application problems and the connection between a cube's volume and surface area.
- Exact source-aligned results used in the lesson:
  - №626: unknown height **5 cm**;
  - №633: room volume **72 m³**, productivity **9 m³/h**, equivalent workforce **300 workers**;
  - №634: cube volume **216 cm³** and surface area **216 cm²**.
- №630 and №631 depend on edition-specific figures that are not reliably present in the available extraction, so the app keeps explicit source checkpoints instead of inventing replacement drawings.
- Repeat №644 and homework №643 (3, 4) remain explicit source checkpoints where the complete wording was not recovered reliably.
- Mandatory practice: **20 tasks / exactly 50 response slots**.
- Persistence, Pythagoras help, analytics, Sulafat sequencing/interruption, Chromium and iPad/WebKit coverage are included.

## Lesson 82 — § 23 volume formulas

- Second §23 lesson; **36 meaningful stages / 21 checked main-lesson actions**.
- Verified technological route: oral **№1 p.156** and questions **1–4** for activation; theory **§23 pp.155–156**; **№619, 620, 624, 628, 632**; repeat **№642**; homework **questions 5–7, №621, 625, 629**.
- Core formulas and reasoning:
  - textbook model `5 cm × 6 cm × 4 cm`: `5·6=30` unit cubes per layer, 4 layers, so **120 cm³**;
  - rectangular parallelepiped: **`V=abc`**;
  - cube: **`V=a³`**;
  - with base area `S` and height `h`: **`V=Sh`**;
  - inverse relations include `h=V:S` and `S=V:h`;
  - all linear measurements must be expressed in the same unit before using `V=abc`.
- Exact routed results: №619 **1080 m³**; №620 **216 cm³**; inverse example `324:54=6 dm`; №624 **1620 dm³**; №628 **36 m²**; №632 **448 g**.
- Confirmed homework transfer: №621 **320 dm³**; №625 **1920 cm³**; №629 height **5 m**.
- Oral №1 and repeat №642 remain explicit source checkpoints where complete edition-specific presentation/wording is not reliable in the available extraction.
- Mandatory practice: **20 tasks / exactly 50 response slots**.
- Runtime uses numeric-aware answer matching; editing a checked answer clears stored correctness while preserving the mature two-wrong-attempt continuation contract.

## Lesson 81 — § 23 volume figure

- First §23 lesson; **36 meaningful stages / 21 checked main-lesson actions**, mandatory practice **20/50**.
- Route: oral **№2 p.156**; theory **§23 pp.153–154**; **№617, 618, 622**; repeat **№643 (1, 2)**; homework **questions 1–4, №623, 641**.
- Core: meaning and properties of volume, unit cube, cubic units, `1 l = 1 dm³`, measuring volume by counting unit cubes.
- Exact source values include oral №2 **8 cubes**, figure 176 volumes **5, 5, 18, 9**, `1 dm³=1000 cm³`, `1 m³=1,000,000 cm³`.
- №618 / figure 179 and repeat №643 remain source checkpoints where the extraction is incomplete.
- Lesson 81 intentionally stops before `V=abc`; lesson 82 introduces that formula.

## Lesson 80 — § 22 pyramid

- Third and final §22 lesson; **36 meaningful stages / 21 checked main-lesson actions**, mandatory practice **20/50**.
- Route: oral **№5–6 p.150**; theory **§22 pp.148–149**; **№604**; repeat **№614**; questions **14–18**; homework **§22, №605, 611, 615**.
- Core: base/apex, lateral faces and edges, classification by base, nets, regular tetrahedron, pyramid as polyhedron.
- **§22 is complete after lesson 80.**

## Recent course sequence

- 68–70 — §19 division with remainder.
- 71–72 — §20 powers.
- 73 — source-exact Control work №4.
- 74–77 — complete §21 area sequence; every ordinary lesson 36/21 and 20/50.
- 78 — §22 rectangular-parallelepiped foundations.
- 79 — §22 nets and polyhedra.
- 80 — §22 pyramid; §22 complete.
- 81 — §23 meaning of volume, unit cube and cubic units.
- 82 — §23 formulas `V=abc`, `V=a³`, `V=Sh` and direct/inverse applications.
- 83 — §23 reinforcement: inverse, composite and applied volume problems.
- 84 — locked; final §23 lesson remains to be implemented from the verified source route.

## Release protection after lesson 83

- Earlier cumulative workflows continue to protect previous lessons.
- `Course 1-83 certification` is the lesson-83 delta gate: source fidelity, full flow, 20/50 practice, Chromium, iPad/WebKit and Sulafat interruption.
- `Course 62-83 hard certification` protects the mature block with:
  - build + course/source contract through 83;
  - Chromium hard runtime 62–83;
  - iPad/WebKit hard runtime 62–83;
  - complete **420-task/1050-response** ordinary practice for 62–72 and 74–83;
  - Sulafat sequencing/interruption;
  - D1/cloud/multi-student/dashboard regression;
  - lesson-73 control-work integrity.
- Lesson 84 is the centralized locked boundary.

## Ordinary interactive lesson quality contract

Unless the source requires a deliberate exception: about 36 meaningful stages; source fidelity before embellishment; about 21 checked main-lesson activities; mandatory practice exactly 20 tasks with at least 12 curated and no more than 8 parametric; exactly 50 response slots in the mature series; Pythagoras progressive help; persistence and analytics; Sulafat with immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

Control works are intentionally different: source-exact assessment workload, no tutoring before submission, frozen primary attempt, optional correction that cannot alter the primary score.

## Development rule

For every release: inspect exact textbook/method-guide source → implement → add/extend automated tests → open PR → require exact-head delta/hard gates → merge exact tested head → wait for Cloudflare deployment → verify exact merged SHA through `/api/version` → only then call production updated.
