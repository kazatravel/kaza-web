# Kaza - Accelerated Project Plan (24-Hour MVP)

**Mission:** Launch a fully dynamic, AI-driven, user-modifiable Kaza trip planning website with real-time pricing and itinerary comparison by tomorrow morning.
**Deadline:** Monday, March 2nd, 2026, 8:00 AM MST
**Success Criteria:** Users can build, modify, compare, and get real pricing for AI-generated itineraries.
**Operating Principle:** Maximum agent autonomy, continuous execution, proactive blocker resolution.

---

## Strategic Priorities (Tomorrow Morning MVP)

### Phase 1: Foundation & Real-time Data (Hours 1-8) 🎯 **CRITICAL PATH**
**Goal:** Establish core data sources, integrate real-time flight and hotel pricing, and build initial AI recommendation logic.

### Phase 2: Dynamic Itinerary & Comparison (Hours 9-16)
**Goal:** Implement dynamic itinerary modification, build the itinerary comparison tool, and enhance the UI.

### Phase 3: Polish & Launch Readiness (Hours 17-24)
**Goal:** Refine UI, conduct competitor research for best features, implement smart dropdowns, and prepare for immediate launch.

---

## Phase 1: Foundation & Real-time Data (Hours 1-8)

### Milestone 1.1: Core Data & API Integration - Flights (Hours 1-3)
**Objective:** Integrate Amadeus API for real-time flight search and establish Supabase as core database.
**Tasks:**
1.  **Amadeus Flight API Integration:**
    *   Spawn `kaza-flights-api-agent` (Model: Gemini 3 Flash).
    *   Task: Build `/api/flights/search` endpoint using Amadeus API.
    *   Input: `origin`, `destination`, `departureDate`, `returnDate`, `adults`.
    *   Output: `flightOptions` (airlines, prices, times, duration).
    *   Agent will read Amadeus API credentials from `/data/.openclaw/workspace/projects/kaza/config/api_keys.md`.
    *   Agent will create placeholder entries for Amadeus credentials if missing, and report the required format.
2.  **Supabase Setup (Initial):**
    *   Spawn `kaza-supabase-init-agent` (Model: Kimi K2.5).
    *   Task: Configure Supabase project (if not already configured).
    *   Task: Create initial `users` and `itineraries` tables (basic schema: `id`, `user_id`, `name`, `status`, `created_at`).
    *   Agent will verify Supabase credentials are in `api_keys.md`; report if missing.

**Success Criteria:** `/api/flights/search` returns real-time flight data; Supabase tables are ready.
**Primary Agent:** `kaza-flights-api-agent`, `kaza-supabase-init-agent`

### Milestone 1.2: Core Data & API Integration - Hotels (Hours 3-6)
**Objective:** Integrate Booking.com API for real-time hotel search.
**Tasks:**
1.  **Booking.com Hotel API Integration:**
    *   Spawn `kaza-hotels-api-agent` (Model: Gemini 3 Flash).
    *   Task: Build `/api/hotels/search` endpoint using Booking.com API.
    *   Input: `cityCode` (or lat/long), `checkInDate`, `checkOutDate`, `adults`.
    *   Output: `hotelOptions` (name, price, rating, image, location).
    *   Agent will use Booking.com credentials from `api_keys.md`.
    *   Agent will validate if Booking.com offers flight search; if so, update Milestone 1.1 strategy.
    *   Agent will create placeholder entries for Booking.com credentials if missing, and report the required format.

**Success Criteria:** `/api/hotels/search` returns real-time hotel data.
**Primary Agent:** `kaza-hotels-api-agent`

### Milestone 1.3: AI Itinerary Generation & Storage (Hours 6-8)
**Objective:** Implement initial AI to generate itineraries and store them in Supabase.
**Tasks:**
1.  **AI Itinerary Generator:**
    *   Spawn `kaza-ai-itinerary-agent` (Model: Gemini 3 Pro).
    *   Task: Build `/api/itinerary/generate` endpoint.
    *   Input: User preferences (destination, dates, budget, interests, vibe).
    *   Output: A structured itinerary (JSON) with suggested flights, hotels, activities, and food, drawing from real-time data where available (M1.1, M1.2).
    *   Store generated itinerary in Supabase.
