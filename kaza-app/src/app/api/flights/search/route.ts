// /data/.openclaw/workspace/projects/kaza/kaza-app/src/app/api/flights/search/route.ts
import { NextResponse } from 'next/server';
import { amadeusFetch } from '@/lib/amadeus';
import { fetchWithRetry } from '@/lib/utils'; // Assuming this path

export async function POST(request: Request) {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate, // Optional for one-way flights
      adults = 1,
      children = 0,
      infants = 0,
      travelClass = 'ECONOMY', // e.g., ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
      nonStop = false,
      maxPrice,
      currencyCode = 'USD',
      flexibilityDays = 3, // For +/- days flexibility
    } = await request.json();

    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return NextResponse.json(
        { message: 'Missing required flight search parameters.' },
        { status: 400 }
      );
    }

    const searchPromises = [];
    const datesToSearch = [departureDate];

    // Add flexibility for departure date
    for (let i = 1; i <= flexibilityDays; i++) {
      const prevDay = new Date(departureDate);
      prevDay.setDate(prevDay.getDate() - i);
      datesToSearch.push(prevDay.toISOString().split('T')[0]);

      const nextDay = new Date(departureDate);
      nextDay.setDate(nextDay.getDate() + i);
      datesToSearch.push(nextDay.toISOString().split('T')[0]);
    }

    // Ensure unique dates and sort them
    const uniqueDates = Array.from(new Set(datesToSearch)).sort();

    for (const date of uniqueDates) {
      const params: Record<string, string | number> = {
        originLocationCode,
        destinationLocationCode,
        departureDate: date,
        adults,
        currencyCode,
        'travelClass': travelClass,
        'nonStop': nonStop ? 'true' : 'false',
      };

      if (returnDate) {
        // Add flexibility for return date if provided
        const returnDatesToSearch = [returnDate];
        for (let i = 1; i <= flexibilityDays; i++) {
          const prevDay = new Date(returnDate);
          prevDay.setDate(prevDay.getDate() - i);
          returnDatesToSearch.push(prevDay.toISOString().split('T')[0]);

          const nextDay = new Date(returnDate);
          nextDay.setDate(nextDay.getDate() + i);
          returnDatesToSearch.push(nextDay.toISOString().split('T')[0]);
        }
        const uniqueReturnDates = Array.from(new Set(returnDatesToSearch)).sort();

        for (const returnDateOption of uniqueReturnDates) {
          searchPromises.push(
            fetchWithRetry(() => amadeusFetch('/v2/shopping/flight-offers', { ...params, returnDate: returnDateOption }))
          );
        }
      } else {
        // One-way flight
        searchPromises.push(
          fetchWithRetry(() => amadeusFetch('/v2/shopping/flight-offers', params))
        );
      }
    }

    const results = await Promise.allSettled(searchPromises);

    const successfulFlights: any[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value?.data?.length > 0) {
        successfulFlights.push(...result.value.data);
      } else if (result.status === 'rejected') {
        console.error('Flight search failed for one or more dates:', result.reason);
      }
    });

    // Deduplicate flights and sort by price
    const uniqueFlights = Array.from(new Map(successfulFlights.map(flight => [flight.id, flight])).values());
    uniqueFlights.sort((a, b) => parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal));

    return NextResponse.json({ flights: uniqueFlights });
  } catch (error: any) {
    console.error('Error in flight search API:', error);
    return NextResponse.json(
      { message: 'Failed to fetch flight information.', error: error.message },
      { status: 500 }
    );
  }
}
