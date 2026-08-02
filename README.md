# MathNikita

Clean MVP for an AI math tutor.

## Stack

- Vite
- React
- TypeScript
- Supabase JS client
- Cloudflare Worker + static assets
- OpenAI TTS for one consistent Russian narration voice across devices

No TanStack Start SSR, no Cloudflare Workers SSR, no Lovable runtime, no heavy markdown or diagram dependencies.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Unified narration

The primary narrator and the Pythagoras mentor use the same server-side AI voice profile (`gpt-4o-mini-tts`, voice `marin`). Device `speechSynthesis` is an emergency fallback only.

Production requires the Worker secret `OPENAI_API_KEY`:

```bash
npx wrangler secret put OPENAI_API_KEY
```

Do not commit API keys to the repository. `wrangler.jsonc` declares `OPENAI_API_KEY` as a required secret so production deploys fail instead of silently shipping without unified narration.

The application visibly discloses that the narration is AI-generated.

## Deploy

```bash
npm run build
npx wrangler deploy
```

## Environment variables

Create `.env.local` if using Supabase locally:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

For local Worker narration, configure `OPENAI_API_KEY` as a local Worker secret/environment variable rather than exposing it to Vite client code.

The app can open in demo mode without Supabase variables.
