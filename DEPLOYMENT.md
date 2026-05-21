# Deployment

Deploy this project as a static site on Cloudflare Pages.

## Cloudflare Pages settings

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

## Environment variables

Set these in Cloudflare Pages project settings if you want Supabase auth enabled:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Do not use service-role keys in this frontend project.

## Notes

The app works in demo mode even without Supabase variables.
