export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { amadeusFetch } from '@/lib/amadeus';
import { supabase } from '@/lib/supabase'; // Import the Supabase client
import { Ratelimit } from "@upstash/ratelimit"; // For rate limiting
import { Redis } from "@upstash/redis"; // For Redis with Upstash

// Placeholder for Gemini API (replace with actual Gemini SDK integration)
// For this environment, we'll simulate the Gemini call with a structured output expectation.
// In a real Next.js app, you'd integrate @google/generative-ai or a similar SDK.
const GEMINI_API_PLACEHOLDER = {
  chat: {
    completions: {
      create: async (params: any) => {
        console.log("Simulating Gemini API call with prompt:", params.messages[0].content);
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        // Return a structured response similar to what we expect from Gemini
        return {
          choices: [{
            message: {
              content: JSON.stringify({
                destinations: [
                  {
                    destination: "Kyoto",
                    country: "Japan",
                    description: "Ancient temples, serene gardens, and vibrant geisha districts await in Japan's cultural capital.",
                    why: "You expressed interest in culture and unique experiences, Kyoto offers a profound dive into traditional Japan.",
                    type: "Cultural, Serene",
                    highlights: ["Kinkaku-ji", "Fushimi Inari-taisha", "Arashiyama Bamboo Grove"],
                    activities: ["Tea ceremony", "Kimono rental", "Explore Gion"],
                    iata_code: "KIX",
                    daily_itinerary: [
                      { day: 1, title: "Arrival & Gion Exploration", morning: "Arrive at Kansai International Airport (KIX), transfer to Kyoto. Check into your traditional ryokan. Explore the historic Gion district, famous for its geishas.", afternoon: "Visit Kiyomizu-dera Temple, a UNESCO World Heritage site with stunning views. Wander through the charming Sannenzaka and Ninenzaka streets.", evening: "Enjoy a traditional Kaiseki dinner and perhaps catch a glimpse of a geisha on their way to appointments." },
                      { day: 2, title: "Temples & Bamboo Forests", morning: "Visit Kinkaku-ji (Golden Pavilion), a magnificent Zen temple. Explore the beautiful Ryoan-ji Temple with its famous rock garden.", afternoon: "Head to Arashiyama Bamboo Grove for a serene walk. Visit Tenryu-ji Temple and the Togetsukyo Bridge.", evening: "Dine at a local restaurant in Arashiyama, savoring authentic Japanese cuisine." }
                    ]
                  },
                  {
                    destination: "Machu Picchu",
                    country: "Peru",
                    description: "Journey to the lost city of the Incas, a breathtaking archaeological wonder nestled high in the Andes Mountains.",
                    why: "For your adventurous spirit and interest in history, Machu Picchu offers an unparalleled trekking and cultural experience.",
                    type: "Adventure, Historical",
                    highlights: ["Machu Picchu Citadel", "Huayna Picchu", "Sun Gate"],
                    activities: ["Hiking the Inca Trail", "Exploring the ruins", "Bird watching"],
                    iata_code: "CUZ",
                    daily_itinerary: [
                      { day: 1, title: "Cusco & Sacred Valley", morning: "Arrive in Cusco (CUZ), acclimatize to the altitude. Explore the charming streets and Plaza de Armas.", afternoon: "Take a day trip to the Sacred Valley, visiting Pisac Market and the Ollantaytambo ruins.", evening: "Enjoy dinner in Cusco, trying local Peruvian dishes." },
                      { day: 2, title: "Machu Picchu Expedition", morning: "Early morning train to Aguas Calientes. Take a bus up to Machu Picchu for a guided tour of the citadel.", afternoon: "Optional hike to Huayna Picchu or Machu Picchu Mountain for panoramic views (advance booking required).", evening: "Return to Aguas Calientes for dinner and relax before heading back to Cusco." }
                    ]
                  }
                ]
              })
            }
          }]
        };
      }
    }
  }
};
// END Placeholder for Gemini API

// Cache for city codes to avoid hitting Amadeus repeatedly
const cityCodeCache: Record<string, string> = {};

