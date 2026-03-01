# Kaza - Strategic Project Plan
**Mission:** Transform Kaza from demo to revenue-generating trip planning platform  
**Timeline:** 7 days to working MVP  
**Success Criteria:** Real users can plan real trips with real data

---

## Current State Assessment

**What We Have:**
- ✅ UI shell (Next.js, shadcn/ui, Tailwind)
- ✅ API keys (Gemini, Amadeus, Unsplash, Supabase, Brave Search)
- ✅ Mock data and demo components
- ✅ Deployed to Vercel (https://kaza-app-hazel.vercel.app)
- ✅ Itinerary drag-and-drop UI (just built, not deployed)

**What's Missing (Why It's Not Real):**
- ❌ No real destination data (uses mock JSON)
- ❌ No AI recommendations (Gemini API not integrated)
- ❌ No flight/hotel pricing (Amadeus API not integrated)
- ❌ No user accounts (Supabase auth not set up)
- ❌ No data persistence (everything resets on refresh)
- ❌ No itinerary saving/sharing
- ❌ No payment/monetization

**Reality Check:** Right now, it's a pretty prototype. Nobody can use it for an actual trip.

---

## Strategic Priorities

### Phase 1: Make It Functional (Days 1-3) 🎯 **CRITICAL PATH**
**Goal:** Users can input preferences, get real recommendations, build an itinerary, and save it.

### Phase 2: Make It Useful (Days 4-5)
**Goal:** Add features that make it better than alternatives (Google Docs, TripIt)

### Phase 3: Make It Monetizable (Days 6-7)
**Goal:** Add revenue streams (affiliate links, premium features)

---

## Phase 1: Make It Functional (Days 1-3)

### Milestone 1.1: Real Destination Data & AI Recommendations (Day 1)
**Objective:** Replace mock data with real Gemini-powered recommendations

**Tasks:**
1. **Build Destination Database (Supabase)**
   - Create `destinations` table schema (name, country, region, description, type, best_time, activities, budget_range, coordinates)
   - Seed with 50-100 real destinations (use Gemini to generate structured data)
   - Add vector embeddings for similarity search
   
2. **Integrate Gemini API for Recommendations**
   - Build `/api/recommendations` endpoint
   - Input: User preferences (home city, budget, interests, trip length, dates)
   - Output: 5-10 ranked destinations with "Why this matches you" explanations
   - Use Gemini 2.5 Flash for speed, 3 Pro for quality reasoning
   
3. **Connect Frontend to Real API**
   - Replace mock data in `/app/page.tsx` 
   - Wire up questionnaire form to `/api/recommendations`
   - Display real results with real explanations
   
**Success Criteria:**
- User fills out form → gets real AI recommendations in <5 seconds
- Each destination shows real data (photos, description, pricing estimate)
- "Why recommended" text is personalized to user input

**Agent Assignment:** Backend + AI Integration Agent (Gemini 3 Pro, 4-hour sprint)

---

### Milestone 1.2: Flight & Pricing Integration (Day 1-2)
**Objective:** Show real flight prices and travel costs

**Tasks:**
1. **Integrate Amadeus Flight API**
   - Build `/api/flights/search` endpoint
   - Input: origin, destination, dates, passengers
   - Output: 3-5 cheapest flight options with times, prices, airlines
   
2. **Build Budget Calculator**
   - Estimate total trip cost: flights + lodging + activities + food
   - Use budget ranges from destination data
   - Show breakdown: "3 days in Bali: $1,200 total ($400 flights, $300 hotel, $500 everything else)"
   
3. **Add Pricing to Recommendations**
   - Show flight estimates on each destination card
   - Add "Price flexibility" feature (show cost if dates shift ±3 days)
   
**Success Criteria:**
- User sees real flight prices for each destination
- Prices update based on travel dates
- Budget breakdown shows realistic estimates

**Agent Assignment:** Travel API Integration Agent (Gemini 3 Flash, 3-hour sprint)

---

### Milestone 1.3: User Accounts & Data Persistence (Day 2)
**Objective:** Users can save trips and return to them

**Tasks:**
1. **Set Up Supabase Auth**
   - Enable email/password and Google OAuth
   - Build login/signup UI
   - Add auth middleware
   
2. **Create Trip Storage Schema**
   - `users` table (id, email, created_at)
   - `trips` table (id, user_id, destination, dates, status, preferences, created_at)
   - `trip_items` table (id, trip_id, type, title, date, time, location, notes)
   
3. **Build Save/Load Functionality**
   - "Save Trip" button → creates record in Supabase
   - "My Trips" page shows all saved trips
   - Click trip → loads full itinerary
   
**Success Criteria:**
- User creates account in <60 seconds
- Trip saves and persists across sessions
- User can have multiple trips in progress

