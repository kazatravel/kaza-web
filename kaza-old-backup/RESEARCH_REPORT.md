# Honeymoon Planner: Research Report
**Research Agent | February 25, 2026**

---

## Executive Summary

This report provides comprehensive research on travel APIs, data sources, and honeymoon planning best practices to support the Honeymoon Planner MVP. Key findings:

- **Best MVP Flight API**: Amadeus Self-Service (3,000 free requests/month, flexible dates support)
- **Best Hotel Data**: Makcorps or Xotelo APIs for price comparison across 200+ OTAs
- **Activities**: Viator/GetYourGuide APIs (partner-based access)
- **Safety Data**: Travel.State.Gov API + CDC Travel Notices (RSS feed)
- **Average Honeymoon Cost**: $5,000-$5,700 for 7 days
- **Monetization**: 3-6% affiliate commissions on bookings

---

## 1. Flight Pricing APIs

### Top Recommendations

#### **🥇 Amadeus Self-Service (RECOMMENDED FOR MVP)**
- **Pricing**: FREE tier with 3,000 API calls/month for Flight Offers Search
- **Flexible Dates**: ✅ YES - Flight Cheapest Date Search API specifically designed for this
- **Rate Limits**: 10 requests/second (test), 40 requests/second (production)
- **Data Quality**: Direct from GDS (Global Distribution System)
- **Pros**:
  - Generous free tier for MVP testing
  - Excellent documentation
  - Pay-as-you-go after free tier
  - Real-time pricing from airlines
  - Supports flexible date search (±3 days calendar view)
- **Cons**:
  - No booking in self-service (search only)
  - Prices are GDS prices (not always cheapest)
- **API Endpoints**:
  - `/v2/shopping/flight-offers` - Search flights
  - `/v1/shopping/flight-dates` - Cheapest dates
  - `/v1/shopping/flight-offers/pricing` - Confirm pricing
- **Link**: https://developers.amadeus.com/

#### **🥈 Duffel API**
- **Pricing**: FREE Starter plan (up to 50 bookings/month), then $99+/month per booking
- **Flexible Dates**: ⚠️ Limited
- **Pros**:
  - Direct airline connections (not GDS aggregator)
  - Full booking capability
  - Modern REST API, great docs
  - ~20+ airlines
- **Cons**:
  - Smaller airline coverage than Amadeus
  - Cost scales per booking (not per search)
- **Best For**: If you need booking capability immediately
- **Link**: https://duffel.com/

#### **🥉 Skyscanner API**
- **Pricing**: Partner-based (must apply, no public pricing)
- **Flexible Dates**: ✅ YES - Strong calendar/flexible search
- **Pros**:
  - Aggregates 100s of airlines and OTAs
  - Best flexible date search UI
  - Powers Skyscanner.com
- **Cons**:
  - Partner approval required (not instant access)
  - Application process takes 2-4 weeks
  - Geared toward businesses with traffic/revenue
- **Best For**: Phase 2, after MVP validation

#### **❌ Google Flights API (QPX Express)**
- **Status**: SHUT DOWN in 2018
- **Alternative**: Use ITA Matrix for manual research only

### API Comparison Table

| API | Free Tier | Flexible Dates | Booking | Access | Best For |
|-----|-----------|----------------|---------|--------|----------|
| Amadeus | 3K calls/mo | ✅ YES | ❌ No | Instant | MVP |
| Duffel | 50 bookings/mo | ⚠️ Limited | ✅ Yes | Instant | Booking focus |
| Skyscanner | N/A | ✅ YES | Via partners | Apply | Phase 2 |
| Kiwi.com | Test token | ✅ YES | ✅ Yes | Apply | Budget focus |

### Flexible Dates Feature Comparison

**Amadeus Flight Cheapest Date Search**:
- Returns prices for ±3 days from selected dates
- Perfect for honeymoon flexibility ("We want to go mid-May, what dates are cheapest?")
- Example: Search May 15 → returns May 12-18 prices

**Skyscanner**:
- Calendar view with prices for entire month
- Best-in-class flexible search
- Requires partner agreement

---

## 2. Hotel & Accommodation APIs

### Top Recommendations

