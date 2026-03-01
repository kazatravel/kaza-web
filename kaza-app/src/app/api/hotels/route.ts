import { NextRequest, NextResponse } from 'next/server';

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
  const hotelIds = hotelListData.data.slice(0, 15).map((h: any) => h.hotelId).join(',');

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
    throw new Error('Failed to fetch hotel offers');
  }

  const offersData = await offersResponse.json();
  return offersData.data || [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = searchParams.get('adults') || '1';

  if (!destination || !checkIn || !checkOut) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Basic date validation
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkInDate >= checkOutDate) {
    return NextResponse.json({ error: 'Invalid dates provided' }, { status: 400 });
  }

  try {
    const token = await getAmadeusToken();
    let hotels = await searchHotels(token, destination, checkIn, checkOut, adults);

    // Retry logic if empty (simplified)
    if (hotels.length === 0) {
        // One retry attempt or just return empty
    }

    const formattedHotels = hotels.map((offer: any) => {
      const hotel = offer.hotel;
      const price = offer.offers[0]?.price;
      
      return {
        hotelId: hotel.hotelId,
        name: hotel.name,
        address: hotel.address ? `${hotel.address.lines?.join(', ')}, ${hotel.address.cityName}` : 'Address not available',
        price: {
          amount: parseFloat(price?.total || '0'),
          currency: price?.currency || 'EUR',
          perNight: parseFloat(price?.total || '0') / ((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24))
        },
        rating: hotel.rating || 'N/A',
        amenities: hotel.amenities || [],
        // Default image as Amadeus doesn't provide high-res images in search API
        image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800`
      };
    });

    return NextResponse.json({ 
        count: formattedHotels.length,
        data: formattedHotels 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
