# MathNikita

Clean MVP for an AI math tutor.

## Stack

- Vite
- React
- TypeScript
- Supabase JS client
- Static deployment to Cloudflare Pages

No TanStack Start SSR, no Cloudflare Workers SSR, no Lovable runtime, no Codex-generated legacy code, no heavy markdown or diagram dependencies.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment variables

Create `.env.local` if using Supabase locally:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

The app can open in demo mode without Supabase variables.