#### **🥇 Makcorps Hotel Price API (RECOMMENDED FOR MVP)**
- **Pricing**: 30 API calls FREE trial (30 days), then paid plans
- **Coverage**: 200+ OTAs (Booking.com, Expedia, Hotels.com, Agoda, etc.)
- **Data**: Real-time price comparison across all OTAs
- **Pros**:
  - One API call returns prices from ALL sources
  - Free trial to test MVP
  - Perfect for "find the cheapest rate" feature
  - JSON response with vendor links
- **Cons**:
  - Display-only (no booking integration)
  - Need to link users to OTA for booking
- **Use Case**: "Hotel X costs $150 on Booking.com, $145 on Expedia" → link to cheapest
- **Link**: https://www.makcorps.com/

#### **🥈 Xotelo Hotel Price API**
- **Pricing**: FREE (display-only)
- **Coverage**: Major OTAs (Booking.com, Expedia, Agoda, Hotels.com)
- **Pros**:
  - Completely free
  - Simple JSON API
  - Good for MVP budget
- **Cons**:
  - Less comprehensive than Makcorps
  - Limited features
- **Link**: https://xotelo.com/

#### **Booking.com API**
- **Type**: Connectivity API (for property managers, not travel apps)
- **Access**: Requires partner agreement
- **Best For**: Phase 2+ if negotiating direct booking deals

#### **Expedia Affiliate (TAAP)**
- **Type**: Affiliate program for travel agents
- **Commission**: 3-6% on hotel bookings
- **Pros**: 
  - Can earn commission on bookings
  - Real booking capability
- **Cons**: 
  - Must become registered travel agent
  - More complex integration
- **Link**: https://www.expediataap.com/

### MVP Strategy for Hotels

**Phase 1 (MVP)**:
1. Use Makcorps or Xotelo to find best hotel prices
2. Display prices with deep links to OTA booking pages
3. User clicks → books on OTA → potentially earn affiliate commission

**Phase 2**:
1. Apply for Booking.com/Expedia affiliate programs
2. Use affiliate links to earn 3-6% commission on bookings
3. Integrate more OTA APIs for better coverage

---

## 3. Activity APIs

### Top Recommendations

#### **🥇 Viator API**
- **Parent**: TripAdvisor
- **Coverage**: Largest tours/activities marketplace globally
- **Pricing**: Partner-based (must apply, commission-based)
- **Commission**: Earn on bookings through their platform
- **Pros**:
  - Massive inventory (300,000+ activities)
  - Strong brand recognition
  - Detailed reviews and ratings
  - Real booking capability
- **Cons**:
  - Partner approval required
  - Application process
  - 2-4 week onboarding
- **Link**: Apply through Viator Partner Program

#### **🥈 GetYourGuide API**
- **Coverage**: 75,000+ tours and activities worldwide
- **Pricing**: Partner-based, documented API
- **Pros**:
  - Strong in Europe and Asia
  - Good documentation
  - Sync + booking automation
  - Family-friendly focus
- **Cons**:
  - Requires certification/agreement
  - Smaller than Viator
- **Link**: https://partner.getyourguide.com/

#### **🥉 Klook API**
- **Coverage**: Strong in Asia-Pacific, expanding globally
- **Pricing**: Merchant/partner model
- **Pros**:
  - Often cheaper than competitors
  - Last-minute deals
  - Bundle discounts
  - Real-time availability/pricing
- **Cons**:
  - Less coverage in US/Europe
  - Requires merchant agreement
- **Best For**: Asia honeymoons

### Competitive Pricing Notes
- **All three platforms often have the same tours at similar prices**
- **Key differentiator**: User reviews, UX, bundle deals
- **Pricing strategy**: 10-15% markup from local operators

### MVP Strategy for Activities

**Phase 1 (Quick MVP)**:
- Curated list of honeymoon activities (manual research)
- Link to activity booking sites (affiliate links if available)
- Use Google Places API to find local activities

**Phase 2**:
- Apply for Viator/GetYourGuide/Klook partner programs
- Integrate API for real-time availability and booking
- Earn commission on bookings (typically 10-15%)

---

## 4. Restaurant & Food Data

### Top Recommendations

