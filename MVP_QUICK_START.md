# Honeymoon Planner - MVP Quick Start Guide

**TL;DR**: Build the MVP using free API tiers, focus on honeymoon-specific features, differentiate with real pricing + flexible dates.

---

## 🎯 MVP Goal
Create an AI honeymoon planner that helps couples find the best deals by optimizing dates and budget across flights, hotels, activities, and restaurants.

---

## 🚀 API Stack (MVP - All FREE Tiers)

| Category | API | Cost | Access |
|----------|-----|------|--------|
| **Flights** | Amadeus Self-Service | 3,000 calls/mo FREE | Instant (signup) |
| **Hotels** | Makcorps or Xotelo | 30 calls trial / FREE | Instant |
| **Activities** | Manual curation + Google Places | Within free tier | Instant |
| **Restaurants** | Google Places API | $200 credit/mo | Instant (GCP) |
| **Safety** | Travel.State.Gov API | FREE | Public API |
| **Health** | CDC Travel Notices RSS | FREE | Public feed |

**Total MVP Cost**: $0 for first 1-2 months ✅

---

## 🔑 Core Features (MVP)

### Week 1-2: Foundation
- [ ] User questionnaire
  - Budget (slider)
  - Dates + flexibility (±3 days / ±1 week)
  - Preferences (beach/adventure/culture)
  - Activity level
- [ ] Amadeus flight API integration
  - Search flights
  - **Flexible date search** (cheapest dates in range)
- [ ] Basic budget tracker

### Week 3-4: Hotels + Safety
- [ ] Makcorps/Xotelo hotel price comparison
- [ ] Travel.State.Gov safety warnings
- [ ] CDC health notices
- [ ] Destination recommendations (3-5 options)

### Week 5-6: Itinerary + Polish
- [ ] Day-by-day itinerary generator
- [ ] Google Places for restaurants/activities
- [ ] Total cost breakdown
- [ ] Export itinerary (PDF)
- [ ] User testing

---

## 💡 Differentiation Strategy

**What makes this different from Layla/Wonderplan?**

1. ✅ **Honeymoon-specialized** (not generic travel)
2. ✅ **Real pricing** from live APIs (not estimates)
3. ✅ **Date flexibility = savings** (core optimization feature)
4. ✅ **Budget tracking** by category (flights, hotel, food, activities)
5. ✅ **Safety-first** (surface travel warnings prominently)
6. ✅ **Detailed itineraries** (day-by-day, customizable)

---

## 📋 User Flow (MVP)

```
1. Landing page: "Plan your dream honeymoon in 5 minutes"
   ↓
2. Questionnaire (5-7 questions):
   - Budget?
   - When? (dates + flexibility)
   - What type? (beach/adventure/culture)
   - Activity level?
   - Must-haves?
   ↓
3. AI generates 3 destination options with:
   - Estimated total cost
   - Best travel dates (if flexible)
   - Safety rating
   - Vibe match score
   ↓
4. User selects destination
   ↓
5. Detailed planning:
   - Real flight prices (Amadeus)
   - Hotel options (Makcorps price comparison)
   - Restaurant suggestions (Google Places)
   - Activity ideas (manual curation)
   - Day-by-day itinerary
   ↓
6. Budget breakdown + export itinerary
   ↓
7. Links to book (OTA deep links → future: affiliate commissions)
```

---

## 🔗 Quick API Setup

### 1. Amadeus (5 min)
1. Go to https://developers.amadeus.com/
2. Sign up (free account)
3. Create app → get API key
4. Test endpoint:
   ```
   GET https://test.api.amadeus.com/v2/shopping/flight-offers
   ```
5. **Key endpoints**:
   - `/v2/shopping/flight-offers` - Search flights
   - `/v1/shopping/flight-dates` - Cheapest dates
   - `/v1/shopping/flight-offers/pricing` - Confirm price

### 2. Google Places (10 min)
1. Go to https://console.cloud.google.com/
2. Create project
3. Enable Places API
4. Create API key
5. Set restrictions (HTTP referrer)
6. **$200/month free credit** = ~28K requests

### 3. Makcorps (5 min)
1. Go to https://www.makcorps.com/
2. Sign up for 30-day trial (30 API calls)
3. Get API key
4. Test endpoint:
   ```
   GET /hotel-price?hotel_id=XXX&check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
   ```

### 4. Travel.State.Gov (Instant)
- **Public API**: `https://cadataapi.state.gov/api/TravelAdvisories`
- No auth required
- Returns JSON with all country advisories

### 5. CDC Health Notices (Instant)
- **RSS Feed**: `https://wwwnc.cdc.gov/travel/rss/notices.xml`
- Parse XML for health warnings

---

## 📊 Honeymoon Planning Intelligence (Quick Reference)

### Average Costs
- **Overall**: $5,000-$5,700 (7 days)
- **Budget**: $2,000-$4,000
- **Mid-range**: $5,000-$8,000
- **Luxury**: $10,000-$25,000+

