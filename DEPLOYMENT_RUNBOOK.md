# Kaza Web — Deployment Runbook (Vercel)

## Production
- **URL:** https://kaza-web-1.vercel.app/
- **Vercel Project:** `kaza-web-1`

## Required Vercel Settings (Project → Settings)
These are the settings that must remain true to avoid NOT_FOUND/404 regressions.

- **Framework Preset:** Next.js
- **Root Directory:** repo root (blank / `.`)
- **Build Command:** `npm run build`
- **Install Command:** `npm install`
- **Output Directory:** blank

### Evidence (local .vercel)
See `.vercel/project.json` (committed in this repo clone) for the last-known-good config snapshot.

## Deploy / Redeploy
### Option A — Vercel Dashboard (manual)
1. Go to Deployments
2. Click the latest deployment → **Redeploy**
3. Confirm it’s **Production** and becomes **Ready**

### Option B — Vercel CLI (requires token)
```bash
vercel pull --yes
vercel --prod
```

## Healthcheck (required after every deploy)
Run:
```bash
./scripts/healthcheck.sh https://kaza-web-1.vercel.app/
```

Pass criteria:
- `HTTP/* 200`
- No `x-vercel-error` header

## If Prod Breaks (NOT_FOUND / 404)
1. Confirm headers:
   ```bash
   curl -sSI https://kaza-web-1.vercel.app/ | head -n 40
   ```
2. Check Vercel **Root Directory** first (common root cause).
3. Pull a short deploy log snippet from the failing deployment.
4. Update `_kaza-web/REMEDIATION_PLAN.md` with:
   - timestamp
   - headers evidence
   - next action + owner
