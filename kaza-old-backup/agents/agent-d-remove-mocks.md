# Agent D: Remove All Mock Data

**Deadline:** 10:30 MST (2 hours)  
**Model:** google/gemini-3-flash-preview  
**Priority:** CRITICAL

## Your Mission

Find and ELIMINATE every single piece of fake/mock/demo data in the Kaza codebase. Everything must be replaced with real API calls or removed entirely.

## Requirements

1. **Audit the Codebase:**
   - Search for: `mock`, `demo`, `fake`, `placeholder`, `sample`, `TODO`, `FIXME`
   - Check: `/lib/mock-data.ts`, API route files, component files
   - List all files with mock data

2. **Replace or Remove:**
   - Mock API responses → Replace with real API calls
   - Hardcoded arrays → Remove or fetch from database
   - Demo users → Remove
   - Sample trips → Remove
   - Placeholder images → Use Unsplash API or remove

3. **Specific Targets:**
   - `/lib/mock-data.ts` - DELETE or replace entirely
   - Any `const mockDestinations = [...]` - DELETE
   - Any `const sampleTrips = [...]` - DELETE
   - Any hardcoded hotel/flight data - DELETE

4. **Documentation:**
   - Create audit report: `/data/.openclaw/workspace/projects/kaza/agents/agent-d-audit.md`
   - List every file changed
   - List every mock removed
   - List any remaining TODOs that need real APIs

## Deliverables

1. Audit report of all mock data found
2. Code changes (delete/replace all mocks)
3. Verification: No more mock data in codebase
4. Completion report: `/data/.openclaw/workspace/projects/kaza/agents/agent-d-COMPLETE.md`

## Code Location

Work in: `/data/.openclaw/workspace/projects/kaza/kaza-app/`

## Success Criteria

- [ ] Zero references to "mock" in code (except comments)
- [ ] No hardcoded arrays of destinations/hotels/flights
- [ ] No demo/sample data that a user could see
- [ ] All removed code documented in audit
- [ ] Codebase is "production ready" (no placeholders)

## Search Commands to Use

```bash
cd /data/.openclaw/workspace/projects/kaza/kaza-app
grep -r "mock" --include="*.ts" --include="*.tsx"
grep -r "demo" --include="*.ts" --include="*.tsx"
grep -r "TODO.*fake\|placeholder" --include="*.ts" --include="*.tsx"
```

## Report When Done

Write completion report to: `/data/.openclaw/workspace/projects/kaza/agents/agent-d-COMPLETE.md`

Include:
- Files audited (count)
- Mocks removed (count)
- Files modified (list)
- Remaining TODOs (if any)

**START NOW. DEADLINE: 10:30 MST.**
