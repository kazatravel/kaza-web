# Kaza - AI Trip Planning Platform

A personalized trip planning platform that uses AI to match travelers with destinations and provide real pricing estimates.

## Features

- Interactive questionnaire to capture travel preferences
- AI-powered destination matching (5 curated options)
- Cost breakdown by category (flights, accommodation, activities, food)
- Budget optimization with flexible date options

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account (for database)

### Setup

1. Clone the repository:
```bash
cd /data/.openclaw/workspace/projects/kaza/web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Database Setup

Run the migration file in your Supabase SQL Editor:
```
/backend/supabase/migrations/001_initial_schema.sql
```

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Or deploy from CLI:
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Project Structure

```
app/
├── api/
│   └── trip/
│       └── route.ts      # Trip creation API
├── layout.tsx            # Root layout
├── page.tsx              # Main page with questionnaire
└── globals.css           # Global styles

components/
├── questionnaire.tsx     # Trip preference form
├── destination-card.tsx  # Destination result card
└── ui/                   # shadcn/ui components

lib/
├── types.ts              # TypeScript types
└── supabase.ts           # Supabase client
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (admin) | Optional |
| `AMADEUS_CLIENT_ID` | Amadeus Flight API ID | Future |
| `AMADEUS_CLIENT_SECRET` | Amadeus Flight API Secret | Future |

## Known Limitations (MVP)

- Destination data uses mock/sample data (real database integration in progress)
- Flight prices are estimates (real Amadeus API integration coming)
- No user authentication yet (local state only)
- Itinerary builder coming in v2

## Next Steps

1. Set up Supabase with real data
2. Integrate Amadeus Flight API
3. Add user authentication
4. Build itinerary day-by-day view
5. Add hotel/activity APIs

## License

Private - For Kaza project use only.