#### **🥇 Google Places API**
- **Pricing**: $200/month free credit (covers ~28,000 Basic Data requests)
- **Coverage**: Global, comprehensive
- **Data Provided**:
  - Name, address, coordinates, phone
  - Opening hours
  - Price level ($ to $$$$)
  - Ratings and review count
  - Photos
  - Website URL
- **Pros**:
  - Best coverage globally
  - Generous free tier
  - Easy integration
  - Up-to-date info
- **Cons**:
  - Limited review text in free tier
  - Detailed review data costs more
- **Cost**: After free tier, ~$0.017 per Basic Data request
- **Link**: https://developers.google.com/maps/documentation/places/

#### **🥈 Yelp Places API**
- **Pricing**: 3 tiers (Basic, Enhanced, Premium) - pricing per call, contact for rates
- **Coverage**: Strong in US, Canada, UK; weaker internationally
- **Data Provided**:
  - Business info, hours, photos (up to 12 in premium)
  - Ratings, review counts
  - Review excerpts (up to 7 in premium)
  - Review Highlights endpoint (Premium)
  - Price range, categories
- **Pros**:
  - Rich review data
  - Strong restaurant focus
  - Good for US honeymoons
- **Cons**:
  - Recent pricing controversy (TechCrunch Aug 2024)
  - Weaker international coverage
  - API pricing not transparent (must contact)
- **Link**: https://business.yelp.com/data/products/places-api/

#### **Michelin Guide Data**
- **Status**: No public API
- **Alternative**: Web scraping (not recommended) or manual curation
- **Use Case**: Curated list of Michelin-starred restaurants for luxury honeymoons

### MVP Strategy for Restaurants

**Phase 1**:
1. Use Google Places API for restaurant search
2. Filter by rating, price level, and "romantic" atmosphere
3. Display top 5-10 restaurants per destination with:
   - Photos, ratings, price level, link to Google Maps
4. Stay within free tier ($200/month credit)

**Phase 2**:
1. Add Yelp API for richer review data (US destinations)
2. Curated "honeymoon special" restaurant lists (manual research)
3. Partner with OpenTable API for reservation booking

---

## 5. Safety & Travel Intelligence

### Top Recommendations

#### **🥇 Travel.State.Gov Travel Advisories API**
- **Type**: Official US Department of State travel warnings
- **Pricing**: FREE (government data)
- **Data**: 
  - 4-level advisory system (1=Safe to 4=Do Not Travel)
  - Country-specific safety info
  - Terrorism, crime, unrest, health risks
  - Entry/exit requirements
- **API Endpoint**: `https://cadataapi.state.gov/api/TravelAdvisories`
- **Format**: JSON, includes HTML content with details
- **Update Frequency**: Regular reviews, real-time for emergencies
- **Pros**:
  - Free, authoritative source
  - JSON API available
  - Comprehensive country coverage
- **Cons**:
  - US-centric perspective
  - Can be overly cautious
- **Link**: https://travel.state.gov/

#### **🥈 CDC Travel Health Notices**
- **Type**: Health-focused travel warnings (disease outbreaks, etc.)
- **Pricing**: FREE
- **Format**: RSS feed + web scraping
- **Data**:
  - Disease outbreak warnings (Dengue, Zika, etc.)
  - Vaccination requirements
  - Food/water safety
  - Specific health risks by country
- **RSS Feed**: `https://wwwnc.cdc.gov/travel/rss/notices.xml`
- **No official API**, but RSS feed is stable
- **Pros**:
  - Authoritative health data
  - Free
  - Complementary to State Dept data
- **Cons**:
  - No official API (must parse RSS)
  - Health-only focus
- **Link**: https://wwwnc.cdc.gov/travel/notices

#### **Other Options**