// Upstash Redis client for rate limiting
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10s"), // 5 requests per 10 seconds
  analytics: true,
  prefix: "@upstash/ratelimit",
});


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
  // Apply rate limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
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

    // --- Gemini for Intelligent Recommendations and Itinerary Generation ---
    const prompt = `You are a world-class travel agent AI. Given the following user preferences and a list of available destinations, select 5 diverse and compelling travel destinations that best fit the user's criteria. For each selected destination, also generate a detailed daily itinerary for the specified trip duration.

    User Preferences:
    - Flying from: ${homeCity}
    - Total Trip Budget: $${budget} (this is the TOTAL budget for the entire ${tripLength || 7}-day trip, not daily)
    - Interests: ${interests || 'Any'}
    - Duration: ${tripLength || 7} days

    Available Destinations:
    ${JSON.stringify(destinationsListForGemini)}

    For each of the 5 chosen destinations, provide:
    - **destination**: The city name (e.g., Paris)
    - **country**: The country (e.g., France)
    - **description**: Engaging description emphasizing why it fits the specific interests '${interests}'. This should be a concise summary suitable for a card.
    - **why**: A personalized reason matching the user's criteria for choosing this destination from the available list.
    - **type**: Travel type (e.g., Adventure, Relaxation).
    - **highlights**: 2-3 key spots for the destination.
    - **activities**: 2-3 activities matching '${interests}'.
    - **iata_code**: The 3-letter IATA airport code for the primary airport (Critical, infer if not explicitly provided but always return it).
    - **daily_itinerary**: An array of ${tripLength || 7} day objects, each with:
      - **day**: Day number (1, 2, 3, etc.)
      - **title**: A catchy title for the day (e.g., "Exploring Historic Paris")
      - **morning**: Detailed morning activities (2-3 sentences)
      - **afternoon**: Detailed afternoon activities (2-3 sentences)
      - **evening**: Detailed evening activities (2-3 sentences)

    Format output as a JSON ARRAY of objects. Each object should represent one recommended destination. No other text.`;

    const completion = await GEMINI_API_PLACEHOLDER.chat.completions.create({
      // In a real application, you'd use the actual Gemini model (e.g., 'gemini-pro')
      model: 'gemini-pro', 
      messages: [
        { role: 'user', content: prompt } // Gemini usually takes a single 'user' role for prompts like this
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const rawContent = completion.choices[0].message.content;
    const aiRecommendations = JSON.parse(rawContent || '{ "destinations": [] }').destinations || JSON.parse(rawContent || '[]');

    const list = Array.isArray(aiRecommendations) ? aiRecommendations : (aiRecommendations as any).destinations;

    if (!list || list.length === 0) {
      throw new Error('Gemini returned no recommendations or an invalid format. Check prompt and Gemini output.');
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

      // Fallbacks if API fails (so UI doesn't break)
      const flightPrice = flightPricing.cheapest || 600;
      const nightlyRate = hotelPricePerNight || (budget / (tripLength || 7)) * 0.3 || 150;
      const estimatedHotelCost = nightlyRate * (tripLength || 7);
      const totalEstimatedCost = flightPrice + estimatedHotelCost;

      // Find the image URL from our database for the recommended destination
      const dbDestination = destinationsData.find(d => d.name === dest.destination || d.city === dest.destination);
      const imageUrl = dbDestination?.image_url || `https://picsum.photos/seed/${encodeURIComponent(dest.destination)}/800/600`;

      return {
        id: dbDestination?.name || dest.iata_code + '-' + Date.now(), // Use DB name as ID if available, else dynamic
        destination: dest.destination,
        country: dest.country,
        description: dest.description,
        why: dest.why,
        flightPrice: flightPrice ? Math.round(flightPrice) : null,
        flightPriceAverage: flightPricing.average ? Math.round(flightPricing.average) : null,
        flightPriceFlexibility: flightPricing.prices.length > 0 ? flightPricing.prices : null,
        hotelPricePerNight: hotelPricePerNight ? Math.round(hotelPricePerNight) : null,
        hotelEstimate: Math.round(estimatedHotelCost),
        totalEstimate: Math.round(totalEstimatedCost),
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
