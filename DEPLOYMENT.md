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

Worker secret for real AI tutor responses:

- `OPENAI_API_KEY`

Do not use Supabase service-role keys in the frontend.

## Notes

The app works without `OPENAI_API_KEY` by using the local tutor fallback. Supabase sync requires the two `VITE_SUPABASE_*` variables and the schema from `supabase/schema.sql`.
