-- 005_create_trips_and_trip_items_tables.sql

-- Create the 'trips' table
CREATE TABLE public.trips (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    name text NOT NULL,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS) for the 'trips' table
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trips." ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips." ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips." ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips." ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- Create the 'trip_items' table
CREATE TABLE public.trip_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    type text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    location text,
    cost numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS) for the 'trip_items' table
ALTER TABLE public.trip_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trip items." ON public.trip_items
  FOR SELECT USING ((SELECT user_id FROM public.trips WHERE id = trip_id) = auth.uid());

CREATE POLICY "Users can insert their own trip items." ON public.trip_items
  FOR INSERT WITH CHECK ((SELECT user_id FROM public.trips WHERE id = trip_id) = auth.uid());

CREATE POLICY "Users can update their own trip items." ON public.trip_items
  FOR UPDATE USING ((SELECT user_id FROM public.trips WHERE id = trip_id) = auth.uid());

CREATE POLICY "Users can delete their own trip items." ON public.trip_items
  FOR DELETE USING ((SELECT user_id FROM public.trips WHERE id = trip_id) = auth.uid());
