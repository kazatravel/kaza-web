export interface Trip {
  id: string;
  user_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  trip_items?: TripItem[]; // Optional: for fetching with related items
}

export interface TripItem {
  id: string;
  trip_id: string;
  name: string;
  description: string | null;
  type: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityItem extends Omit<TripItem, 'name' | 'trip_id'> {
  title: string; // Maps to TripItem.name
  dayId: string; // For DND-kit to know which day it belongs to
}

export interface DayColumn {
  id: string; // UUID or unique string for DND-kit
  date: string; // YYYY-MM-DD format for display and logical grouping
  items: ActivityItem[];
}

