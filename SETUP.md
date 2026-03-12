# Setup Guide for KAZA

## Supabase Setup
1. Go to supabase.com and create a free project.
2. In the SQL Editor, paste and run the contents of supabase/migrations/001_initial_schema.sql
3. Paste and run supabase/seed.sql to seed destinations.
4. Configure additional RLS policies if needed (basic ones are in the schema).
5. From Project Settings > API, get NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY (from Config > Auth).
6. Add them to .env.local or Vercel env vars.

## Vercel Deployment
1. Create a free Vercel account at vercel.com.
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel login`
4. In the project directory, run `vercel`
5. Follow prompts to deploy as "kaza-trip-planner".
6. In Vercel dashboard, add the Supabase env vars.
7. Test the production URL.
8. Verify the questionnaire form works and shows recommendations.