2.  **User Itinerary Saving:**
    *   Spawn `kaza-itinerary-save-agent` (Model: Kimi K2.5).
    *   Task: Implement functionality to save/retrieve a user's generated itinerary to/from Supabase.

**Success Criteria:** AI generates a plausible itinerary; itineraries are saved/loaded from Supabase.
**Primary Agent:** `kaza-ai-itinerary-agent`, `kaza-itinerary-save-agent`

---

## Phase 2: Dynamic Itinerary & Comparison (Hours 9-16)

### Milestone 2.1: Dynamic Itinerary Modification UI (Hours 9-12)
**Objective:** Enable users to add, remove, and reorder itinerary items via a sleek UI.
**Tasks:**
1.  **Integrate Existing Itinerary UI:**
    *   Spawn `kaza-itinerary-ui-agent` (Model: Kimi K2.5).
    *   Task: Integrate the existing drag-and-drop itinerary builder (from Git history) into the live application.
    *   Connect UI to Supabase for saving modifications.
2.  **Smart Activity Search/Addition:**
    *   Spawn `kaza-activity-search-agent` (Model: Gemini 3 Pro).
    *   Task: Enhance the itinerary builder with a search function (e.g., "coffee shop near hotel") that uses AI and potentially Google Places API (if applicable for activity search; agent to verify).
    *   Enable users to add search results to their itinerary.

**Success Criteria:** Users can modify itineraries visually; search adds relevant activities.
**Primary Agent:** `kaza-itinerary-ui-agent`, `kaza-activity-search-agent`

### Milestone 2.2: Itinerary Comparer Tool (Hours 12-16)
**Objective:** Develop a tool for users to compare two AI-generated itineraries based on criteria.
**Tasks:**
1.  **Comparison Logic:**
    *   Spawn `kaza-comparer-logic-agent` (Model: Gemini 3 Pro).
    *   Task: Build an endpoint (`/api/itinerary/compare`) that takes two itinerary IDs and compares them based on:
        *   Travel duration (total days/nights).
        *   Total estimated cost (flights, hotels, activities, food).
        *   "Food/Wine" score (AI-derived, based on destination attributes).
        *   "Vibe" compatibility (AI-derived).
    *   Output: A structured comparison (JSON).
2.  **Comparison UI:**
    *   Spawn `kaza-comparer-ui-agent` (Model: Kimi K2.5).
    *   Task: Build a sleek, interactive UI to display the comparison side-by-side.

**Success Criteria:** Users can select two itineraries and see a clear, criteria-based comparison.
**Primary Agent:** `kaza-comparer-logic-agent`, `kaza-comparer-ui-agent`

---

## Phase 3: Polish & Launch Readiness (Hours 17-24)

### Milestone 3.1: UI Enhancements & Smart Dropdowns (Hours 17-20)
**Objective:** Implement a sleek, modern UI with smart input fields for locations.
**Tasks:**
1.  **Global UI Review & Polish:**
    *   Spawn `kaza-ui-polish-agent` (Model: Kimi K2.5).
    *   Task: Review entire application for UI/UX consistency, responsiveness, and aesthetic appeal (sleek and modern). Make adjustments as needed.
2.  **Smart Location/Airport Dropdowns:**
    *   Spawn `kaza-smart-dropdown-agent` (Model: Kimi K2.5).
    *   Task: Implement auto-suggest dropdowns for airport codes and city/location names.
    *   Use a suitable API (e.g., Amadeus for airports, Google Places for cities) for suggestions. Ensure suggestions are relevant and fast.

**Success Criteria:** User experience is smooth and visually appealing; location inputs are intelligent.
**Primary Agent:** `kaza-ui-polish-agent`, `kaza-smart-dropdown-agent`

