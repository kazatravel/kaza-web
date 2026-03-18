export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { amadeusFetch } from '@/lib/amadeus';
import { supabase } from '@/lib/supabase'; // Import the Supabase client
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { openrouterChatJSON } from '@/lib/openrouter';

function getRatelimit() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '10s'),
    analytics: true,
    prefix: '@upstash/ratelimit',
  });
}

// Cache for city codes to avoid hitting Amadeus repeatedly
const cityCodeCache: Record<string, string> = {};



// Utility for retries with exponential backoff
async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) throw error; // Re-throw on last attempt
      console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error("Failed after multiple retries");
}

async function getCityCode(city: string): Promise<string | null> {
  if (cityCodeCache[city]) return cityCodeCache[city];

  return fetchWithRetry(async () => {
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
    return null;
  });
}

async function getFlightPriceWithFlexibility(origin: string, destination: string, date: string): Promise<{
  cheapest: number | null;
  average: number | null;
  prices: { date: string; price: number }[];
}> {
  const flexibilityDays = 3;
  const prices: { date: string; price: number }[] = [];
  
  // Generate dates to check (±3 days)
  const datesToCheck: string[] = [];
  for (let i = -flexibilityDays; i <= flexibilityDays; i++) {
    const checkDate = new Date(date);
    checkDate.setDate(checkDate.getDate() + i);
    datesToCheck.push(checkDate.toISOString().split('T')[0]);
  }

  // Fetch prices for all dates with retry
  const pricePromises = datesToCheck.map(async (checkDate) => {
    try {
      return await fetchWithRetry(async () => {
        const flights = await amadeusFetch('/v2/shopping/flight-offers', {
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: checkDate,
          adults: 1,
          max: 1,
          currencyCode: 'USD'
        });
        
        if (flights.data && flights.data.length > 0) {
          const price = parseFloat(flights.data[0].price.total);
          return { date: checkDate, price };
        }
        return null;
      });
    } catch (error) {
      console.warn(`Failed to fetch price for ${checkDate}:`, error);
      return null;
    }
  });

  const results = await Promise.all(pricePromises);
  results.forEach(result => {
    if (result) prices.push(result);
  });

  if (prices.length === 0) {
    return { cheapest: null, average: null, prices: [] };
  }

  const cheapest = Math.min(...prices.map(p => p.price));
  const average = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;

  return {
    cheapest: Math.round(cheapest),
    average: Math.round(average),
    prices: prices.sort((a, b) => a.price - b.price)
  };
}

async function getHotelPrice(cityCode: string, checkIn: string): Promise<number | null> {
  return fetchWithRetry(async () => {
    const checkOutDate = new Date(checkIn);
    checkOutDate.setDate(checkOutDate.getDate() + 1);
    const checkOut = checkOutDate.toISOString().split('T')[0];

    const hotels = await amadeusFetch('/v1/reference-data/locations/hotels/by-city', {
      cityCode,
      radius: 5,
      radiusUnit: 'KM',
      hotelSource: 'ALL',
    });

    if (!hotels.data || hotels.data.length === 0) return null;

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
      return parseFloat(offers.data[0].offers[0].price.total);
    }
    return null;
  });
}


