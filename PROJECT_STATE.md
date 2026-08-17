# MathNikita Project State

Use this file as the compact handoff context for continuing development without relying on a long ChatGPT thread.

## Project

- App: MathNikita — AI math tutor web app.
- Repository: `gunya999-cmd/MathNikita`
- Production URL: `https://mathnikita.gunya999.workers.dev`
- Deployment: GitHub `main` -> Cloudflare Workers & Pages.
- Hosting rule: Cloudflare-first only. Do not move production hosting to Vercel, Netlify, Lovable hosting, or another platform unless explicitly requested.
- Build command: `npm run build`
- Deploy command: `npm run cf:deploy` or `npx wrangler deploy`
- Root directory: `/`

## Stack

- Frontend: Vite + React + TypeScript.
- Backend: Cloudflare Worker with static assets and API routes.
- Auth/DB: Supabase.
- AI provider: Gemini API as primary free provider.
- OpenAI: configured as backup, but current OpenAI API quota is exhausted.

## Cloudflare workflow

- Production is deployed through Cloudflare Workers & Pages.
- GitHub `main` is the production source branch for Cloudflare deploys.
- `wrangler.jsonc` is the source of truth for Worker/static asset routing.
- `/api/*` must continue to run through the Worker via `run_worker_first`.
- Frontend environment variables must be Cloudflare build variables.
- Server-only AI keys must be Cloudflare Worker secrets.
- If a failed deployment is retried, Cloudflare may rebuild that old commit; create or select a fresh deployment from latest `main` instead.

## Working Cloudflare routes

- `/api/tutor-status` — checks configured AI secrets.
- `/api/tutor-test` — tests active AI provider.
- `/api/tutor` — chat endpoint used by the frontend.

## Secrets / environment

Cloudflare build variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Cloudflare Worker secrets:

- `GEMINI_API_KEY`
- `OPENAI_API_KEY` optional backup only

Do not expose API keys in chat or frontend.

## Current working status

- Cloudflare deploy works from GitHub commits.
- Supabase Auth works.
- Email confirmation works.
- Supabase profile/progress sync works.
- Gemini AI chat works and has produced responses labeled `AI-репетитор Gemini`.
- Local fallback tutor remains available if AI fails.

## Recent completed work

- Lessons 1–47 of the Merzlyak grade-5 course are production-ready; lesson 48 remains locked.
- Lesson 47 is the § 14 consolidation lesson: 36 stages, 23 interactive checks, 20 curated mandatory-practice tasks, Sulafat/Pythagoras support, persistence, iPad and full-flow certification tests.
- The next course item is lesson 48, «Построение треугольников».
- Fixed Cloudflare API routing with `run_worker_first = ["/api/*"]` in Wrangler config.
- Added Gemini provider before OpenAI fallback.
- Improved tutor prompt so the student question has priority over diagnostic weak topics.
- Began extending the app toward a 12-grade international math curriculum.
- Added grade switching and grade-aware dashboard/diagnostic/practice/chat in PR #1.
- Fixed circular TypeScript lesson type dependency after Cloudflare build failure.

## Current feature goal

Build an extended version with:

1. 12 school grades for mathematics.
2. Curriculum inspired by strong international tracks: Singapore Math, Cambridge, IB, Common Core.
3. Ability to switch between grades.
4. Dashboard / Lesson of the Day adapts to selected grade.
5. Profile stores selected grade.
6. Chat remains fast and should use concise context only.
7. All production deployment and API routing stays on Cloudflare.

## Development rule for future ChatGPT work

To avoid slow or heavy chats:

- Keep responses short.
- Do not paste full files unless necessary.
- Make small GitHub commits.
- After each step, report only: what changed, commit SHA, what to test.
- Use this `PROJECT_STATE.md` as the project memory.
- Treat Cloudflare as the default production platform.
