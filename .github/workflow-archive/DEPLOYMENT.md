# Deployment

MathNikita is deployed through Cloudflare from the GitHub `main` branch.

## Current deployment flow

1. Changes are committed to GitHub `main`.
2. Cloudflare builds the project.
3. Cloudflare deploys the Worker with static assets and API routes.

## Cloudflare build settings

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Production branch: `main`

## Runtime / build configuration

Frontend build variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Worker secrets for real AI tutor responses:

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

Do not use Supabase service-role keys in the frontend.

## Tutor API diagnostics

After deployment, open `/api/tutor-status` on the production domain. It should return `geminiConfigured: true` when the Worker can see `GEMINI_API_KEY`.

Open `/api/tutor-test` to check whether the active AI provider answers successfully.

## Notes

The app works without AI provider keys by using the local tutor fallback. Supabase sync requires the two `VITE_SUPABASE_*` variables and the schema from `supabase/schema.sql`.
