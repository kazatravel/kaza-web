export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { amadeusFetch } from '@/lib/amadeus';
import { FlightSearchParams, TripDetails } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');
  const adults = searchParams.get('adults') || '1';

  if (!origin || !destination || !date) {
    return NextResponse.json({ error: 'Origin, destination, and date are required' }, { status: 400 });
  }

  try {
    const flightOffers = await amadeusFetch('/v2/shopping/flight-offers', {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: date,
      adults: adults,
      max: 5,
      currencyCode: 'USD',
      nonStop: false,
    });

    if (!flightOffers.data || flightOffers.data.length === 0) {
      return NextResponse.json({ message: 'No flights found.' });
    }

    const offers = flightOffers.data.map((offer: any) => {
      const itinerary = offer.itineraries[0]; // Assume first itinerary (usually outbound)
      const segments = itinerary.segments;
      const duration = itinerary.duration;
      const numberOfStops = segments.length - 1;
      const airlineCode = segments[0].carrierCode; // Operating airline
      
      // Look up airline name from dictionaries if available
      const airlineName = flightOffers.dictionaries?.carriers?.[airlineCode] || airlineCode;

      return {
        id: offer.id,
        price: offer.price,
        airlineName,
        duration: duration.replace('PT', '').toLowerCase(), // e.g., 5h30m
        numberOfStops,
        stops: numberOfStops,
        segments: segments.map((s: any) => ({
          departure: s.departure,
          arrival: s.arrival,
          carrierCode: s.carrierCode,
          number: s.number,
          duration: s.duration,
        })),
        deepLink: offer.source === 'GDS' ? `https://www.google.com/travel/flights?q=Flights+from+${origin}+to+${destination}+on+${date}` : undefined, // Fallback deep link
      };
    });

    return NextResponse.json(offers);

  } catch (error: any) {
    console.error('Error fetching flights:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch flights' }, { status: 500 });
  }
}
