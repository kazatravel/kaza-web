import { NextRequest, NextResponse } from 'next/server';

/**
 * Standardized Hotel Search API for Kaza
 * Uses Amadeus as a reliable fallback/primary source since Booking.com credentials failed.
 */

const AMADEUS_CLIENT_ID = '0r445UZCxjMLRrO1G8cG2vSOTJoITbEx';
const AMADEUS_CLIENT_SECRET = '4NnPDB8ed1rGNhBn';

async function getAmadeusToken() {
  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Amadeus token');
  }

  const data = await response.json();
  return data.access_token;
}

async function searchHotels(token: string, cityCode: string, checkInDate: string, checkOutDate: string, adults: string) {
  // Step 1: Get list of hotel IDs in the city
  const hotelListResponse = await fetch(
    `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=20&radiusUnit=KM&hotelSource=ALL`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!hotelListResponse.ok) {
    const errorData = await hotelListResponse.json();
    console.error('Hotel List Error:', errorData);
    throw new Error('Failed to fetch hotel list');
  }

  const hotelListData = await hotelListResponse.json();
  const hotelIds = hotelListData.data?.slice(0, 10).map((h: any) => h.hotelId).join(',');

  if (!hotelIds) return [];

  // Step 2: Get offers for these hotels
  const offersResponse = await fetch(
    `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds}&adults=${adults}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomQuantity=1&paymentPolicy=NONE&bestRateOnly=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!offersResponse.ok) {
    const errorData = await offersResponse.json();
    console.error('Hotel Offers Error:', errorData);
    // If v3 fails, it might be due to rate limits or specific hotel availability issues
    return [];
  }

  const offersData = await offersResponse.json();
  return offersData.data || [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityCode = searchParams.get('cityCode'); // IATA code, e.g., NYC, LON
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');
    const adults = searchParams.get('adults') || '1';

    // Validation
    if (!cityCode || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: cityCode, checkInDate, checkOutDate' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json({ error: 'Invalid dates provided' }, { status: 400 });
    }

    if (checkIn >= checkOut) {
      return NextResponse.json({ error: 'checkInDate must be before checkOutDate' }, { status: 400 });
    }

    // Auth and Search
    const token = await getAmadeusToken();
    const hotels = await searchHotels(token, cityCode, checkInDate, checkOutDate, adults);

    // Standardized Output Formatting
    const results = hotels.map((offer: any) => {
      const hotel = offer.hotel;
      const price = offer.offers[0]?.price;
      const stayNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
      
      return {
        name: hotel.name,
        price: {
          total: parseFloat(price?.total || '0'),
          currency: price?.currency || 'USD',
          perNight: parseFloat(price?.total || '0') / stayNights
        },
        rating: hotel.rating || 'N/A',
        // Amadeus search doesn't provide images, so we use a high-quality placeholder 
        // that looks good in the Kaza UI
        image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800`,
        // Deep link placeholder (Kaza will handle affiliate routing)
        booking_url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name)}`
      };
    });

    return NextResponse.json({
      status: 'success',
      data: results
    });

  } catch (error: any) {
    console.error('Hotel Search API Error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