**Travel Advice API** (https://traveladviceapi.com/)
- Aggregates travel advice from multiple countries
- Includes COVID restrictions, airline closures, etc.
- Pricing: Contact for details
- Best For: Phase 2 if needing multi-country perspectives

**SafetyWing / Nomad Insurance APIs**
- No public API for safety data
- They consume Travel.State.Gov data
- Best For: Travel insurance integration (Phase 2+)

### MVP Strategy for Safety Data

**Phase 1**:
1. Fetch Travel.State.Gov API on destination selection
2. Display advisory level with brief summary
3. Parse CDC RSS feed for health notices
4. Show warning banner if Level 3-4 advisory

**Phase 2**:
1. Cache safety data (update weekly)
2. Add more nuanced safety scoring
3. Integrate with itinerary planning (warn before booking)

---

## 6. Honeymoon Planning Intelligence

### Average Costs (2024 Data)

**Overall Average**: $5,000-$5,700 per couple for 7 days

**By Destination Type**:
- **Caribbean/Mexico Beach**: $5,000-$7,500
- **Europe (cultural)**: $6,000-$9,000
- **Asia-Pacific**: $4,000-$7,000
- **Maldives/Luxury Beach**: $8,000-$15,000+
- **Domestic US (Napa, Hawaii)**: $3,500-$6,000
- **Budget/Off-Season**: $2,000-$4,000
- **Luxury Safari/Adventure**: $10,000-$25,000+

**Cost Breakdown**:
- **Flights**: $300-$2,000+ per person (domestic vs international)
- **Hotels**: $150-$500+ per night
- **Food/Dining**: $50-$150 per day per couple
- **Activities**: $200-$800 total
- **Transportation**: $100-$400

**Trip Length**:
- **Most Common**: 7-10 days
- **28% of couples**: 1-2 weeks
- **Premium honeymoons**: 10-14 days

### Honeymoon Destination Categories

**1. Beach Honeymoons** (26.3% market share - largest segment)
- **Popular**: Maldives, Bora Bora, Hawaii, Caribbean, Seychelles
- **Price Range**: $5,000-$15,000
- **Keywords**: All-inclusive, overwater bungalows, spa, snorkeling
- **Questions to Ask**:
  - "Private beach or social resort?"
  - "All-inclusive or à la carte?"
  - "Water activities (diving, snorkeling) or pure relaxation?"

**2. Adventure Honeymoons**
- **Popular**: Costa Rica, New Zealand, Iceland, Peru (Machu Picchu)
- **Price Range**: $5,000-$10,000
- **Keywords**: Hiking, zip-lining, wildlife, active
- **Questions to Ask**:
  - "Physical activity level (light hiking vs extreme sports)?"
  - "Wildlife focus or landscape focus?"
  - "Comfort level (luxury lodges vs camping)?"

**3. Cultural/City Honeymoons**
- **Popular**: Paris, Rome, Japan, Morocco, Greece
- **Price Range**: $6,000-$12,000
- **Keywords**: Museums, history, food tours, architecture
- **Questions to Ask**:
  - "Fast-paced (multiple cities) or slow (one destination)?"
  - "Food-focused or museum-focused?"
  - "Urban or mix of city + countryside?"

**4. Luxury/Ultra-Luxury**
- **Popular**: Maldives, Bora Bora, African Safari, Private Islands
- **Price Range**: $10,000-$50,000+
- **Keywords**: Private villas, butlers, Michelin dining, exclusivity
- **Questions to Ask**:
  - "Privacy level (resort or private villa)?"
  - "Spa/wellness focus?"
  - "Special experiences (helicopter tour, private yacht)?"

**5. Eco-Friendly/Sustainable**
- **Growing Trend**: Eco-lodges, sustainable tourism
- **Popular**: Costa Rica, Galapagos, Botswana, Norway
- **Keywords**: Carbon offset, local communities, nature conservation

**6. Road Trip Honeymoons**
- **Popular**: Pacific Coast Highway, Italy/Amalfi Coast, Route 66, New Zealand
- **Price Range**: $3,000-$8,000
- **Keywords**: Freedom, flexibility, scenic drives, multiple stops

**7. Cruise Honeymoons**
- **Popular**: Mediterranean, Caribbean, Alaska
- **Price Range**: $2,500-$8,000
- **Keywords**: All-inclusive, multiple destinations, relaxation

### Top Honeymoon Destinations 2024-2025

**Top 10 Worldwide**:
1. Maldives (luxury beach)
2. Greece (Santorini - romance + culture)
3. Bali, Indonesia (culture + beach)
4. Italy (Rome/Amalfi Coast - culture + food)
5. Hawaii (accessible beach/adventure)
6. Tahiti/Bora Bora (luxury beach)
7. Japan (culture + unique experiences)
8. Costa Rica (eco-adventure)
9. Seychelles (luxury beach)
10. New Zealand (adventure)

**Trending "It" Destinations**:
- **Dominica** (Caribbean adventure, diving, hiking)
- **Cook Islands** (budget Bora Bora alternative)
- **Portugal** (affordable European beach + culture)
- **Slovenia** (emerging adventure destination)
- **Morocco** (cultural + unique)

**US Domestic Favorites**:
- Hawaii (Maui, Kauai)
- California (Napa, Big Sur)
- Florida Keys
- Charleston, SC
- Savannah, GA

### Questions to Ask Users (User Onboarding)

**Critical Decision Points**:

1. **Budget**:
   - "What's your total honeymoon budget?" (slider: $2K - $50K+)
   - "Are you flexible if we find an amazing deal?"

2. **Travel Style**:
   - "Beach relaxation, adventure, culture, or mix?" (multi-select)
   - "Pace: Fast-paced (see everything) or slow (deep relaxation)?"

3. **Dates & Flexibility**:
   - "Target travel dates?" (date picker)
   - "Date flexibility?" (exact dates / ±3 days / ±1 week / very flexible)
   - **KEY**: Flexible dates = better pricing optimization

4. **Duration**:
   - "How many days?" (4-6 / 7-10 / 11-14 / 15+)

5. **Accommodation Preferences**:
   - "All-inclusive resort or boutique hotels?"
   - "Private villa or social resort?"
   - "Luxury, mid-range, or budget-conscious?"

6. **Activities**:
   - "Must-do activities?" (checkbox: spa, snorkeling, hiking, food tours, museums, etc.)
   - "Activity level: Relaxation / Moderate / Very Active?"

7. **Dining**:
   - "Food importance: Essential / Important / Not a priority?"
   - "Dietary restrictions?"

8. **Passports**:
   - "Do you both have valid passports?"
   - "Visa requirements OK, or prefer visa-free?"

9. **Priorities**:
   - "Rank these: Best price / Shortest flights / Most romantic / Unique experiences"

10. **Deal Breakers**:
    - "Any destinations you want to avoid?"
    - "Any must-haves we can't skip?"

### Honeymoon Planning Best Practices (from Travel Agents)

**What Successful Planners Prioritize**:

1. **Understand the "Goal" of the Honeymoon**:
   - Relaxation after stressful wedding?
   - Bucket-list adventure?
   - Romantic connection?
   - Mix of experiences?

2. **Date Flexibility = Savings**:
   - Off-season travel can save 30-50%
   - Mid-week flights often cheaper
   - Shoulder season = best weather + lower prices

3. **Balance**:
   - Mix of planned activities + free time
   - Don't over-schedule (it's a honeymoon, not a tour)
   - 1-2 "wow" experiences + lots of relaxation