**Agent Assignment:** Backend + Auth Agent (Gemini 3 Flash, 3-hour sprint)

---

### Milestone 1.4: Itinerary Builder with Real Data (Day 2-3)
**Objective:** Turn the drag-and-drop UI into a real planning tool

**Tasks:**
1. **Deploy Itinerary UI**
   - Push itinerary components to production
   - Fix any UI bugs
   
2. **Connect to Supabase**
   - Wire up ItineraryBoard to load from `trip_items` table
   - Save changes on drag/drop/edit
   - Add "Add Activity" search (powered by Gemini)
   
3. **Add Activity Search**
   - User types "coffee shop near hotel" → Gemini suggests 3-5 options
   - User types "hiking" → shows local trails with difficulty ratings
   - Each suggestion has: name, location, time estimate, cost
   
4. **Build "Playground" Workflow**
   - User can dump ideas into Playground
   - AI suggests best day/time for each activity
   - User can drag to schedule or leave unplanned
   
**Success Criteria:**
- User can build a day-by-day itinerary
- Activities persist in database
- AI helps find things to do (not just static lists)

**Agent Assignment:** Frontend + Integration Agent (Gemini 3 Pro, 4-hour sprint)

---

## Phase 2: Make It Useful (Days 4-5)

### Milestone 2.1: "Conflict Detection" & Smart Scheduling (Day 4)
**Objective:** Make Kaza smarter than a spreadsheet

**Tasks:**
1. **Time Conflict Detection**
   - Check for overlapping activities
   - Warn if flight lands at 8 PM but dinner reservation is at 7 PM
   - Suggest buffer times between activities
   
2. **Travel Time Estimation**
   - Use Google Maps API to calculate drive/transit times
   - Show "You'll need to leave at 2 PM to make your 3 PM tour"
   - Warn if itinerary is too packed
   
3. **"Realistic Day" Validation**
   - Flag days with >8 hours of activities
   - Suggest rest time
   - Add "Soft Adventure" difficulty ratings
   
**Success Criteria:**
- User gets warnings about impossible schedules
- Travel time shows between activities
- Itinerary feels realistic, not aspirational

**Agent Assignment:** Logic + Validation Agent (Gemini 3 Flash, 3-hour sprint)

---

### Milestone 2.2: Email Ingestion ("Forward to Plan") (Day 4-5)
**Objective:** Compete with TripIt by parsing confirmation emails

**Tasks:**
1. **Set Up Email Endpoint**
   - Create `plans@kaza.ai` (or similar) forwarding address
   - Build webhook to receive forwarded emails
   
