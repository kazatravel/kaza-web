export interface HotelSearchParams {
  cityCode: string; // IATA code or city name
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  adults?: number;
  currency?: string;
}

export interface Hotel {
  id: string;
  name: string;
  chainCode?: string;
  iataCode?: string; // Airport/City code
  address?: {
    lines?: string[];
    postalCode?: string;
    cityName?: string;
    countryCode?: string;
  };
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  rating?: string;
  price?: {
    currency: string;
    total: string;
    base?: string;
  };
  media?: {
    uri: string;
    category?: string;
  }[];
  description?: string;
  amenities?: string[];
  contact?: {
    phone?: string;
    email?: string;
  };
  bookingLink?: string; // Deep link if available
}

export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  currencyCode?: string;
}

export interface FlightOffer {
  id: string;
  price: {
    currency: string;
    total: string;
    base?: string;
  };
  itineraries: {
    duration: string;
    segments: {
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft?: {
        code: string;
      };
      operating?: {
        carrierCode: string;
      };
      duration: string;
      numberOfStops: number;
    }[];
  }[];
  airlineName?: string; // Enhanced property
  deepLink?: string; // Deep link to booking
}

export interface TripDetails {
  flight: FlightOffer;
  hotel?: Hotel;
  estimatedTotalCost: number;
}
