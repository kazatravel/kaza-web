# Kaza - Strategic Roadmap & Burndown

**Status:** 🟡 RECOVERY MODE (Fixing "Garbage" Status)
**Goal:** Transform barebones MVP into a "Cool, Modern, Sleek" AI-backed platform.
**Owner:** Jackson (CAO)

## 🚨 Immediate Fixes (The "Stop Being Garbage" List)

These are high-priority tasks to execute NOW.

- [ ] **Real Data Integration** (Stop using mock data)
    - [ ] Connect Supabase to `route.ts` (Active)
    - [ ] Populate database with real destination data (50+ locations)
- [ ] **AI Search Integration**
    - [ ] Replace simple filter with Perplexity/LLM-backed search
    - [ ] Implement "Inspiration Mode" vs "Specific Mode" logic
- [ ] **UI Overhaul (Modern/Sleek)**
    - [ ] Replace basic cards with high-quality image grids
    - [ ] Add "Vibe" selector (visual, not just text)
    - [ ] Improve typography and spacing (Shadcn/Tailwind refinement)

## 📉 Burndown List (Features from Project Brief)

### Phase 1: Core Experience (Current Sprint)

#### 1. Discovery & Search
- [ ] **Entry Modes:**
    - [ ] Inspiration Mode (I don't know where to go)
    - [ ] Specific Need Mode (Honeymoon, 2 weeks, $5k)
- [ ] **Questionnaire 2.0:**
    - [ ] Visual selection (images for "Beach" vs "Mountain")
    - [ ] Dynamic budget slider with reality check
    - [ ] "Deal breakers" toggle
- [ ] **AI Matching Engine:**
    - [ ] Logic to select 5 distinct options (Safe → Obscure)
    - [ ] "Why this matches you" generated text

#### 2. Destination Comparison
- [ ] **Rich Destination Cards:**
    - [ ] High-res hero images
    - [ ] Vibe tags (Romantic, Adventure, Foodie)
    - [ ] Best time to visit (visual graph)
- [ ] **Comparison View:**
    - [ ] Side-by-side comparison of 2-3 selected locations
    - [ ] Cost breakdown comparison

#### 3. Real Pricing & Data
- [ ] **Flight Estimates:**
    - [ ] Integrate Amadeus/Skyscanner API for *real* estimates
- [ ] **Hotel/Lodging:**
    - [ ] Integrate Booking.com/Hotels API or reliable proxy
- [ ] **Budget Optimizer:**
    - [ ] "Date Flexibility" pricing (Show cheaper dates)

### Phase 2: Itinerary Builder (Next Sprint)
- [ ] Day-by-day block builder
- [ ] Drag-and-drop activity swapping
- [ ] "Rest Day" logic implementation

## 🛠 Active Agent Workstreams

I am orchestrating these agents *right now*.

| Agent | Role | Current Task | Status |
|-------|------|--------------|--------|
| **Architect** | Strategic | Defining the "Modern/Sleek" UI spec & stack | 🟡 Pending |
| **Backend** | Data/API | connecting Supabase & switching to Real AI Search | 🟡 Pending |
| **Frontend** | UI/UX | Implementing new "Sleek" design system | 🟡 Pending |
| **Researcher**| Data | Gathering real destination data for DB population | 🟡 Pending |

---

**Last Updated:** 2026-02-25 20:07 MST
