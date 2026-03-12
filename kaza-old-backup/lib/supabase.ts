import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client for client-side usage
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Server client for API routes
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// Database types based on schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          home_city: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      preferences: {
        Row: {
          id: string;
          user_id: string;
          home_city: string | null;
          trip_length: number | null;
          budget_total: number | null;
          budget_flexibility: string | null;
          dates_flexibility: boolean;
          start_date: string | null;
          end_date: string | null;
          travel_months: string[] | null;
          interests: string[] | null;
          activity_level: string | null;
          accommodation_type: string[] | null;
          must_haves: string[] | null;
          deal_breakers: string[] | null;
          created_at: string;
          updated_at: string;
        };
      };
      destinations: {
        Row: {
          id: string;
          name: string;
          country: string;
          region: string | null;
          description: string | null;
          type: string[];
          tags: string[] | null;
          budget_range: {
            min: number;
            max: number;
            currency: string;
          };
          best_time_to_visit: {
            months: string[];
            reason: string;
          } | null;
          highlights: string[] | null;
          activities: string[] | null;
          safety_rating: number | null;
          images: { url: string; alt: string }[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          preference_id: string | null;
          status: 'drafting' | 'comparing' | 'building' | 'refining' | 'confirmed' | 'cancelled';
          name: string | null;
          destination_id: string | null;
          start_date: string | null;
          end_date: string | null;
          duration: number | null;
          budget_total: number | null;
          travelers: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
