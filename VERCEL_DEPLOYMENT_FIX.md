# Vercel Deployment Fix - kaza-web Project

## Status
- ✅ **kaza-web-1**: Deploying successfully
- ❌ **kaza-web**: Failing (needs configuration fix)

## Problem Identified
Both Vercel projects deploy from the same GitHub repository (`kazatravel/kaza-web`) and the same commit, but one succeeds while the other fails. This confirms the issue is **not in the code** but in the **Vercel project configuration**.

## Root Cause
The `kaza-web` project configuration still has the **Root Directory** set to `kaza-app` (old location), but the app was moved to the repository root in a previous commit. Meanwhile, `kaza-web-1` has the correct configuration.

## Failure Details
- **Commit**: `05db3061f20346ea821deb11e7895231f48ea056`
- **Failure URL**: https://vercel.com/m82dtykhth-4615s-projects/kaza-web/FNTNdAroMgTqD72BHJDVzYHYk2ny
- **Success URL** (kaza-web-1): https://vercel.com/m82dtykhth-4615s-projects/kaza-web-1/HCkknACQrZ4X52sPM3CqdxkbttkD

---

## Fix Instructions

### Step 1: Check the Failure Log
1. Visit: https://vercel.com/m82dtykhth-4615s-projects/kaza-web/FNTNdAroMgTqD72BHJDVzYHYk2ny
2. Review the error message (likely "Cannot find module" or "ENOENT: no such file")
3. This confirms the root directory mismatch

### Step 2: Update Root Directory (PRIMARY FIX)
1. Go to: https://vercel.com/m82dtykhth-4615s-projects/kaza-web/settings
2. Click **"General"** in left sidebar
3. Find **"Root Directory"** section
4. **Change from**: `kaza-app`
5. **Change to**: `.` (single dot) **OR** leave empty
6. Click **"Save"**

### Step 3: Verify Other Settings
While in Settings > General, verify:

**Framework Preset:**
- Should be: **Next.js** (auto-detected)
- If not, select it from dropdown

**Build & Development Settings:**
- Build Command: `npm run build` (or leave as default)
- Install Command: `npm install` (or leave as default)  
- Output Directory: `.next` (default)

**Node.js Version:**
- Should be: **18.x** or **20.x** (matches engines in package.json)

### Step 4: Check Environment Variables
Go to Settings > Environment Variables and ensure these are set:
```
NEXT_PUBLIC_SUPABASE_URL=[your-value]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-value]
SUPABASE_SERVICE_ROLE_KEY=[your-value]
```

💡 **Tip**: Compare with kaza-web-1 environment variables to ensure they match.

### Step 5: Redeploy
1. Go to the **Deployments** tab
2. Find latest deployment (commit `05db306...`)
3. Click **"⋯"** (three dots) → **"Redeploy"**
4. **OR** trigger a new deployment by pushing a new commit

### Step 6: Monitor Results
Run the monitoring script:
```bash
cd /data/.openclaw/workspace/projects/kaza
./monitor_vercel.sh
```

This will track both projects and show live status updates.

---

## Why This Happened
The repository structure changed when the app was moved from the `kaza-app/` subdirectory to the repository root. The `kaza-web-1` project was likely created after this change (or updated), while `kaza-web` retained the old configuration pointing to `kaza-app/`.

## Expected Outcome
After fixing the Root Directory setting:
- ✅ Both `kaza-web` and `kaza-web-1` should deploy successfully
- ✅ Build time: ~1-2 minutes
- ✅ Monitoring script will show both projects as SUCCESS

---

## What Was Already Fixed in Code
The following repo-level fixes have already been implemented:
- ✅ Added `package-lock.json` for consistent dependencies
- ✅ Added `engines` field specifying Node.js >= 18.17.0
- ✅ Added `.nvmrc` with Node 18.17.0
- ✅ Removed deprecated `images.domains` config
- ✅ Removed `dist` reference from tsconfig.json
- ✅ Created explicit `vercel.json` with build commands
- ✅ Local build verified working: `npm run build` succeeds

## Monitoring Script Updates
The `monitor_vercel.sh` script has been updated to:
- Track **both** kaza-web and kaza-web-1 projects simultaneously
- Show real-time status for each project
- Display deployment URLs for both
- Exit successfully only when **both** projects succeed

---

## If Still Failing
If the deployment still fails after the Root Directory fix:

1. **Check build logs** in Vercel dashboard for specific error
2. **Compare settings** between kaza-web and kaza-web-1 projects side-by-side
3. **Verify environment variables** match exactly
4. **Check Vercel project region** - ensure they're in the same region
5. **Check Git connection** - ensure both are connected to the same branch

## Need Help?
Run the monitoring script and share the output:
```bash
cd /data/.openclaw/workspace/projects/kaza
./monitor_vercel.sh
```

This will show the current status and provide deployment URLs for debugging.
