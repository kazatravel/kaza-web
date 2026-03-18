# Kaza Web Remediation Plan (Get site out of 404 + back on track)

**Incident (historical):** Production URL `https://kaza-web-1.vercel.app/` was returning **Vercel `404: NOT_FOUND`**.

**Current status (as of 2026-03-16):** Prod is responding **HTTP 200** with **no `x-vercel-error`** in repeated checks. This plan is now in **monitor + harden** mode.

**What we know (observed):**
- Historical failure mode: `x-vercel-error: NOT_FOUND` (platform/runtime not serving app routes).
- Current checks (evidence examples):
  - 2026-03-16 05:59 MST: `HTTP/2 200`, `x-vercel-cache: HIT`, no `x-vercel-error`
  - 2026-03-16 06:29 MST: `HTTP/2 200`, `x-vercel-cache: HIT`, no `x-vercel-error`
  - 2026-03-16 06:59 MST: `HTTP/2 200`, `x-vercel-cache: HIT`, no `x-vercel-error`
- Known config risk to prevent regression: Vercel **Root Directory** must be repo root (blank / `.`). See `VERCEL_FIX_REQUIRED.md`.
- Repo hygiene risk: symlink-loop warnings were previously seen inside `_kaza-web/projects` / `_kaza-web/kaza-app`.

## Goal
1) **Stop the 404** and serve the Next.js homepage on `kaza-web-1.vercel.app`.
2) Lock a repeatable, auditable deploy pipeline so we can’t regress.
3) Re-align execution with the roadmap (milestones + owners + verification).

## Constraints / Required Inputs
- To fix Vercel settings and redeploy autonomously, we need one of:
  - **Vercel token** (preferred) for CLI automation, or
  - a one-time manual settings change in the dashboard.

## Phase 0 — Triage & Verification (ETA: 10–20 min)
**0.1 Confirm failure mode**
- `curl -I https://kaza-web-1.vercel.app/` and capture headers.
- Check whether *all* routes 404 or just `/`.

**0.2 Confirm Vercel project configuration**
- Verify **Root Directory**.
- Verify **Framework preset** (Next.js) + build command.

**Exit criteria:** We can reproduce and classify the 404; we know the exact Vercel misconfig.

## Phase 1 — Fix Deployment Config (ETA: 20–40 min)
**1.1 Root Directory correction (most likely fix)**
- Set Vercel project **Root Directory = `.`** (repo root) or blank.
- Redeploy.

**1.2 If still 404: inspect build output**
- Pull build logs.
- Ensure Next.js is actually building routes (App Router under `src/app/page.tsx`).

**Exit criteria:** `https://kaza-web-1.vercel.app/` returns 200 and renders the homepage.

## Phase 2 — Make Deploy Repeatable (ETA: 30–60 min)
**2.1 Remove symlink traps**
- Remove/avoid symlink-loop directories (`projects/`, `kaza-app/`) from the deploy surface.
- Ensure Vercel points at a normal directory layout.

**2.2 Add a deploy sanity script**
- `scripts/healthcheck.sh`:
  - local build
  - `curl` prod URL for 200
  - optionally verify a known route

**2.3 Document exact Vercel settings**
- Write `DEPLOYMENT_RUNBOOK.md`:
  - Root directory
  - build command
  - required env vars
  - rollback procedure

**Exit criteria:** Anyone can redeploy and verify in <5 minutes; the settings are pinned and documented.

## Phase 3 — Execution System (ongoing)
**3.1 Progress tracking**
- Maintain a single source of truth: `PROGRESS_TRACKER.md` + this remediation plan.

**3.2 30-minute reviews**
- Preferred: OpenClaw cron/reminder every 30 minutes that runs the healthcheck + posts status.
- Fallback: HEARTBEAT-driven check.

## Owners / Subagents
- Agent A: Vercel configuration + root directory diagnosis + deployment verification.
- Agent B: Repo hygiene (symlink loops), local build reliability, add healthcheck + runbook.
- Agent C: Roadmap re-sync (milestones, next tasks, acceptance tests) + update tracker.

## Acceptance Tests
- `curl -I https://kaza-web-1.vercel.app/` → HTTP 200
- Homepage loads in browser.
- `/api/*` endpoints return expected JSON (at least one smoke test).