4. **Romance Add-Ons**:
   - Room upgrades (often free/cheap on honeymoon)
   - Couples spa treatments
   - Private dinners on beach
   - Surprise experiences

5. **Practical Considerations**:
   - Travel time (avoid 20+ hours of travel for 7-day trip)
   - Jet lag for short trips
   - Weather/hurricane season
   - Local holidays/festivals

6. **Insurance**:
   - Travel insurance is essential for honeymoons
   - Covers cancellations, medical emergencies
   - Typical cost: 4-8% of trip cost

---

## 7. Competitive Analysis

### AI Travel Planners

#### **Layla.ai** - Leading AI Travel Planner
- **URL**: https://layla.ai/
- **Features**:
  - AI chat interface for trip planning
  - Itinerary generation
  - Flight, hotel, and activity booking
  - "Better than traditional travel agents" (per user reviews)
  - Mobile app (iOS, Android)
  - Trusted by millions
- **Strengths**:
  - Polished, intuitive UX
  - Full booking capability
  - Strong brand/marketing
  - Handles honeymoons specifically (testimonial on site)
- **Weaknesses**:
  - Not specialized for honeymoons
  - General travel planner (business + personal)
- **Monetization**: Likely affiliate commissions + booking fees

#### **Wonderplan.ai**
- **Features**:
  - Budget-focused AI trip planner
  - Optimizes for cost while maximizing experience
  - Detailed preference input (budget, restraints, interests)
