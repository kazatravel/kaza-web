# Agent C: Multi-Destination Backend

**Deadline:** 11:00 MST (2.5 hours)  
**Model:** google/gemini-3-pro-preview  
**Priority:** CRITICAL

## Your Mission

Enable users to plan trips with MULTIPLE destinations (not just single city). This requires backend data model changes and a new API endpoint.

## Requirements

1. **Database Schema Updates (Supabase):**
   - Update `trips` table to support multi-destination
   - Add `destinations` field (JSONB array): `[{city: "Paris", country: "France", arrival: "2025-06-01", departure: "2025-06-05"}, ...]`
   - Each destination has: name, country, arrivalDate, departureDate, airport (IATA)
   - Support up to 5 destinations per trip

2. **API Endpoint:** `/app/api/trip/multi/route.ts`
   - Method: POST
   - Body: `{origin: "LAX", destinations: [{city: "Paris", checkIn: "2025-06-01", checkOut: "2025-06-05"}, ...], travelers: 2}`
   - Response: For each destination, return:
     - Flight options (from previous city or origin)
     - Hotel options
     - Total cost estimate
     - Days in city

3. **Multi-City Flight Logic:**
   - Query Amadeus for multi-city flights
   - Example: LAX → Paris → Rome → LAX
   - Calculate total flight cost
   - Show per-leg pricing

4. **Testing:**
   - Test case: LAX → Paris (3 days) → Rome (4 days) → LAX
   - Verify flights and hotels for both destinations
   - Log results to: `/data/.openclaw/workspace/projects/kaza/agents/agent-c-test-results.json`

## Deliverables

1. Updated Supabase schema (SQL migration script)
2. Working `/app/api/trip/multi/route.ts`
3. Test results proving multi-city works
4. Documentation: `/data/.openclaw/workspace/projects/kaza/agents/agent-c-COMPLETE.md`

## Code Location

Work in: `/data/.openclaw/workspace/projects/kaza/kaza-app/`

## Success Criteria

- [ ] Database supports multiple destinations
- [ ] API returns flights + hotels for each city
- [ ] Multi-city flight pricing works
- [ ] Tested with 2-3 destination trip
- [ ] No fake data

## Supabase Access

URL and keys in: `/data/.openclaw/workspace/projects/kaza/API_KEYS.md`

## Report When Done

Write completion report to: `/data/.openclaw/workspace/projects/kaza/agents/agent-c-COMPLETE.md`

**START NOW. DEADLINE: 11:00 MST.**
