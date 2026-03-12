# Kaza - AI Trip Planning Platform

## Vision
AI-powered trip planning platform that starts from ideation and builds complete, customized itineraries with real pricing.

## Target Users
1. **Primary:** Couples planning honeymoons (high-intent, high-budget marketing niche)
2. **Secondary:** All travelers who want:
- Inspiration OR specific trip planning
- Multiple options to compare
- Budget optimization across categories
- Detailed day-by-day itineraries
- One interactive interface to refine everything

## MVP Scope
Build for Zack's own honeymoon first, then generalize.

## Core Features

### Entry Modes
1. **Inspiration Mode** - user has zero ideas or general interests
   - Later: monetize with sponsored packages
2. **Specific Need Mode** - "honeymoon, 2 weeks, $X budget"

### Discovery Workflow
1. Ask questions to understand preferences
2. Present 5+ location options (safe → obscure)
3. Brief descriptions of WHY each was picked
4. User narrows down through comparison workflow
5. Can edit components and continue comparing
6. Worldwide scope (ask for context if too broad)

### Budget Management
- Ask for total budget upfront
- Follow-up: balance between lodging/food/flights/activities
- Track categories: flights, accommodation, activities, food, transportation, buffer
- Warn if budget too low
- Show if budget is low/medium/high for their goals
- Suggest money-saving options
- **DATE FLEXIBILITY FOR PRICING** - show best dates for different price points

### Itinerary Building
- Day-by-day schedules (high-level, not hour-by-hour)
- Flexible blocks ("morning: activity A or B")
- User can swap days/activities
- Ask about rest days only for: overnight flights OR 8+ hour timezone changes
- Include:
  - Hotel options within budget
  - Flights to/from/within country
  - Activity costs
  - Restaurant/bar recommendations
  - Food scene highlights
  - Wine scene (if relevant)
  - Safety considerations

### Personalization (collect & store)
- Home city
- Dates (specific vs flexible)
- Trip length
- Interests: outdoors, culture, food/wine, beaches, adventure, relaxation, nightlife, history, etc.
- Physical activity level (low/medium/high)
- Must-haves or deal-breakers
- Store preferences for repeat users

### Data Sources
- **Phase 1 (MVP)**: Base APIs to get working
  - Flight pricing API (Amadeus, Skyscanner, or similar)
  - Hotel pricing API (Booking.com, Hotels.com, or similar)
  - Activities (curated + APIs later)
  - Restaurants (Google Places or curated)
  - Safety data (Travel.State.Gov)
- **Phase 2**: Add more APIs and real-time pricing

### Output
- Interactive web page (one-stop shop)
- User can continuously refine
- Later: exports to PDF, calendar, etc.

## Technical Requirements

### Stack (to be determined by team)
- Non-technical founder (Zack) - needs to be maintainable
- Foundational architecture for long-term
- Integration with OpenClaw agents for AI orchestration
- User accounts and preference storage
- Real-time pricing where possible

### Constraints
- Zero budget except APIs
- Must be 90%+ agent-runnable after launch
- Fast time to MVP (Zack wants to use it for his honeymoon)

## Success Criteria (MVP)
1. Zack can plan his honeymoon using it
2. Produces quality itineraries with real pricing
3. Workflow is intuitive and efficient
4. Foundation is solid for scale/monetization

## Monetization Strategy (Post-MVP)
1. Affiliate revenue (booking.com, Expedia, airlines)
2. Sponsored packages (hotels, destinations)
3. Premium itinerary service
4. White-label for travel agencies

## Timeline
- MVP: Build ASAP for Zack's use
- Refinement: Based on Zack's feedback
- Scale: After validation

## Team Roles
- Project Manager/Architect - owns vision, coordinates team
- Backend Developer - APIs, data models, agent integration
- Frontend Developer - web UI/UX
- Research Agent - API evaluation, data sources, travel intelligence

## Model Usage
- Use **Claude Haiku 4.5** (`anthropic/claude-haiku-4-5`) for:
  - Code generation
  - Research tasks
  - API documentation review
  - Architecture planning
- Use Sonnet/Opus only if Haiku insufficient for complexity

---

**Project Owner:** Zack
**CAO/Coordinator:** Jackson
**Start Date:** 2026-02-25