### Destination Categories
1. **Beach** (26.3% of market) - Maldives, Caribbean, Hawaii
2. **Adventure** - Costa Rica, New Zealand, Iceland
3. **Cultural** - Italy, Japan, Greece, Morocco
4. **Luxury** - Private islands, safaris, Bora Bora

### Top Questions to Ask Users
1. What's your budget? (slider: $2K - $50K+)
2. When do you want to go? (date picker)
3. How flexible are your dates? (±3 days / ±1 week / very flexible)
4. What's your vibe? (beach / adventure / culture / mix)
5. Activity level? (relaxation / moderate / very active)
6. All-inclusive resort or boutique hotels?
7. Do you have valid passports?

---

## 💰 Monetization (Phase 2)

### Affiliate Commissions
- **Hotels**: 3-6% (Expedia) or 25-40% (Booking.com for agents)
- **Flights**: 2-5%
- **Activities**: 10-15% (Viator, GetYourGuide)

### Estimated Revenue per Honeymoon
- **Average honeymoon**: $5,500
- **Affiliate revenue**: $165-$385 per booking
- Example breakdown:
  - Flights ($1,200 @ 4%): $48
  - Hotels ($2,500 @ 25%): $625 (or $125 via OTA)
  - Activities ($600 @ 12%): $72

### Phase 2 Monetization
- Affiliate links (Expedia, Viator, GetYourGuide)
- Premium features ($9.99-$29.99 one-time)
- Travel insurance affiliate (10-20% commission)

---

## ⚠️ Risk Mitigation

### API Limits
- **Problem**: Free tiers cap quickly
- **Solution**: 
  - Aggressive caching (15-30 min for flights, 1 hour for hotels)
  - Redis for cache layer
  - Monitor usage daily
  - Budget $50-$300/mo for paid plans when needed

### Competitor Pressure
- **Problem**: Layla and others are well-funded
- **Solution**: 
  - Focus on honeymoon niche
  - Real pricing (not estimates)
  - Build trust with transparency

### Affiliate Approvals
- **Problem**: Some require existing traffic
- **Solution**: 
  - Start with less restrictive programs (Travelpayouts)
  - Use OTA deep links in MVP (track clicks)
  - Apply for major programs early

---

## 🛠️ Tech Stack Recommendation

### Frontend
- **Framework**: Next.js (React) - SEO + fast
- **UI**: Tailwind CSS + shadcn/ui
- **Maps**: Google Maps JavaScript API
- **State**: React Query (API caching)

### Backend
- **API**: Next.js API routes
- **Database**: PostgreSQL (Supabase for speed)
- **Cache**: Redis (Upstash for serverless)
- **Hosting**: Vercel (free tier for MVP)

### Cost Estimate
- **Hosting**: $0 (Vercel free tier)
- **Database**: $0 (Supabase free tier)
- **APIs**: $0-$50/month
- **Total MVP**: **$0-$50/month** ✅

---

## 📅 MVP Timeline (6 weeks)

### Week 1: Foundation
- Setup Next.js + Tailwind
- Build questionnaire UI
- Amadeus API integration (basic)

### Week 2: Flight Search
- Flexible date search
- Display results
- Budget calculator

### Week 3: Hotels + Safety
- Makcorps/Xotelo integration
- Travel.State.Gov API
- Destination recommendations

### Week 4: Itinerary
- Day-by-day planner
- Google Places for restaurants
- Activity suggestions (manual)

### Week 5: Polish
- UX refinement
- Export to PDF
- Mobile responsive

### Week 6: Testing
- User testing (5-10 couples)
- Bug fixes
- Prepare launch

---

## ✅ Definition of Done (MVP)

**MVP is complete when**:
- [ ] User can input budget, dates, preferences
- [ ] System recommends 3 destination options
- [ ] Real flight prices shown with flexible date options
- [ ] Hotel price comparison from multiple OTAs
- [ ] Day-by-day itinerary generated
- [ ] Safety warnings displayed prominently
- [ ] Total budget tracked across categories
- [ ] Itinerary exportable (PDF or print)
- [ ] Mobile responsive
- [ ] 5+ couples successfully use it for real honeymoon planning

---

## 🎯 Success Metrics (Post-Launch)

### Engagement
- 70%+ users complete questionnaire
- 50%+ select a destination option
- 30%+ view detailed itinerary
- 10%+ export itinerary

### Monetization (Phase 2)
- 5%+ click-through to OTA booking
- $165+ average revenue per conversion

### User Satisfaction
- 4.5+ stars average rating
- 80%+ would recommend to friends

---

## 📞 Next Steps

### Immediate (This Week)
1. Sign up for all APIs (1 hour)
2. Test Amadeus flight search (2 hours)
3. Build questionnaire wireframe (2 hours)
4. Validate project brief is still accurate

### Week 2
1. Prototype basic UI
2. Integrate first API
3. Weekly check-in with stakeholder

---

## 📚 Resources

- **Full Research Report**: `RESEARCH_REPORT.md` (30K words)
- **Project Brief**: `PROJECT_BRIEF.md`
- **API Docs**: See links in research report

---

**Ready to build? Start with APIs setup and questionnaire! 🚀**
