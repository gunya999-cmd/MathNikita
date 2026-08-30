# MathNikita

Clean MVP for an AI math tutor.

## Stack

- Vite
- React
- TypeScript
- Supabase JS client
- Cloudflare Worker + static assets
- Gemini TTS for one consistent Russian narration voice across devices

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

The primary narrator and the Pythagoras mentor use the same server-side AI voice profile: **Sulafat**.

Production narration uses:

1. `gemini-2.5-flash-preview-tts` as the primary model;
2. `gemini-2.5-pro-preview-tts` as a same-voice fallback when Flash is rate-limited or temporarily unavailable.

Both models use the same `Sulafat` voice. There is no automatic fallback to device `speechSynthesis` while AI/studio mode is selected, and narration does not automatically switch to OpenAI/Marin.

Production requires the Worker secret `GEMINI_API_KEY`:

```bash
npx wrangler secret put GEMINI_API_KEY
```

Do not commit API keys to the repository. `wrangler.jsonc` declares `GEMINI_API_KEY` as a required secret.

The Worker keeps generated narration in Cloudflare Cache API. The narration cache version remains stable while the voice profile is unchanged so previously generated Sulafat clips can be reused instead of consuming TTS quota again.

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

For local Worker narration, configure `GEMINI_API_KEY` as a local Worker secret/environment variable rather than exposing it to Vite client code.

The app can open in demo mode without Supabase variables.