- **Strengths**:
  - Strong budget optimization
  - Good for cost-conscious travelers
  - Free to use
- **Weaknesses**:
  - Requires destination selection upfront (not open-ended)
  - Less flexible for exploration
- **Monetization**: Affiliate commissions

#### **Vacay.chat**
- **Features**:
  - Conversational AI travel assistant
  - Recommendations based on preferences
- **Strengths**:
  - Simple, chat-based UX
- **Weaknesses**:
  - Less comprehensive than Layla

#### **ChatGPT + Travel Plugins**
- Many users using ChatGPT with travel plugins
- **Strengths**: Free, flexible, familiar interface
- **Weaknesses**: No booking, requires multiple tools, inconsistent quality

#### **Roam Around**
- Quick itinerary framework generator
- Good for initial planning, less depth

### Traditional Travel Planning Tools

#### **TripIt** ($48.99/year premium)
- **Focus**: Itinerary organization (not planning)
- **Strengths**:
  - Auto-imports from email confirmations
  - Real-time flight alerts
  - Neighborhood safety scores
  - Great for business travelers
- **Weaknesses**:
  - No planning/booking features
  - Boring UI
  - Post-booking focus
- **Monetization**: Subscription ($48.99/year)

#### **Roadtrippers**
- **Focus**: Road trip planning
- **Free**: Up to 7 waypoints
- **Paid**: Unlimited waypoints
- **Strengths**: Great for road trips, maps, route planning
- **Weaknesses**: Not for air travel/honeymoons

#### **Wanderlog**
- Free visual itinerary planner
- Good for collaborative planning
- Not AI-powered

### OTA Travel Planners

#### **TripAdvisor/Viator**
- Not a full planner, mostly activity booking
- Strong reviews and booking capability

#### **Expedia / Booking.com**
- Traditional OTA search and booking
- No AI planning, no itinerary builder

### Competitive Gaps & Opportunities

**What's Missing in the Market**:

1. **Honeymoon-Specific AI Planner**: No competitor focuses solely on honeymoons
2. **Budget + Flexibility Optimization**: Limited tools prioritize date flexibility for price optimization
3. **Real Pricing Data**: Most AI planners give estimates, not real prices
4. **Day-by-Day Itineraries**: Most generate high-level plans, not detailed schedules
5. **Safety Integration**: Few tools surface travel advisories prominently
6. **Multi-Category Budget Tracking**: No tool tracks flights, hotels, activities, restaurants separately

**What Competitors Do Well**:

1. **Layla**: Booking integration, polished UX, strong brand
2. **Wonderplan**: Budget optimization focus
3. **TripIt**: Post-booking organization

**Differentiation Strategy for Honeymoon Planner**:

✅ **Honeymoon-specialized** (romance, once-in-a-lifetime focus)
✅ **Real pricing** (not estimates) from live APIs
✅ **Date flexibility** as core feature (find cheapest dates within range)
✅ **Budget tracking** by category (flights, hotel, food, activities)
✅ **Safety first** (surface travel warnings early)
✅ **Detailed itineraries** (day-by-day, hour-by-hour if wanted)

---

## 8. Monetization Models

### Travel Affiliate Commissions

**Flight Affiliates**:
- Typically **2-5%** of booking value
- Example: $1,000 flights → $20-$50 commission
- Some airlines pay per click ($0.10-$1.00)

**Hotel Affiliates**:
- **Expedia**: 3-6% of booking value
- **Booking.com**: 25-40% commission (for travel agents)
- **Hotels.com**: 4-6%
- **Agoda**: 5-7%
- Example: $1,500 hotel stay → $45-$225 commission

**Activity Affiliates**:
- **Viator**: ~10-15% commission
- **GetYourGuide**: ~10-15%
- **Klook**: ~10-15%
- Example: $500 in activities → $50-$75 commission

**Typical Honeymoon Revenue**:
- Average $5,500 honeymoon
- Estimated affiliate revenue: **$165-$385** per booking
- Breakdown:
  - Flights ($1,200 × 2-4%): $24-$48
  - Hotels ($2,500 × 25%): $625 (if direct) or $75-$150 (via OTA affiliate)
  - Activities ($600 × 12%): $72
  - Dining: $0 (no commissions typically)

