export interface TripPreferences {
  budget: number;
  startDate?: Date;
  endDate?: Date;
  tripLength: number;
  interests: string[];
  activityLevel: 'low' | 'medium' | 'high';
  mustHaves: string;
  homeCity?: string;
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
  itinerary?: ItineraryDay[];
  status: 'drafting' | 'comparing' | 'building' | 'confirmed';
  createdAt: Date;
}
