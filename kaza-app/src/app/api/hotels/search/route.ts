export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID || '0r445UZCxjMLRrO1G8cG2vSOTJoITbEx';
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET || '4NnPDB8ed1rGNhBn';
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com';

let amadeusAccessToken: string | null = null;
let tokenExpiryTime: number = 0;

async function getAmadeusAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (amadeusAccessToken && now < tokenExpiryTime) {
    return amadeusAccessToken;
  }

  try {
    const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Amadeus access token error:', errorData);
      return null;
    }

    const data = await response.json();
    amadeusAccessToken = data.access_token;
    tokenExpiryTime = now + (data.expires_in * 1000) - (60 * 1000); // Refresh 1 minute before expiry
    return amadeusAccessToken;
  } catch (error) {
    console.error('Error getting Amadeus access token:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityCode = searchParams.get('cityCode');
  const checkInDate = searchParams.get('checkInDate');
  const checkOutDate = searchParams.get('checkOutDate');
  const adults = searchParams.get('adults');
  const roomQuantity = searchParams.get('roomQuantity');

  if (!cityCode || !checkInDate || !checkOutDate || !adults || !roomQuantity) {
    return NextResponse.json(
      { error: 'Missing required parameters: cityCode, checkInDate, checkOutDate, adults, roomQuantity' },
      { status: 400 }
    );
  }

  const accessToken = await getAmadeusAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Failed to get Amadeus access token' }, { status: 500 });
  }

  try {
    // Step 1: Get hotel IDs by city code
    const hotelListResponse = await fetch(
      `${AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!hotelListResponse.ok) {
      const errorData = await hotelListResponse.json();
      console.error('Amadeus Hotel List API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch hotel list', details: errorData },
        { status: hotelListResponse.status }
      );
    }

    const hotelListData = await hotelListResponse.json();
    const hotelIds = hotelListData.data.map((hotel: any) => hotel.hotelId);

    if (hotelIds.length === 0) {
      return NextResponse.json({ hotels: [], message: 'No hotels found for this city code.' });
    }

    // Step 2: Get hotel offers for each hotel ID
    // Note: Amadeus Hotel Search API (V3) can take multiple hotelIds
    const hotelOffersResponse = await fetch(
      `${AMADEUS_BASE_URL}/v3/shopping/hotel-offers?hotelIds=${hotelIds.join(',')}&adults=${adults}&roomQuantity=${roomQuantity}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!hotelOffersResponse.ok) {
      const errorData = await hotelOffersResponse.json();
      console.error('Amadeus Hotel Offers API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch hotel offers', details: errorData },
        { status: hotelOffersResponse.status }
      );
    }

    const hotelOffersData = await hotelOffersResponse.json();

    return NextResponse.json({ hotels: hotelOffersData.data });
  } catch (error) {
    console.error('Error in hotel search API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
