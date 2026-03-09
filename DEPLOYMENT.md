# Kaza Deployment Guide

## Prerequisites

Before deploying, ensure you have the following services set up:

1.  **Supabase Project:**
    *   URL & Anon Key
    *   Database tables initialized (`users`, `itineraries`)
    *   Authentication enabled (Email/Password or OAuth)

2.  **Amadeus API Account:**
    *   Client ID & Client Secret (for Flight Search)

3.  **OpenRouter / Gemini API Key:**
    *   API Key (for AI recommendations)

## Environment Variables

Configure these in your Vercel project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (Optional, only for admin scripts)

AMADEUS_CLIENT_ID=your-amadeus-client-id
AMADEUS_CLIENT_SECRET=your-amadeus-client-secret

OPENROUTER_API_KEY=your-openrouter-key
```

## Deployment Steps (Vercel)

1.  **Push to GitHub:**
    *   Ensure your latest code is committed and pushed to the `main` branch.

2.  **Import Project in Vercel:**
    *   Go to Vercel Dashboard -> Add New Project.
    *   Select your repository.
    *   **Root Directory:** `projects/kaza/kaza-app` (Critical: The Next.js app is inside this folder).

3.  **Configure Build Settings:**
    *   Framework Preset: Next.js (Auto-detected).
    *   Build Command: `next build` (Default).

4.  **Add Environment Variables:**
    *   Copy the values from your local `.env` or `API_KEYS.md` into the Vercel Environment Variables section.

5.  **Deploy:**
    *   Click "Deploy".
    *   Wait for the build to complete.

## Post-Deployment Verification

1.  **Visit the URL:** Ensure the homepage loads.
2.  **Test Search:** Run a search (e.g., "Paris, 5 days"). Verify results appear.
3.  **Test Auth:** Sign up for a new account.
4.  **Test Itinerary:** Create and save a trip.

## Troubleshooting

*   **Images not loading?** Check `next.config.mjs` allows `images.unsplash.com`.
*   **API Errors?** Check Vercel Function Logs for server-side errors.
*   **Database connection failed?** Verify Supabase URL/Key in Vercel env vars.
