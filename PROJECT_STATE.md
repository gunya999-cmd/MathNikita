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

## Current course checkpoint — 2026-09-10
- Official plan: **175 Merzlyak grade-5 lessons**.
- Production-ready: **lessons 1–123**.
- Latest production lesson: **123 — §33 lesson 5 of 6**, mandatory practice **20 tasks / exactly 50 response slots**.
- Production SHA: `66342966bf4407fce858c7dc17ea7c2eda4b7b8b`.
- `Production · deployed SHA matches main` passed for this SHA.
- Current build branch: **lesson-124-build**.
- Lesson 124: **§33 lesson 6 of 6**, final consolidation before Control Work №7.
- Next lesson after 124: **125 — Control Work №7**.

## CI / release protection
- `Build` remains the general always-on gate.
- Only the current latest lesson certification should run automatically on its release branch, pull request and `main`.
- Closed lesson workflows must not recertify on unrelated future pull requests or main pushes.
- Historical lessons 91–122 have been removed from active automatic GitHub Actions; regression remains available through Git history/archive and the manual historical workflow.
- As the course advances, move automatic `main` certification from the previous latest lesson to the new latest lesson.
- Cumulative/course-wide regression workflows remain separate from lesson-specific certification.

## Ordinary interactive lesson quality contract
Unless the source requires a deliberate exception: source fidelity first; approximately 36 stages; approximately 21 checked main actions; exactly 20 mandatory practice tasks with curated majority and no more than 8 parametric tasks; exactly 50 response slots; Pythagoras progressive help; persistence/analytics; Sulafat immediate stale-narration cancellation; Chromium + iPad/WebKit release coverage.

## Control-work contract
Source-exact workload; no tutoring before submission; primary attempt frozen; correction mode cannot change the primary score; no ordinary 20/50 practice unless the source explicitly calls for it.

## Development rule
Inspect exact source → implement → focused tests → PR → exact-head certification → merge exact tested head → Cloudflare deploy → verify exact merged SHA through `/api/version` → only then call production updated.
