import { NextResponse } from 'next/server';
import { amadeusFetch } from '@/lib/amadeus';
import OpenAI from 'openai';

// We don't need Supabase admin client here anymore!
// The user's browser will handle saving trips.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cache for city codes to avoid hitting Amadeus repeatedly
const cityCodeCache: Record<string, string> = {};

async function getCityCode(city: string): Promise<string | null> {
  // Check cache first
  if (cityCodeCache[city]) return cityCodeCache[city];

  try {
    const locations = await amadeusFetch('/v1/reference-data/locations', {
      keyword: city,
      subType: 'CITY',
      limit: 1,
    });
    
    if (locations.data && locations.data.length > 0) {
      const code = locations.data[0].iataCode;
      cityCodeCache[city] = code;
      return code;
    }
  } catch (error) {
    console.error(`Failed to lookup city code for ${city}:`, error);
  }
  return null;
}

async function getFlightPrice(origin: string, destination: string, date: string): Promise<number | null> {
  try {
    const flights = await amadeusFetch('/v2/shopping/flight-offers', {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: date,
      adults: 1,
      max: 1,
      currencyCode: 'USD'
    });
    
    if (flights.data && flights.data.length > 0) {
      return parseFloat(flights.data[0].price.total);
    }
  } catch (error) {
    console.error(`Failed to get flight price from ${origin} to ${destination}:`, error);
  }
  return null;
}

async function getHotelPrice(cityCode: string, checkIn: string): Promise<number | null> {
  try {
    // Calculate check-out (1 night later for estimate)
    const checkOutDate = new Date(checkIn);
    checkOutDate.setDate(checkOutDate.getDate() + 1);
    const checkOut = checkOutDate.toISOString().split('T')[0];

    // Get hotels in city
    const hotels = await amadeusFetch('/v1/reference-data/locations/hotels/by-city', {
      cityCode,
      radius: 5,
      radiusUnit: 'KM',
      hotelSource: 'ALL',
    });

    if (!hotels.data || hotels.data.length === 0) return null;

    // Get offers for top 3 hotels (to increase chance of finding one)
    const hotelIds = hotels.data.slice(0, 3).map((h: any) => h.hotelId).join(',');
    
    const offers = await amadeusFetch('/v3/shopping/hotel-offers', {
      hotelIds,
      adults: 1,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      roomQuantity: 1,
      currency: 'USD',
      bestRateOnly: 'true'
    });

    if (offers.data && offers.data.length > 0) {
      // Return the cheapest offer found for 1 night
      return parseFloat(offers.data[0].offers[0].price.total);
    }
  } catch (error) {
    console.error(`Failed to get hotel price for ${cityCode}:`, error);
  }
  return null;
}

export async function POST(request: Request) {
  const data = await request.json();
  const { homeCity, budget, interests, tripLength } = data; // homeCity is IATA code now

  if (!homeCity) {
    return NextResponse.json({ error: 'Home city (IATA) is required' }, { status: 400 });
  }

  // Calculate a future date for flight search (e.g. 3 months from now)
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);
  const departureDate = futureDate.toISOString().split('T')[0];

  try {
    // --- OpenAI for Intelligent Recommendations ---
    const prompt = `You are a world-class travel agent AI. Given the following user preferences, suggest 5 diverse and compelling travel destinations. 
    
    The user wants NET NEW ideas based on:
    - Flying from: ${homeCity}
    - Budget: $${budget}
    - Interests: ${interests || 'Any'}
    - Duration: ${tripLength || 7} days

    For each destination, provide:
    - **destination**: The city name (e.g., Paris)
    - **country**: The country (e.g., France)
    - **description**: Engaging description emphasizing why it fits the specific interests '${interests}'.
    - **why**: A personalized reason matching the user's criteria.
    - **type**: Travel type (e.g., Adventure, Relaxation).
    - **highlights**: 2-3 key spots.
    - **activities**: 2-3 activities matching '${interests}'.
    - **iata_code**: The 3-letter IATA airport code (Critical).

    Format output as a JSON ARRAY of objects. No other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: 'Generate recommendations.' }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8, // Slightly higher for creativity/variety
    });

    const rawContent = completion.choices[0].message.content;
    const aiRecommendations = JSON.parse(rawContent || '{ "destinations": [] }').destinations || JSON.parse(rawContent || '[]');

    const list = Array.isArray(aiRecommendations) ? aiRecommendations : (aiRecommendations as any).destinations;

    if (!list || list.length === 0) {
      throw new Error('OpenAI returned no recommendations.');
    }

    // Enhance with Amadeus Real-Time Pricing
    const enhancedRecommendations = await Promise.all(list.map(async (dest: any) => {
      let flightPrice = null;
      let hotelPricePerNight = null;

      // Ensure we have a code
      if (!dest.iata_code) {
        dest.iata_code = await getCityCode(dest.destination);
      }

      if (dest.iata_code) {
        const [flight, hotel] = await Promise.all([
          getFlightPrice(homeCity, dest.iata_code, departureDate),
          getHotelPrice(dest.iata_code, departureDate) 
        ]);
        flightPrice = flight;
        hotelPricePerNight = hotel;
      }

      // Fallbacks if API fails (so UI doesn't break)
      const nightlyRate = hotelPricePerNight || (budget / (tripLength || 7)) * 0.3 || 150;
      const estimatedHotelCost = nightlyRate * (tripLength || 7);
      const totalEstimatedCost = (flightPrice || 600) + estimatedHotelCost;

      return {
        id: dest.iata_code + '-' + Date.now(), // Dynamic ID
        destination: dest.destination,
        country: dest.country,
        description: dest.description,
        why: dest.why,
        flightPrice: flightPrice ? Math.round(flightPrice) : null,
        hotelPricePerNight: hotelPricePerNight ? Math.round(hotelPricePerNight) : null,
        hotelEstimate: Math.round(estimatedHotelCost),
        totalEstimate: Math.round(totalEstimatedCost),
        type: dest.type,
        highlights: dest.highlights,
        activities: dest.activities,
        imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(dest.destination + ' travel')}` 
      };
    }));

    return NextResponse.json(enhancedRecommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: (error as Error).message || 'Server error' }, { status: 500 });
  }
}