export async function POST(request: Request) {
  // Apply rate limiting (optional: only if Upstash env vars are configured)
  const ratelimit = getRatelimit();
  if (ratelimit) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }
  }

  const data = await request.json();
  const { homeCity, budget, interests, tripLength } = data;

  if (!homeCity) {
    return NextResponse.json({ error: 'Home city (IATA) is required' }, { status: 400 });
  }

  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);
  const departureDate = futureDate.toISOString().split('T')[0];

  try {
    // 1. Fetch available destinations from Supabase
    const { data: destinationsData, error: dbError } = await supabase
      .from('destinations')
      .select('name, city, country, description, vibe_tags, image_url, latitude, longitude');

    if (dbError) {
      console.error('Supabase fetch error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch destinations from database.' }, { status: 500 });
    }

    if (!destinationsData || destinationsData.length === 0) {
      return NextResponse.json({ error: 'No destinations found in the database.' }, { status: 404 });
    }

    // Prepare destinations for Gemini in a digestible format
    const destinationsListForGemini = destinationsData.map(d => ({
      name: d.name,
      city: d.city,
      country: d.country,
      description: d.description,
      vibe_tags: d.vibe_tags?.join(', ') || ''
    }));

    // --- AI for Intelligent Recommendations and Itinerary Generation (OpenRouter) ---
    const prompt = `You are a world-class travel agent AI. Given the following user preferences and a list of available destinations, select 5 diverse and compelling travel destinations that best fit the user's criteria. For each selected destination, also generate a detailed daily itinerary for the specified trip duration.

User Preferences:
- Flying from (IATA): ${homeCity}
- Total Trip Budget: $${budget} (TOTAL for the entire ${tripLength || 7}-day trip)
- Interests: ${interests || 'Any'}
- Duration: ${tripLength || 7} days

Available Destinations (choose only from this list):
${JSON.stringify(destinationsListForGemini)}

Return JSON in the following format:
{
  "destinations": [
    {
      "destination": "City name",
      "country": "Country",
      "description": "Concise card-friendly description",
      "why": "Personalized reason based on the user's interests/budget/duration",
      "type": "Travel type tags",
      "highlights": ["..."],
      "activities": ["..."],
      "iata_code": "3-letter airport code for the destination city",
      "daily_itinerary": [
        {"day": 1, "title": "...", "morning": "...", "afternoon": "...", "evening": "..."}
      ]
    }
  ]
}

Rules:
- Only choose destinations from the provided list.
- Ensure daily_itinerary has exactly ${tripLength || 7} entries.
- Return valid JSON only.`;

    const ai = await openrouterChatJSON<{ destinations: any[] }>({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You output STRICT JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 2500,
    });

    const list = Array.isArray(ai?.destinations) ? ai.destinations : [];

    if (!list || list.length === 0) {
      throw new Error('AI returned no recommendations (empty destinations list).');
    }

    // Enhance with Amadeus Real-Time Pricing
    const enhancedRecommendations = await Promise.all(list.map(async (dest: any) => {
      let flightPricing = { cheapest: null, average: null, prices: [] };
      let hotelPricePerNight = null;

      // Ensure we have a code
      if (!dest.iata_code) {
        dest.iata_code = await getCityCode(dest.destination);
      }

      if (dest.iata_code) {
        const [flight, hotel] = await Promise.all([
          getFlightPriceWithFlexibility(homeCity, dest.iata_code, departureDate),
          getHotelPrice(dest.iata_code, departureDate) 
        ]);
        flightPricing = flight;
        hotelPricePerNight = hotel;
      }

      // No fake pricing fallbacks: if APIs fail, keep values null and let UI show N/A.
      const flightPrice = flightPricing.cheapest;
      const estimatedHotelCost = hotelPricePerNight ? hotelPricePerNight * (tripLength || 7) : null;
      const totalEstimatedCost = flightPrice && estimatedHotelCost ? (flightPrice + estimatedHotelCost) : null;

      // Find the image URL from our database. If missing, use a real Unsplash source endpoint (not a dummy placeholder service).
      const dbDestination = destinationsData.find(d => d.name === dest.destination || d.city === dest.destination);
      const imageUrl = dbDestination?.image_url || `https://source.unsplash.com/featured/800x600?${encodeURIComponent(dest.destination)}`;

      return {
        id: dbDestination?.name || dest.iata_code + '-' + Date.now(), // Use DB name as ID if available, else dynamic
        destination: dest.destination,
        country: dest.country,
        description: dest.description,
        why: dest.why,
        flightPrice: typeof flightPrice === 'number' ? Math.round(flightPrice) : null,
        flightPriceAverage: typeof flightPricing.average === 'number' ? Math.round(flightPricing.average) : null,
        flightPriceFlexibility: flightPricing.prices.length > 0 ? flightPricing.prices : null,
        hotelPricePerNight: typeof hotelPricePerNight === 'number' ? Math.round(hotelPricePerNight) : null,
        hotelEstimate: typeof estimatedHotelCost === 'number' ? Math.round(estimatedHotelCost) : null,
        totalEstimate: typeof totalEstimatedCost === 'number' ? Math.round(totalEstimatedCost) : null,
        type: dest.type,
        highlights: dest.highlights,
        activities: dest.activities,
        imageUrl: imageUrl, // Use image from DB or fallback
        dailyItinerary: dest.daily_itinerary || [] 
      };
    }));

    return NextResponse.json(enhancedRecommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: (error as Error).message || 'Server error' }, { status: 500 });
  }
}