### Other Monetization Options

**Freemium Model**:
- Free basic planning
- Premium features:
  - Unlimited itinerary versions
  - Priority support
  - Advanced budget optimization
  - Travel insurance integration
  - Real-time price alerts
- Pricing: $9.99-$29.99 one-time or $4.99/month

**Subscription**:
- Honeymoon planning subscription
- Access to exclusive deals
- Expert travel agent consultations
- Pricing: $19.99-$49.99/month (cancel after planning)

**Travel Insurance Affiliate**:
- Partner with SafetyWing, World Nomads, etc.
- 10-20% commission on insurance sales
- Average insurance: $200-$400 → $20-$80 commission

**Partnerships**:
- Honeymoon registries (Zola, Honeyfund)
- Wedding planning apps (cross-promotion)
- Photographer/videographer referrals

---

## 9. MVP Recommendations

### Phase 1: Minimum Viable Product (4-6 weeks)

**Core Features**:
1. User questionnaire (budget, dates, preferences)
2. Destination recommendations (3-5 options)
3. Real flight pricing (Amadeus API)
4. Hotel options with real prices (Makcorps/Xotelo)
5. Day-by-day itinerary outline
6. Safety warnings (Travel.State.Gov API)
7. Total budget tracker

**Data Sources**:
- **Flights**: Amadeus Self-Service API (FREE 3K calls/month)
- **Hotels**: Makcorps API (30 free calls trial) or Xotelo (free)
- **Activities**: Manual curation + Google Places API (within free tier)
- **Restaurants**: Google Places API ($200 credit covers MVP)
- **Safety**: Travel.State.Gov API (free) + CDC RSS feed (free)

**Estimated API Costs (MVP)**:
- **Month 1-2**: $0 (within free tiers)
- **Month 3+**: $50-$200/month (depends on usage)

**MVP Feature Exclusions** (for Phase 2):
- ❌ Direct booking (link to OTAs instead)
- ❌ Activity API integration (manual curation for now)
- ❌ Mobile app (web only)
- ❌ Real-time price alerts
- ❌ Multi-user collaboration

### Phase 2: Post-MVP Enhancements (3-6 months)

**New Features**:
1. Direct booking via Duffel API (flights)
2. Viator/GetYourGuide API integration (activities)
3. Real-time price tracking and alerts
4. Itinerary sharing with partner/family
5. Mobile app (React Native)
6. Travel insurance integration
7. Premium features (subscription)

**API Additions**:
- Duffel for flight booking
- Viator/GetYourGuide (after partner approval)
- Booking.com affiliate (if approved)
- Yelp API for richer restaurant data

**Monetization Activation**:
- Affiliate links for all bookings
- Premium subscription launch
- Travel insurance partnerships

---

## 10. Technical Architecture Recommendations

### Frontend
- **Framework**: Next.js (React) for SEO + fast loading
- **UI**: Tailwind CSS, shadcn/ui components
- **Maps**: Google Maps JavaScript API
- **State**: React Query for API data caching

### Backend
- **API**: Node.js + Express or Next.js API routes
- **Database**: PostgreSQL (user data, saved itineraries, cached API results)
- **Caching**: Redis (cache flight/hotel searches, reduce API calls)
- **Queue**: BullMQ (background jobs for price checking)

### API Integration Strategy
1. **Rate Limiting**: Respect API limits, implement request queues
2. **Caching**: Cache flight searches for 15-30 minutes, hotel for 1 hour
3. **Error Handling**: Graceful fallbacks if API fails
4. **Cost Control**: Monitor API usage daily, set spending alerts

### Data Flow Example (Flight Search)
```
User inputs: LAX → Paris, May 10-20, $2000 budget
↓
Backend checks cache (Redis): Has this search been run in last 15 min?
  → YES: Return cached results
  → NO: Call Amadeus API
↓
Amadeus API: Flight Offers Search + Cheapest Date Search
↓
Parse results, find cheapest date combination within May 10-20
↓
Store in cache + database
↓
Return to frontend with "Best price: $XXX on May 13-21"
```

---

## 11. Risk Assessment

### API Risks

