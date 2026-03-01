export type ActivityType = 'activity' | 'meal' | 'lodging' | 'transport' | 'note';

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  startTime?: string; // "14:00"
  duration?: number; // minutes
  type: ActivityType;
  location?: string;
  cost?: number;
  imageUrl?: string;
  status?: 'idea' | 'planned' | 'booked';
}

export interface DayColumn {
  id: string; // "day-1", "day-2"
  date: string; // ISO date string
  dayNumber: number;
  items: ActivityItem[];
}

export interface ItineraryState {
  tripId: string;
  days: DayColumn[];
  playground: ActivityItem[]; // Unassigned items
}

export interface Reservation extends ActivityItem {
  bookingId?: string;
  confirmationCode?: string;
  providerName?: string;
  status: 'booked' | 'planned';
}