### Milestone 3.2: Competitor Feature Research & Integration (Hours 20-22)
**Objective:** Identify top features from leading travel platforms and integrate selected ones.
**Tasks:**
1.  **Competitor Research:**
    *   Spawn `kaza-competitor-research-agent` (Model: Gemini 3 Pro).
    *   Task: Research top 3-5 trip planning/booking websites (e.g., Kayak, TripIt, Google Flights/Hotels, Expedia, etc.).
    *   Identify their most compelling features for itinerary building, comparison, and user experience.
    *   Output: A concise `COMPETITOR_FEATURES.md` report.
2.  **Feature Integration (Selected):**
    *   Spawn `kaza-feature-integration-agent` (Model: Kimi K2.5).
    *   Task: Based on the research, implement 1-2 "quick win" high-impact features identified from competitors. This will be an adaptive task based on the research.

**Success Criteria:** A `COMPETITOR_FEATURES.md` report is generated; at least one new high-value feature is integrated.
**Primary Agent:** `kaza-competitor-research-agent`, `kaza-feature-integration-agent`

### Milestone 3.3: Final Checks & Launch Prep (Hours 22-24)
**Objective:** Ensure all systems are go for launch, perform final testing, and deploy.
**Tasks:**
1.  **End-to-End Testing:**
    *   Spawn `kaza-qa-agent` (Model: Kimi K2.5).
    *   Task: Perform comprehensive end-to-end testing of all user flows: itinerary generation, modification, saving, loading, comparison, real-time pricing. Report any critical bugs.
2.  **Deployment (GitHub Actions/Vercel):**
    *   Spawn `kaza-deployment-agent` (Model: Kimi K2.5).
    *   Task: Set up GitHub Actions for continuous deployment to Vercel (using your provided PAT for GitHub and assuming a Vercel project already linked to the repo).
    *   Trigger final deployment.
3.  **Documentation Update:**
    *   Spawn `kaza-docs-agent` (Model: Kimi K2.5).
    *   Task: Update `README.md` with key features, setup instructions, and any relevant API information.

**Success Criteria:** All critical bugs resolved; successful deployment to Vercel; `README.md` updated.
**Primary Agent:** `kaza-qa-agent`, `kaza-deployment-agent`, `kaza-docs-agent`

---

## Agent Orchestration & Blocker Resolution

*   **Around-the-Clock Work:** Agents will be spawned continuously to work through tasks.
*   **Proactive Blocker Resolution:** If an agent encounters a blocker (e.g., missing API keys, environment issues, build failures), I will:
    1.  Attempt to resolve it autonomously using available tools (e.g., reading `api_keys.md`, trying alternative commands).
    2.  If manual input from you is *absolutely required*, I will provide a **detailed, step-by-step overview of what is needed from you to unblock the agent**, with specific instructions and the exact command/information required.
    3.  If a blocker is severe and cannot be resolved quickly, I will strategically shift agent focus to parallel tasks that are not blocked.
*   **Monitoring:** I will actively monitor agent progress and logs for failures or successful completions.

---

## Credentials and Paths

*   **Git PAT:** Stored in `/data/.openclaw/workspace/projects/kaza/config/api_keys.md`
*   **Booking.com OAuth2 Token/Password:** Stored in `/data/.openclaw/workspace/projects/kaza/config/api_keys.md`
*   **Hotelbeds API Key/Secret:** *Currently missing*. Will be needed in `api_keys.md` when the Hotelbeds fallback is considered.
*   **Amadeus API Keys:** *Assumed missing for Kaza*. Agent for M1.1 will identify required keys and report if needed.
*   **Kaza Project Root:** `/data/.openclaw/workspace/projects/kaza`

---

**Zack, this is the comprehensive 24-hour MVP plan for Kaza. Please review it.**

**Once you approve this plan, I will immediately begin spawning the agents for Milestone 1.1 and 1.2 to kick off development.**