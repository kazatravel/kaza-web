-- Honeymoon Planner Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    home_city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences (captured from questionnaire)
CREATE TABLE public.preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    home_city TEXT,
    trip_length INTEGER, -- in days
    budget_total INTEGER, -- in USD
    budget_flexibility TEXT CHECK (budget_flexibility IN ('strict', 'flexible_low', 'flexible_high')),
    dates_flexibility BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    travel_months TEXT[], -- e.g., ['May', 'June', 'July']
    interests TEXT[], -- ['outdoors', 'culture', 'food', 'beaches', 'adventure', 'relaxation', 'nightlife', 'history']
    activity_level TEXT CHECK (activity_level IN ('low', 'medium', 'high')),
    accommodation_type TEXT[], -- ['luxury', 'boutique', 'resort', 'apartment', 'hostel']
    must_haves TEXT[],
    deal_breakers TEXT[],
    companion_preferences JSONB, -- partner info if relevant
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations master table
CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT, -- e.g., 'Southeast Asia', 'Europe', 'Caribbean'
    description TEXT,
    type TEXT[] NOT NULL, -- ['beach', 'adventure', 'luxury', 'culture', 'city', 'mountain', 'island']
    tags TEXT[], -- ['romantic', 'budget-friendly', 'overwater-bungalow', 'historical', 'foodie']
    budget_range JSONB NOT NULL, -- {"min": 2000, "max": 8000, "currency": "USD"}
    best_time_to_visit JSONB, -- {"months": ['May', 'June'], "reason": "..."}
    climate JSONB, -- {"type": "tropical", "avg_temp": 28}
    highlights TEXT[],
    activities TEXT[],
    ideal_for TEXT[], -- ['honeymoon', 'anniversary', 'romantic-getaway']
    images JSONB[], -- [{"url": "...", "alt": "..."}]
    safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
    visa_requirements TEXT,
    language TEXT,
    currency TEXT,
    timezone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    preference_id UUID REFERENCES public.preferences(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'drafting' CHECK (status IN ('drafting', 'comparing', 'building', 'refining', 'confirmed', 'cancelled')),
    name TEXT,
    home_city TEXT,
    destination_id UUID REFERENCES public.destinations(id),
    start_date DATE,
    end_date DATE,
    duration INTEGER, -- in days
    budget_total INTEGER,
    budget_allocated JSONB, -- {"flights": 2000, "accommodation": 3000, ...}
    travelers INTEGER DEFAULT 2,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip destinations (for comparison phase - multiple options)
CREATE TABLE public.trip_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    is_selected BOOLEAN DEFAULT false,
    match_score INTEGER, -- AI generated score 0-100
    why_recommended TEXT,
    estimated_flight_cost INTEGER,
    estimated_hotel_cost_per_night INTEGER,
    estimated_activity_cost_per_day INTEGER,
    total_estimate INTEGER,
    pros TEXT[],
    cons TEXT[],
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itineraries table
CREATE TABLE public.itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    is_selected BOOLEAN DEFAULT false,
    title TEXT,
    summary TEXT,
    total_cost INTEGER,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itinerary days
CREATE TABLE public.itinerary_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE,
    title TEXT,
    summary TEXT,
    is_rest_day BOOLEAN DEFAULT false,
    accommodation JSONB, -- {"name": "...", "type": "...", "cost": 150, "booking_url": "..."}
    flight_info JSONB, -- for days with flights
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities within itinerary days
CREATE TABLE public.itinerary_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('activity', 'meal', 'transport', 'accommodation', 'free_time')),
    time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night', 'all_day')),
    duration_minutes INTEGER,
    cost INTEGER,
    currency TEXT DEFAULT 'USD',
    is_flexible BOOLEAN DEFAULT false, -- can swap with alternatives
    alternatives JSONB[], -- [{"title": "...", "cost": 50}]
    is_alternative BOOLEAN DEFAULT false,
    parent_activity_id UUID REFERENCES public.itinerary_activities(id),
    location JSONB, -- {"name": "...", "lat": 0, "lng": 0, "address": "..."}
    booking_status TEXT DEFAULT 'not_needed' CHECK (booking_status IN ('not_needed', 'needed', 'booked', 'cancelled')),
    booking_url TEXT,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_preferences_user_id ON public.preferences(user_id);
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_destinations_type ON public.destinations USING GIN(type);
CREATE INDEX idx_destinations_tags ON public.destinations USING GIN(tags);
CREATE INDEX idx_destinations_region ON public.destinations(region);
CREATE INDEX idx_destinations_budget ON public.destinations USING GIN(budget_range);
CREATE INDEX idx_trip_destinations_trip_id ON public.trip_destinations(trip_id);
CREATE INDEX idx_trip_destinations_match_score ON public.trip_destinations(match_score);
CREATE INDEX idx_itineraries_trip_id ON public.itineraries(trip_id);
CREATE INDEX idx_itinerary_days_itinerary_id ON public.itinerary_days(itinerary_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);