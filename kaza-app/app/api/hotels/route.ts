import { NextResponse } from 'next/server';
import { amadeusFetch } from '@/lib/amadeus';

/**
 * Hotel Search API Endpoint
 * 
 * GET /api/hotels
 * Query params:
 *   - destination: city name or IATA code (required)
 *   - checkIn: YYYY-MM-DD (required)
 *   - checkOut: YYYY-MM-DD (required)
 *   - adults: number of adults (default: 2)
 * 
 * Returns: Array of hotels with name, address, price, rating, image, amenities
 */

// Helper function to convert city name to IATA code if needed
async function getCityCode(destination: string): Promise<string> {
  // If already a 3-letter IATA code, return it
  if (/^[A-Z]{3}$/i.test(destination)) {
    return destination.toUpperCase();
  }

  // Search for the city using Amadeus location API
  try {
    const locations = await amadeusFetch('/v1/reference-data/locations', {
      keyword: destination,
      subType: 'CITY',
    });

    if (locations.data && locations.data.length > 0) {
      return locations.data[0].iataCode;
    }
  } catch (error) {
    console.error('Error fetching city code:', error);
  }

  // Fallback: assume it's already a valid code
  return destination.toUpperCase();
}

// Validate date format and logic
function validateDates(checkIn: string, checkOut: string): { valid: boolean; error?: string } {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
    return { valid: false, error: 'Dates must be in YYYY-MM-DD format' };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return { valid: false, error: 'Check-in date cannot be in the past' };
  }

  if (checkOutDate <= checkInDate) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }

  return { valid: true };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = searchParams.get('adults') || '2';

    // Validate required parameters
    if (!destination) {
      return NextResponse.json(
        { error: 'Missing required parameter: destination' },
        { status: 400 }
      );
    }

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required parameters: checkIn and checkOut dates' },
        { status: 400 }
      );
    }

    // Validate dates
    const dateValidation = validateDates(checkIn, checkOut);
    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      );
    }

    // Get city code
    const cityCode = await getCityCode(destination);

    // Step 1: Find hotels in the city
    let hotelsData;
    try {
      hotelsData = await amadeusFetch('/v1/reference-data/locations/hotels/by-city', {
        cityCode,
        radius: 10,
        radiusUnit: 'KM',
        hotelSource: 'ALL',
      });
    } catch (error: any) {
      // Retry once on failure
      console.warn('First attempt failed, retrying...', error.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
      hotelsData = await amadeusFetch('/v1/reference-data/locations/hotels/by-city', {
        cityCode,
        radius: 10,
        radiusUnit: 'KM',
        hotelSource: 'ALL',
      });
    }

    if (!hotelsData.data || hotelsData.data.length === 0) {
      return NextResponse.json({
        message: `No hotels found for destination: ${destination}`,
        data: [],
      });
    }

    // Step 2: Get hotel IDs (limit to 20 for performance)
    const hotelIds = hotelsData.data.slice(0, 20).map((h: any) => h.hotelId);

    // Step 3: Fetch hotel offers with pricing
    let offersData;
    try {
      offersData = await amadeusFetch('/v3/shopping/hotel-offers', {
        hotelIds: hotelIds.join(','),
        adults,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomQuantity: '1',
        currency: 'USD',
        paymentPolicy: 'NONE',
        bestRateOnly: 'true',
      });
    } catch (error: any) {
      // Retry once on failure
      console.warn('First offer attempt failed, retrying...', error.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
      offersData = await amadeusFetch('/v3/shopping/hotel-offers', {
        hotelIds: hotelIds.join(','),
        adults,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomQuantity: '1',
        currency: 'USD',
        paymentPolicy: 'NONE',
        bestRateOnly: 'true',
      });
    }

    if (!offersData.data || offersData.data.length === 0) {
      return NextResponse.json({
        message: `No available hotel offers for ${destination} on these dates`,
        data: [],
      });
    }

    // Step 4: Transform the data into the required format
    const hotels = offersData.data.map((hotel: any) => {
      const offer = hotel.offers?.[0];
      const price = offer?.price;
      
      // Calculate nights
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate price per night
      const totalPrice = parseFloat(price?.total || '0');
      const pricePerNight = nights > 0 ? totalPrice / nights : totalPrice;

      return {
        id: hotel.hotel?.hotelId,
        name: hotel.hotel?.name || 'Unknown Hotel',
        address: {
          street: hotel.hotel?.address?.lines?.[0] || '',
          city: hotel.hotel?.address?.cityName || destination,
          postalCode: hotel.hotel?.address?.postalCode || '',
          country: hotel.hotel?.address?.countryCode || '',
        },
        location: {
          latitude: hotel.hotel?.latitude || hotel.hotel?.geoCode?.latitude,
          longitude: hotel.hotel?.longitude || hotel.hotel?.geoCode?.longitude,
        },
        rating: hotel.hotel?.rating || null,
        price: {
          perNight: parseFloat(pricePerNight.toFixed(2)),
          total: totalPrice,
          currency: price?.currency || 'USD',
        },
        amenities: hotel.hotel?.amenities || [],
        image: hotel.hotel?.media?.[0]?.uri || null,
        checkIn,
        checkOut,
        nights,
        roomType: offer?.room?.typeEstimated?.category || 'Standard',
        description: offer?.room?.description?.text || hotel.hotel?.description?.text || '',
      };
    });

    return NextResponse.json({
      success: true,
      destination,
      checkIn,
      checkOut,
      adults: parseInt(adults),
      count: hotels.length,
      data: hotels,
    });

  } catch (error: any) {
    console.error('Hotel search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch hotel data',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
