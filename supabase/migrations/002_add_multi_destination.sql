-- Migration to add multi-destination support to trips table

-- Add destinations JSONB column to trips table
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS destinations JSONB DEFAULT '[]'::JSONB;

-- Comment describing the structure of the destinations column
COMMENT ON COLUMN public.trips.destinations IS 'Array of destination objects: [{city: "Paris", country: "France", arrival: "2025-06-01", departure: "2025-06-05", airport: "CDG"}]';
