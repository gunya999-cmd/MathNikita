# MathNikita Project State

## Project
- App: MathNikita — AI math tutor web app.
- Repository: `gunya999-cmd/MathNikita`.
- Production: `https://mathnikita.gunya999.workers.dev`.
- Production branch: `main`.
- Stack: Vite + React + TypeScript, Cloudflare Worker/static assets, Cloudflare D1.
- Narration: studio Sulafat path with immediate interruption/fallback handling.

## Non-negotiable deployment invariant
`main` is the production source of truth. A lesson is production-ready only after exact-head lesson certification, merge of the tested head, Cloudflare deployment, and `Production · deployed SHA matches main` for the resulting production SHA.

## Current course checkpoint — 2026-09-09
- Official plan: **175 Merzlyak grade-5 lessons**.
- Production-ready: **lessons 1–122**.
- Latest production lesson: **122 — §33 composite problems**, mandatory practice **20 tasks / exactly 50 response slots**.
- Latest production merge SHA before this maintenance change: `dcd0570a331cebd9690ce73074d1dc814a4a85d1`.
- `Production · deployed SHA matches main` passed for that production state.
- Next lesson to build: **123**.

## CI / release protection
- `Build` remains the general always-on gate.
- The current latest lesson certification is allowed to run on `main`, so the merged production state receives a full Chromium + iPad/WebKit lesson certificate.
- Closed lesson workflows are release-specific checks, not cumulative every-PR gates. They remain manually runnable and may run on their own `lesson-N-build` branch, but must not recertify on every unrelated future push/PR.
- As the course advances, move the `main` certification responsibility from the previous latest lesson to the new latest lesson.
- Cumulative/course-wide regression workflows remain separate from lesson-specific certification.

## Ordinary interactive lesson quality contract
Unless the source requires a deliberate exception: source fidelity first; approximately 36 stages; approximately 21 checked main actions; exactly 20 mandatory practice tasks with curated majority and no more than 8 parametric tasks; exactly 50 response slots; Pythagoras progressive help; persistence/analytics; Sulafat immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

## Control-work contract
Source-exact workload; no tutoring before submission; primary attempt frozen; correction mode cannot change the primary score; no ordinary 20/50 practice unless the source explicitly calls for it.

## Development rule
Inspect exact source → implement → focused tests → PR → exact-head certification → merge exact tested head → Cloudflare deploy → verify exact merged SHA through `/api/version` → only then call production updated.