2. **Build LLM Parser**
   - Use Gemini to extract: confirmation #, date/time, location, provider
   - Handle: flights (airline, flight #, departure/arrival), hotels (check-in/out), tours, restaurants
   
3. **Auto-Add to Itinerary**
   - Parsed data automatically creates itinerary item
   - User reviews and confirms
   - Handles multi-day bookings (hotel = multiple nights)
   
**Success Criteria:**
- User forwards hotel confirmation → appears in itinerary
- Parser works with Expedia, Booking.com, Airbnb, airlines
- 90%+ accuracy on major booking platforms

**Agent Assignment:** Email Parsing Agent (Gemini 3 Pro, 4-hour sprint)

---

### Milestone 2.3: "Playground to Plan" AI Assistant (Day 5)
**Objective:** Let AI organize the messy brainstorming phase

**Tasks:**
1. **Bulk Idea Import**
   - User pastes list of URLs/notes (e.g., from Google Doc)
   - AI extracts activities and adds to Playground
   
2. **Smart Scheduling**
   - "Schedule my playground items" button
   - AI analyzes locations, times, priorities
   - Suggests optimal day/time for each
   - User reviews and accepts/edits
   
3. **Group Detection**
   - AI notices "3 things near the Eiffel Tower" → suggests grouping them
   - Detects "morning activities" vs "evening activities"
   
**Success Criteria:**
- User dumps 20 unorganized ideas → AI proposes coherent schedule
- Schedule respects constraints (budget, energy level, travel time)
- User can override AI suggestions easily

**Agent Assignment:** AI Planning Agent (Gemini 3 Pro, 3-hour sprint)

---

## Phase 3: Make It Monetizable (Days 6-7)

### Milestone 3.1: Affiliate Revenue Integration (Day 6)
**Objective:** Generate revenue from bookings

**Tasks:**
1. **Integrate Booking.com / Expedia Affiliate APIs**
   - Show hotel options with affiliate links
   - Track clicks and conversions
   
2. **Add Flight Affiliate Links**
   - Partner with Skyscanner or Google Flights (if possible)
   - Earn commission on flight bookings
   
3. **Activity Booking Integration**
   - Integrate GetYourGuide or Viator
   - Show tours/activities with direct booking
   
**Success Criteria:**
- Every destination recommendation has bookable hotels
- Flight results link to booking pages with tracking
- User can book directly from Kaza (or click through)

**Agent Assignment:** Monetization Agent (Gemini 3 Flash, 3-hour sprint)

---

### Milestone 3.2: Premium Features (Day 6-7)
**Objective:** Offer paid tier for power users

**Tasks:**
1. **Define Free vs Premium**
   - **Free:** 3 trips, basic recommendations, manual itinerary building
   - **Premium ($9/mo or $49/yr):** Unlimited trips, AI scheduling, email ingestion, export to Calendar/PDF
   
2. **Implement Stripe Checkout**
   - Add "Upgrade to Premium" flow
   - Gated features check subscription status
   
3. **Build Premium Features**
   - Export itinerary to Google Calendar
   - Download PDF itinerary with maps
   - Priority customer support (email)
   
**Success Criteria:**
- Payment flow works end-to-end
- Premium users get gated features
- Conversion tracking set up

**Agent Assignment:** Payments + Premium Agent (Gemini 3 Flash, 4-hour sprint)

---

### Milestone 3.3: Launch Readiness (Day 7)
**Objective:** Polish and prepare for real users

**Tasks:**
1. **Bug Bash**
   - Test every user flow
   - Fix critical bugs
   - Optimize performance (image loading, API caching)
   
2. **SEO & Landing Page**
   - Write compelling landing page copy
   - Add meta tags, Open Graph images
   - Set up Google Analytics
   
3. **Launch Checklist**
   - Privacy policy + Terms of Service
   - Support email/chat
   - Social media accounts (Twitter, Reddit for launch)
   - Product Hunt submission draft
   
**Success Criteria:**
- Website loads fast (<2s)
- No critical bugs in main flows
- Ready for public launch

**Agent Assignment:** QA + Launch Agent (Gemini 3 Flash, 4-hour sprint)

---

## Success Metrics (Post-Launch)

**Week 1 Goals:**
- 100 sign-ups
- 10 completed itineraries
- 1 paid subscriber

**Month 1 Goals:**
- 1,000 sign-ups
- 100 completed itineraries
- $500 revenue (affiliate + subscriptions)

**Revenue Streams:**
1. Affiliate commissions (flights, hotels, activities)
2. Premium subscriptions ($9/mo)
3. (Future) White-label for travel agents

---

## Agent Orchestration Plan

**How This Gets Executed:**
1. Jackson (me) spawns specialized agents for each milestone
2. Each agent works independently with clear deliverables
3. Daily check-ins: What's done, what's blocked, what's next
4. Handoffs: Backend → Frontend → Integration
5. Testing after each milestone before moving forward

**Agent Labels:**
- `kaza-recommendations-agent` (Milestone 1.1)
- `kaza-flights-agent` (Milestone 1.2)
- `kaza-auth-agent` (Milestone 1.3)
- `kaza-itinerary-agent` (Milestone 1.4)
- `kaza-validation-agent` (Milestone 2.1)
- `kaza-email-parser-agent` (Milestone 2.2)
- `kaza-ai-planner-agent` (Milestone 2.3)
- `kaza-monetization-agent` (Milestone 3.1)
- `kaza-payments-agent` (Milestone 3.2)
- `kaza-launch-agent` (Milestone 3.3)

**Daily Workflow:**
1. Morning: Review progress, spawn next agents
2. Midday: Check on blocked agents, provide guidance
3. Evening: Test completed work, update MEMORY.md
4. Report to Zack: What's done, what's next, any blockers

---

## Risk Management

**Top Risks:**
1. **Rate Limits:** Use multiple models (Gemini, Nexos fallbacks)
2. **API Complexity:** Start simple, add features incrementally
3. **Scope Creep:** Stick to MVP, defer "nice to haves"
4. **Technical Debt:** Refactor after each phase, not at end

**Mitigation:**
- Each milestone is independently testable
- If blocked, move to next parallel milestone
- Daily documentation of decisions/learnings

---

## Next Steps (Right Now)

**Immediate Action (Today):**
1. ✅ Get Zack's approval on this plan
2. Spawn `kaza-recommendations-agent` to start Milestone 1.1
3. Spawn `kaza-flights-agent` to start Milestone 1.2 (parallel)
4. Deploy current itinerary UI to production (5-min task)

**Tomorrow Morning Report:**
- Status of Milestone 1.1 and 1.2
- Demo video of working AI recommendations
- Blockers/questions

---

**Does this plan meet your expectations? Should I adjust priorities or add more detail anywhere?**
