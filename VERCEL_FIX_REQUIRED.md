# Vercel Deployment Fix Required

## Problem
The deployment is consistently failing because the Vercel project configuration likely still has the "Root Directory" set to `kaza-app`, but the app was moved to the repository root in commit `aeefeea`.

## Solution
You need to update the Vercel project settings:

1. Go to https://vercel.com and log in
2. Navigate to your project (kaza-web or kaza-web-1)
3. Go to Settings > General
4. Find the "Root Directory" setting
5. Change it from `kaza-app` to `.` (just a dot, meaning root) or leave it empty
6. Click "Save"
7. Go to the Deployments tab
8. Click "Redeploy" on the latest deployment

## What We've Fixed in Code
- ✅ Added `package-lock.json` for consistent dependencies
- ✅ Added `engines` field specifying Node.js >= 18.17.0
- ✅ Added `.nvmrc` with Node 18.17.0
- ✅ Removed deprecated `images.domains` config
- ✅ Removed `dist` reference from tsconfig.json
- ✅ Created explicit `vercel.json` with build commands

## Local Build Status
✅ `npm run build` works perfectly on local machine

## Next Steps After Vercel Config Update
After changing the Root Directory setting in Vercel dashboard, the deployment should succeed automatically on the next push.
