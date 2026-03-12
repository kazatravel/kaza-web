-- Migration: Multi-Destination Support Update
-- Run this in Supabase SQL Editor to enable multi-destination trips

-- Add destinations JSONB column to trips table
-- Each destination: {city, country, arrival, departure, airport, days}
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS destinations JSONB DEFAULT '[]'::JSONB;

-- Comment describing the structure
COMMENT ON COLUMN public.trips.destinations IS 'Array of destination objects: [{city: "Paris", country: "France", arrival: "2025-06-01", departure: "2025-06-05", airport: "CDG", days: 5}]';

-- Add index for JSONB queries on destinations
CREATE INDEX IF NOT EXISTS idx_trips_destinations ON public.trips USING GIN(destinations);

-- Add origin_city column to store starting location
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS origin_city TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS origin_airport TEXT;

-- Update trip_destinations table to support multi-destination linkage
ALTER TABLE public.trip_destinations ADD COLUMN IF NOT EXISTS destination_order INTEGER DEFAULT 0;
ALTER TABLE public.trip_destinations ADD COLUMN IF NOT EXISTS nights INTEGER;

-- Create view for multi-destination trip summary
-- This view calculates days in each destination client-side
CREATE OR REPLACE VIEW public.multi_destination_trips AS
SELECT 
    t.*,
    jsonb_array_length(t.destinations) as destination_count,
    (t.destinations->0)->>'arrival' as first_arrival,
    (t.destinations->jsonb_array_length(t.destinations)-1)->>'departure' as last_departure,
    CASE 
        WHEN jsonb_array_length(t.destinations) > 1 THEN true 
        ELSE false 
    END as is_multi_destination
FROM public.trips t
WHERE t.destinations IS NOT NULL AND jsonb_array_length(t.destinations) > 0;

-- Function to validate destination dates
CREATE OR REPLACE FUNCTION validate_destination_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if destinations array has valid structure
    IF NEW.destinations IS NOT NULL AND jsonb_array_length(NEW.destinations) > 0 THEN
        -- Verify each destination has required fields
        FOR i IN 0..jsonb_array_length(NEW.destinations) - 1 LOOP
            IF NEW.destinations->i->>'city' IS NULL OR NEW.destinations->i->>'arrival' IS NULL OR NEW.destinations->i->>'departure' IS NULL THEN
                RAISE EXCEPTION 'Each destination must have city, arrival, and departure';
            END IF;
        END LOOP;
        
        -- Validate max 5 destinations
        IF jsonb_array_length(NEW.destinations) > 5 THEN
            RAISE EXCEPTION 'Maximum 5 destinations allowed per trip';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to trips table
DROP TRIGGER IF EXISTS validate_destinations ON public.trips;
CREATE TRIGGER validate_destinations
    BEFORE INSERT OR UPDATE ON public.trips
    FOR EACH ROW
    EXECUTE FUNCTION validate_destination_dates();

-- RLS Policy: Allow viewing/inserting/updating destinations for own trips
CREATE POLICY IF NOT EXISTS "Users can view their own trip destinations" 
    ON public.trips FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own trip destinations" 
    ON public.trips FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own trip destinations" 
    ON public.trips FOR UPDATE 
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.multi_destination_trips TO authenticated;

COMMIT;
