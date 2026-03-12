# Agent B: Airport Selection UI

**Deadline:** 10:00 MST (1.5 hours)  
**Model:** google/gemini-3-flash-preview  
**Priority:** CRITICAL

## Your Mission

Replace the current "home city" text input with a proper airport selector that FORCES users to pick a specific airport (IATA code). No free-text allowed.

## Requirements

1. **Component:** Create or update `/components/ui/airport-picker.tsx`
   - Autocomplete search (type "Los Angeles" → shows LAX, BUR, SNA, etc.)
   - Display: Airport name, city, IATA code (e.g., "Los Angeles International (LAX)")
   - Returns: IATA code only
   - Must select from dropdown (no free text submission)

2. **Data Source:**
   - Use static JSON file of airports (find or create `/lib/airports.json`)
   - Include top 500 airports worldwide
   - Fields: iata, name, city, country

3. **Integration:**
   - Replace home city input in the questionnaire/form
   - Update form submission to use airport IATA code
   - Pass to API calls as `origin` parameter

4. **UX:**
   - Fast search (instant filtering as user types)
   - Keyboard navigation (arrow keys + Enter)
   - Mobile-friendly

## Deliverables

1. Working airport picker component
2. Airports data file (`/lib/airports.json`)
3. Updated form component using the picker
4. Test: User cannot submit without selecting valid airport

## Code Location

Work in: `/data/.openclaw/workspace/projects/kaza/kaza-app/`

## Success Criteria

- [ ] User must select from dropdown (no free text)
- [ ] Shows IATA codes clearly
- [ ] Search works instantly
- [ ] Integrated into main form
- [ ] Mobile responsive

## Report When Done

Write completion report to: `/data/.openclaw/workspace/projects/kaza/agents/agent-b-COMPLETE.md`

**START NOW. DEADLINE: 10:00 MST.**
