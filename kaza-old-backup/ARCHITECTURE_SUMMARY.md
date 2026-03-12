# Honeymoon Planner - Architecture Summary (Executive Brief)

**For:** Zack (Product Owner)  
**Prepared by:** Jackson (CAO)  
**Date:** 2026-02-25  

---

## TL;DR

**Stack:** Next.js 14 + TypeScript + PostgreSQL (Neon) + Vercel  
**Cost:** $0/month for MVP, ~$20-50/month after 1000 users  
**Timeline:** 6 weeks to working MVP  
**Maintainability:** 90% agent-driven after launch  

---

## Key Decisions

### ✅ Technology Choices

| Component | Choice | Why |
|-----------|--------|-----|
| **Frontend** | Next.js 14 (App Router) | Single codebase, zero-config deploy, agent-friendly |
| **Backend** | Next.js API Routes | Serverless, no separate infra needed |
| **Database** | PostgreSQL (Neon) | Free tier, structured data, scales to millions |
| **Hosting** | Vercel + Neon | 100% free for MVP, git push = deploy |
| **UI Framework** | Shadcn/ui + Tailwind | Modern, customizable, no dependency bloat |

### ✅ API Selections

| Need | API | Cost (MVP) | Reasoning |
|------|-----|------------|-----------|
| **Flights** | Amadeus Flight Offers Search | **FREE** (10K calls/month) | Best data quality, date flexibility support |
| **Hotels** | Expedia Rapid API | **FREE** (affiliate program) | 700K properties, booking flow included |
| **Activities** | Viator Partner API | **FREE** (affiliate, 8-12% commission) | 300K activities, TripAdvisor-owned |
| **Restaurants** | Google Places API | **FREE** ($200 monthly credit) | Best global coverage, reliable data |
| **Safety** | Travel.State.Gov | **FREE** (public data) | Official US govt travel advisories |

**Total API cost:** $0/month for first 1000 users (within free tiers)

### ✅ Agent Integration

**4 Core Agents:**
1. **Research Agent** - Discovers destinations, searches APIs
2. **Budget Optimizer** - Analyzes date flexibility, suggests savings
3. **Itinerary Builder** - Creates day-by-day plans
4. **Content Curator** - Writes descriptions, curates restaurants

**How agents work:**
- Frontend calls `/api/agent/{task}` 
- Agent runs in background, posts results via webhook
- Progress streamed to user via Server-Sent Events (SSE)
- Agent actions logged for debugging/improvement

---

## Data Model (Simplified)

```
User → UserPreferences (reusable across trips)
  ↓
TripSession (one per planning attempt)
  ↓
Destinations (5+ options shown during discovery)
  ↓
Trip (selected destination + complete itinerary)
  ├── Flights (outbound/inbound/internal)
  ├── Accommodations (hotel options)
  └── ItineraryDays (day-by-day schedule)
       ├── Activities (tours, attractions)
       └── Restaurants (meals, bars)
```

**Caching Strategy:**
- Flights/hotels: 24h cache (prices change daily)
- Restaurants: 30-day cache (rarely change)
- Agent content: 7-day cache (allows iterative improvement)

---

## MVP Roadmap (6 Weeks)

### Week 1-2: Foundation
- Set up Next.js + Neon + Vercel
- Authentication (email/password)
- Database schema + Prisma ORM
- Agent API endpoints

### Week 3-4: Core Features
- Preference collection UI
- Amadeus + Hotel API integration
- Destination discovery + comparison
- Budget tracking

### Week 5-6: Itinerary Building
- Day-by-day itinerary generation
- Google Places restaurant integration
- Interactive UI (drag-drop, swap activities)
- User testing with Zack

**Success Criteria:**
✅ Zack can plan his honeymoon using it  
✅ Real flight/hotel pricing  
✅ 14-day itinerary with activities + restaurants  
✅ Budget tracking across categories  
✅ Interactive editing  

---

## Cost Projections

| Timeline | Users | Infrastructure | APIs | Total/Month |
|----------|-------|----------------|------|-------------|
| **Months 1-6 (MVP)** | 1-100 | $0 (Vercel/Neon free) | $0 (within free tiers) | **$0** |
| **Months 7-12** | 100-1000 | $20 (Neon scale) | $30 (Google Places) | **$50** |
| **Year 2** | 1000-10K | $80 (Vercel Pro) | $120 (APIs) | **$200** |

**Revenue offsets:**
- Affiliate commissions (Expedia, Viator): 8-12% per booking
- Estimated: $50/booking × 10 bookings/month = $500/month by Month 12
- **Break-even: Month 9-10**

---

## Top Risks & Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **API costs spiral** | Medium | Aggressive caching, rate limits, alert at $10/day |
| **Non-technical maintenance** | Medium | Agent-first architecture, admin panel, external dev on-call |
| **Inconsistent agent output** | High | Validation layers, human review (first 50), feedback loops |
| **Competitor copies** | Medium | Speed to market, niche focus (honeymoons), network effects |
| **Legal/compliance** | Low | Referral service (not travel agent), lawyer review ToS ($1K budget) |

---

## Next Steps (This Week)

**For Zack:**
1. ✅ Review architecture (provide feedback)
2. ⏳ Sign up for Amadeus Self-Service account (free)
3. ⏳ Sign up for Vercel + Neon accounts (both free)
4. ⏳ Define 10 initial destinations for MVP
5. ⏳ Approve API selections

**For Dev Team:**
1. Backend: Set up Next.js project + Prisma schema
2. Frontend: Design UI mockups (Figma)
3. Research: Begin Amadeus API integration + caching
4. Jackson: Write initial agent prompts

**Timeline:** Kick off development Monday if approvals received this week.

---

## Open Questions for Zack

1. **Destination scope:** 10 destinations (US/Europe) or 50+ global in MVP?
2. **User auth:** Email/password only or add Google/Facebook login?
3. **Agent UX:** Show progress ("Searching flights...") or hide backend work?
4. **Pricing display:** Always show "Last updated X hours ago" or only live prices?

---

## Why This Architecture Works

✅ **Non-technical friendly** - Admin panel controls agents, no code changes needed  
✅ **Zero budget** - Free tiers cover MVP completely  
✅ **Production-grade** - No hacks, scales from 1 to 100K users  
✅ **Fast to market** - 6 weeks to working product  
✅ **Monetization-ready** - Affiliate APIs integrated from day one  
✅ **Agent-native** - Built for AI to run 90% of operations  

**This is ready to build.** Full technical details in `ARCHITECTURE.md`.

---

**Status:** Awaiting Zack's approval to proceed  
**Next Meeting:** Review open questions, finalize scope  
**Contact:** Jackson (CAO) - jackson@openclaw  