**Amadeus API**:
- ⚠️ Free tier caps at 3K searches/month
- **Mitigation**: Cache aggressively, monitor usage
- ⚠️ Production requires validation and approval
- **Mitigation**: Start validation process early

**Makcorps/Xotelo**:
- ⚠️ Limited free tier
- **Mitigation**: Budget for paid plans post-MVP
- ⚠️ Display-only (no booking)
- **Mitigation**: Use deep links, apply for affiliate programs

**Google Places API**:
- ⚠️ Costs can escalate quickly
- **Mitigation**: Optimize queries, cache results, batch requests

### Business Risks

**Market Competition**:
- Layla, Wonderplan, and others are well-funded
- **Mitigation**: Focus on honeymoon niche, real pricing differentiation

**Affiliate Approval**:
- Some programs require existing traffic
- **Mitigation**: Apply early, start with less restrictive programs (Travelpayouts, RapidAPI affiliates)

**User Trust**:
- Users may be wary of AI trip planning for high-stakes honeymoon
- **Mitigation**: Transparency about data sources, ability to modify AI suggestions, human support option

---

## 12. Next Steps

### Immediate Actions (Week 1)
1. ✅ **Sign up for APIs**:
   - Amadeus Self-Service (free account)
   - Google Cloud Platform (enable Places API)
   - Makcorps trial account
2. ✅ **Prototype flight search** with Amadeus API
3. ✅ **Test flexible date search** feature
4. ✅ **Build basic budget calculator**

### Week 2-3
1. **Integrate hotel price comparison** (Makcorps/Xotelo)
2. **Connect Travel.State.Gov API** for safety warnings
3. **Build destination recommendation logic** (based on user inputs)

### Week 4-6
1. **Full MVP** with basic itinerary generation
2. **User testing** with 5-10 couples
3. **Refine based on feedback**
4. **Prepare for launch**

### Post-Launch (Month 2-3)
1. **Apply for affiliate programs** (Expedia, Viator, GetYourGuide)
2. **Monitor API costs and optimize**
3. **Gather user feedback**
4. **Plan Phase 2 features**

---

## 13. Key Takeaways

### API Winners for MVP
1. **Flights**: Amadeus Self-Service (free, flexible dates, great docs)
2. **Hotels**: Makcorps or Xotelo (price comparison, free trial)
3. **Safety**: Travel.State.Gov API + CDC RSS (free, authoritative)
4. **Restaurants**: Google Places API (generous free tier)
5. **Activities**: Manual curation → Viator API (Phase 2)

### Differentiation Strategy
- **Honeymoon-specific** AI planner
- **Real pricing** (not estimates) via live APIs
- **Date flexibility** as core optimization feature
- **Detailed budget tracking** across categories
- **Safety-first** approach with travel warnings

### Monetization Path
- **MVP**: Focus on product, limited monetization
- **Phase 2**: Activate affiliate commissions (3-10% per booking)
- **Phase 3**: Premium subscription ($9.99-$29.99)
- **Target**: $165-$385 revenue per honeymoon booked

### Estimated Costs
- **MVP (Months 1-2)**: $0 (free tiers)
- **Month 3+**: $50-$300/month (depending on traffic)
- **Phase 2**: $300-$1,000/month (more APIs, higher usage)

---

## Appendix: Useful Links

### APIs
- Amadeus: https://developers.amadeus.com/
- Duffel: https://duffel.com/
- Google Places: https://developers.google.com/maps/documentation/places/
- Makcorps: https://www.makcorps.com/
- Xotelo: https://xotelo.com/
- Travel.State.Gov: https://travel.state.gov/
- CDC Travel Notices: https://wwwnc.cdc.gov/travel/notices

### Competitors
- Layla.ai: https://layla.ai/
- Wonderplan: https://wonderplan.ai/
- TripIt: https://www.tripit.com/

### Affiliate Programs
- Expedia TAAP: https://www.expediataap.com/
- Travelpayouts: https://www.travelpayouts.com/

### Resources
- Honeymoon costs: https://www.zola.com/expert-advice/save-money-on-honeymoon
- Flight API comparison: https://www.scrapingbee.com/blog/top-flights-apis-for-travel-apps/

---

**Report compiled by Research Agent**  
**Date**: February 25, 2026  
**Status**: Complete and ready for development**
