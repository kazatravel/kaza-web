-- Migration: Create Destinations Table
-- Create a master table for destinations to be used by the AI recommendation engine.

CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    description TEXT,
    vibe_tags TEXT[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.destinations IS 'Master list of travel destinations for AI recommendations.';
COMMENT ON COLUMN public.destinations.name IS 'Unique name of the destination (e.g., Paris).';
COMMENT ON COLUMN public.destinations.vibe_tags IS 'Array of descriptive tags (e.g., "romantic", "adventure", "relaxing").';
COMMENT ON COLUMN public.destinations.image_url IS 'URL to a prominent image of the destination.';

-- Add RLS policy for public read access to destinations
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public destinations are viewable by all." ON public.destinations;
CREATE POLICY "Public destinations are viewable by all."
    ON public.destinations FOR SELECT
    USING (true);

-- Grant permissions to authenticated users for select
GRANT SELECT ON public.destinations TO authenticated;

-- Optional: Grant insert/update to service_role for admin/data seeding purposes
-- This should only be done if there's an admin interface or a trusted seeding process
-- GRANT INSERT, UPDATE ON public.destinations TO service_role;

COMMIT;
