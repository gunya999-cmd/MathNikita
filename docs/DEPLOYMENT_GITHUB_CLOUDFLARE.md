# GitHub + Cloudflare workflow

## Rule

All development is committed to GitHub. Local PowerShell is no longer part of the normal workflow.

## Branches

- `feature/olympiad-foundation` — current development branch.
- `main` — production branch.

## Automatic checks

Every push to `main` or `feature/**` runs `.github/workflows/ci.yml`:

1. checkout;
2. Node.js 22 setup;
3. `npm ci`;
4. TypeScript + Vite production build;
5. upload of the `dist` artifact.

A pull request cannot be considered ready until the CI build succeeds.

## Automatic production deployment

Every push to `main` runs `.github/workflows/deploy-cloudflare.yml`:

1. production build;
2. deployment with Wrangler;
3. Cloudflare Worker `mathnikita` serves the SPA assets from `dist`.

## Required GitHub repository secrets

Repository settings → Secrets and variables → Actions:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The Cloudflare token must have permission to edit Workers Scripts for the target account.

## Release flow

1. Changes are committed to the feature branch.
2. GitHub Actions verifies the build.
3. The pull request is merged into `main`.
4. GitHub Actions deploys the new production version to Cloudflare automatically.

## Rollback

Revert the problematic commit in GitHub or redeploy a previous commit with `workflow_dispatch` after checking out that revision in a recovery branch.
