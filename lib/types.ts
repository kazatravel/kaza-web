export interface TripPreferences {
  budget: number;
  startDate?: Date;
  endDate?: Date;
  tripLength: number;
  interests: string[];
  activityLevel: 'low' | 'medium' | 'high';
  mustHaves: string;
  homeCity?: string;
  dateFlexibility: 'exact' | '3days' | '1week' | 'flexible';
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  budgetLevel: 'low' | 'medium' | 'high' | 'luxury';
  bestTimeToVisit: string;
  highlights: string[];
  vibe: string;
  whyThisFits: string;
  estimatedCost: {
    flights: number;
    accommodation: number;
    activities: number;
    food: number;
    total: number;
  };
  tags: string[];
  safetyRating: number;
}

export interface ItineraryDay {
  day: number;
  date: Date;
  activities: Activity[];
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  accommodation?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  cost: number;
  category: string;
  location: string;
}

export interface Trip {
  id: string;
  preferences: TripPreferences;
  selectedDestination?: Destination;
  destinations?: Destination[];
  itinerary?: ItineraryDay[];
  status: 'drafting' | 'comparing' | 'building' | 'confirmed';
  createdAt: Date;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
