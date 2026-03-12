# Kaza: Feature Masterlist & Product Vision
*Status: Draft | Target Launch: 2025/2026 | Focus: ROBUST Utility + "Soft Adventure" Vibes*

## 1. Must Haves (The Baseline)
*If we don't have these, we aren't a travel planner. We are just a toy.*

- [ ] **Universal "Forward-to-Plan" Ingestion**
    - **The Feature:** Users forward *any* confirmation email (flight, hotel, obscure tour booking) to `plans@kaza.ai` and it parses perfectly.
    - **Why:** TripIt's moat is their parser. If we ask users to manually type in flight numbers, we lose.
    - **Tech:** LLM-powered parsing (more flexible than regex) to handle non-standard receipts (Airbnb, Viator, small tour operators).

- [ ] **The "Bed Check" Visualizer (Gap Analysis)**
    - **The Feature:** A specific timeline view that highlights *where you are sleeping* every single night. Red warning banners for "Homeless Night" (no booking detected between dates).
    - **Why:** The #1 anxiety of travelers is "did I forget to book the hotel for the 14th?". Wanderlog makes this hard to see. Kaza makes it impossible to miss.

- [ ] **Offline-First Architecture**
    - **The Feature:** The entire itinerary, including tickets, reservation numbers, and maps, works without signal.
    - **Why:** "Soft Adventure" means hiking where cell towers don't reach.

- [ ] **Collaborative "Playground" Mode**
    - **The Feature:** A shared canvas where friends can dump links/ideas *before* they are assigned to a day. Drag-and-drop from "Maybe Pile" to "Itinerary".
    - **Why:** Planning is messy. Competitors force you to pick a date immediately. We allow the "messy middle" phase.

## 2. Delighters (The "Unfair Advantage")
*Features that target specific 2026 trends and competitor weaknesses.*

- [ ] **"Not-yet-Tok'd" Radar (The Anti-Viral Filter)**
    - **The Feature:** An AI search filter that explicitly *excludes* top 10 viral spots and suggests "dupes" (e.g., "Instead of Positano, try [Hidden Calabrian Village] - 80% cheaper, same vibes").
    - **Trend:** 69% of Gen Z want places *never* seen on their feed.

- [ ] **"Soft Adventure" Difficulty Ratings**
    - **The Feature:** Activity tags that rate "Effort vs. Comfort".
    - *Example:* "Hike: 4/10 effort. Reward: 10/10 view. Luxury Hotel: 20 mins away."
    - **Trend:** Travelers want nature *and* high thread count sheets.

- [ ] **"Treatonomics" Budgeter**
    - **The Feature:** A budget tool that understands "Splurge vs. Save".
    - *User Input:* "I want to eat cheap street food so I can afford a helicopter tour."
    - *Kaza Action:* Allocates budget accordingly, suggesting $5 meals to save up for the $500 event.

- [ ] **Vibe-Check Sentiment Analysis**
    - **The Feature:** Instead of just "4.5 stars", summarize *who* likes it.
    - *Output:* "Rated high by families, but hated by solo backpackers due to noise."

## 3. Technical Needs (The "How")
*The backend infrastructure required to support the above.*

### Data Sources & APIs
- **Email Parsing:** Fine-tuned LLM (small model like Llama-3-8b or Mistral) specifically for extracting Date/Time/Location/Ref# from messy HTML emails.
- **Maps/POIs:** Google Places API (reliable baseline) + OpenStreetMap (for hiking/trail data that Google misses).
- **Flight Data:** Duffel or Amadeus API for real-time status updates (gate changes, delays).

### Architecture
- **Local-First Database:** Use **RxDB** or **WatermelonDB**. Data lives on the device first, syncs to cloud when online. Critical for the "Offline-First" requirement.
- **Vector Search for "Dupes":** Embed descriptions of popular spots. When a user asks for "Positano vibes", search for vector neighbors that have low "social media mention frequency" scores.

### AI Agents
- **The "Nag" Bot:** A background job that scans the itinerary for logical fallacies (e.g., "You have a dinner reservation at 7 PM in Rome but your train doesn't arrive until 8 PM").
