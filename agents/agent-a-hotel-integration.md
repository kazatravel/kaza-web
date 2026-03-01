# Agent A: Hotel Integration Task

**Deadline:** 10:30 MST (2 hours)  
**Model:** google/gemini-3-flash-preview  
**Priority:** CRITICAL

## Your Mission

Build a complete hotel search API integration using the Amadeus Hotel API. This MUST return real hotel data with real prices.

## Requirements

1. **API Endpoint:** `/app/api/hotels/route.ts`
   - Method: GET
   - Query params: `destination` (city or IATA code), `checkIn` (YYYY-MM-DD), `checkOut` (YYYY-MM-DD), `adults` (number)
   - Response: Array of hotels with name, address, price, rating, image, amenities

2. **Amadeus Integration:**
   - Credentials available in `/data/.openclaw/workspace/projects/kaza/API_KEYS.md`
   - Use Amadeus Hotel Search API v3
   - Fetch 10-20 hotel results per search
   - Include: price per night, total price, currency, hotel name, rating, location

3. **Error Handling:**
   - Invalid dates → return error message
   - No results → return empty array with message
   - API failure → retry once, then return error

4. **Testing:**
   - Test query: LAX → Paris, 2025-06-01 to 2025-06-05, 2 adults
   - Verify real prices are returned
   - Log sample response to file: `/data/.openclaw/workspace/projects/kaza/agents/agent-a-test-results.json`

## Deliverables

1. Working `/app/api/hotels/route.ts` file
2. Test results file proving it works with real data
3. Brief documentation in `/data/.openclaw/workspace/projects/kaza/agents/agent-a-COMPLETE.md`

## Code Location

Work in: `/data/.openclaw/workspace/projects/kaza/kaza-app/`

## Success Criteria

- [ ] API endpoint returns real hotel data
- [ ] Prices are actual numbers (not "from $XX")
- [ ] Can be called from frontend
- [ ] Tested with at least 2 different destinations
- [ ] No mock data, no placeholders

## Report When Done

Write a completion report to: `/data/.openclaw/workspace/projects/kaza/agents/agent-a-COMPLETE.md`

Include:
- What you built
- How to test it
- Any issues encountered
- Sample API response

**START NOW. DEADLINE: 10:30 MST.**
