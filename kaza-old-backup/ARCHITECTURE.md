     │       │    │
                   │  │                                   │       │    │
                   │  │                                   │       │    │
                   │  └─────────────────────────────────┘       │    │
                   │                                            │    │
                   └────────────────────────────────────────────┘    │
                                                                    │
                                     │                              │
                                     ▼                              │
                   ┌─────────────────────────────────┐             │
                   │      REFINEMENT AGENT         │             │
                   │                                 │             │
                   │ Input: User edits & feedback    │             │
                   │ Process:                          │             │
                   │  1. Parse edit intentions       │             │
                   │  2. Query appropriate APIs      │             │
                   │  3. Regenerate specific parts   │             │
                   │  4. Update itinerary            │             │
                   │                                 │             │
                   │ Output: Revised itinerary       │             │
                   └─────────────────────────────────┘             │
                                                                   │
                                     │                             │
                                     ▼                             │
                          ┌───────────────────┐                   │
                          │   SAVE & EXPORT   │◄──────────────────┘
                          └───────────────────┘

```

### API Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW DIAGRAM                               │
└─────────────────────────────────────────────────────────────────────────────┘

[1] USER ONBOARDING
    │
    ├─► Frontend: Collect preferences (home, dates, budget, interests)
    │
    ├─► API: POST /api/trips
    │    │
    │    ├─► Store user preferences
    │    ├─► Create trip record (status: 'drafting')
    │    └─► Trigger Discovery Agent
    │
    └─► Agent: Generate 5+ destination options
         │
         ├─► Query destinations DB (filter matching tags)
         ├─► Score destinations by preference match
         └─► Fetch flight price estimates (cached or real-time)

[2] DESTINATION COMPARISON
    │
    ├─► Frontend: User selects destinations to compare
    │
    ├─► API: POST /api/compare
    │    │
    │    └─► Trigger Comparison Agent
    │
    └─► Agent: Build comparison table
         │
         ├─► Amadeus: Flight price calendar (date flexibility)
         │    └─► Cache results (2h TTL)
         │
         ├─► Amadeus/Hotel: Accommodation estimates
         │    └─► Cache results (4h TTL)
         │
         ├─► Viator: Top 5-10 activities
         │    └─► Cache results (24h TTL)
         │
         └─► Aggregate:
              ┌─────────────────────────────────────────┐
              │  Destination  │ Flights│ Hotels│ Act   │
              ├─────────────────────────────────────────┤
              │  Paris       │ $650   │ $150  │ $40   │
              │    (May 10)  │        │ /night│ /day  │
              │  vs          │ $580   │ $120  │ $35   │
              │  Rome        │        │       │       │
              │    (May 15)  │        │       │       │
              └─────────────────────────────────────────┘

[3] ITINERARY BUILDING
    │
    ├─► User selects destination & dates
    │
    ├─► API: POST /api/itinerary/generate
    │    │
    │    └─► Trigger Itinerary Agent
    │
    └─► Agent: Build day-by-day schedule
         │
         ├─► Amadeus: Final flight booking options
         │
         ├─► Hotels: Options per night (by budget %)
         │
         ├─► Viator: Activities by interest + location
         │    ├─► Mix of major attractions
         │    └─► Hidden gems based on reviews
         │
         ├─► Google Places: Restaurants by day
         │    ├─► Lunch: casual/walkable
         │    └─► Dinner: special/romantic
         │
         ├─► Agent Logic:
         │    ├─► Rest days after long flights/timezone changes
         │    ├─► Flexible blocks ("morning: activity A OR B")
         │    ├─► Geographic clustering (activities near each other)
         │    └─► Budget check per category
         │
         └─► Save to: itineraries table

[4] REFINEMENT LOOP
    │
    ├─► User edits ("swap Day 3 and Day 5", "cheaper hotel on Day 2")
    │
    ├─► API: POST /api/itinerary/refine
    │    │
    │    └─► Trigger Refinement Agent
    │
    └─► Agent: Partial regeneration
         │
         ├─► Parse edit intent via NLP
         ├─► Query only affected components
         ├─► Preserve unchanged days
         └─► Update cache if new API calls made

[5] FINALIZATION
    │
    ├─► User confirms itinerary
    │
    ├─► API: POST /api/trip/confirm
    │    │
    │    ├─► Update trip.status → 'booked'
    │    ├─► Mark itinerary.is_selected = TRUE
    │    └─► Generate deep links to:
         │    ├─► Amadeus booking page
         │    ├─► Booking.com (affiliate)
         │    └─► Viator activities
         │
    └─► Email confirmations (future)
```

---

## 5. Development Roadmap

### Phase 1: MVP (6-8 weeks)

**Goal:** Zack can plan his honeymoon from start to finish

**Week 1-2: Foundation**
- [ ] Next.js project scaffold with TypeScript
- [ ] Supabase setup and schema migration
- [ ] Authentication (NextAuth with Google OAuth)
- [ ] Basic layout & navigation
- [ ] Design system with shadcn/ui

**Week 3-4: Discovery & Comparison**
- [ ] Onboarding flow (preferences capture)
- [ ] Destination discovery agent integration
- [ ] Destination comparison page
- [ ] Amadeus flight price calendar integration
- [ ] Hotel estimate display
- [ ] Cache layer implementation

**Week 5-6: Itinerary Building**
- [ ] Itinerary generation agent
- [ ] Day-by-day builder view
- [ ] Activity search (Viator API)
- [ ] Restaurant recommendations (Google Places)
- [ ] Budget tracker UI
- [ ] Date flexibility optimizer

**Week 7-8: Refinement & Polish**
- [ ] Edit/swap functionality
- [ ] Save/load functionality
- [ ] Responsive mobile design
- [ ] Basic error handling
- [ ] Performance optimization
- [ ] Zach's honeymoon planning session

**MVP Success Metrics:**
- Zack successfully plans honeymoon
- < 5 second page load
- < 30 second itinerary generation
- 90%+ agent task completion

---

### Phase 2: Post-Validation (8-10 weeks)

**Goal:** Production quality, ready for first 100 users

**Core Features:**
- [ ] Real-time pricing updates (less aggressive caching)
- [ ] User accounts & authentication polish
- [ ] Trip sharing (view-only links)
- [ ] PDF export of itinerary
- [ ] Calendar export (.ics)
- [ ] Multi-city trip support
- [ ] "Inspired by" curated trips
- [ ] Email notifications (booking reminders)

**Technical:**
- [ ] Rate limiting & abuse prevention
- [ ] API error monitoring
- [ ] Usage analytics
- [ ] Automated testing suite
- [ ] Backup/recovery procedures

**Monetization Prep:**
- [ ] Booking.com affiliate integration
- [ ] Viator commission tracking
- [ ] Analytics for conversion funnel

---

### Phase 3: Scale & Monetization (Ongoing)

**Goal:** Sustainable business, 1000+ users

**Growth Features:**
- [ ] AI-powered "Perfect Match" scoring
- [ ] Community reviews of itineraries
- [ ] Template marketplace
- [ ] Group planning (friends/family input)
- [ ] Mobile app (React Native or PWA)
- [