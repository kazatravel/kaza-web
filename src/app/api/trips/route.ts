export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { TripPreferences, Destination } from '@/lib/types';

// Amadeus API Credentials
const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com';

// Internal type for AI response handling
interface AIResponseDestination extends Destination {
  airportCode: string;
}

async function getAmadeusToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', AMADEUS_CLIENT_ID || '');
  params.append('client_secret', AMADEUS_CLIENT_SECRET || '');

  try {
    const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!response.ok) {
      console.error('Amadeus Auth Failed:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Amadeus Auth Error:', error);
    return null;
  }
}

async function getFlightPrice(token: string, origin: string, destinationCode: string, departureDate: string): Promise<number | null> {
  if (!token) return null;

  try {
    const url = `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destinationCode}&departureDate=${departureDate}&adults=1&nonStop=false&max=1`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return parseFloat(data.data[0].price.total);
    }
    return null;
  } catch (error) {
    console.error(`Flight search error for ${destinationCode}:`, error);
    return null;
  }
}

async function generateDestinationsWithAI(prefs: TripPreferences, apiKey: string): Promise<AIResponseDestination[]> {
  const prompt = `
    Generate 5 distinct travel destinations based on these user preferences:
    - Budget: $${prefs.budget} (Total for entire trip)
    - Duration: ${prefs.tripLength} days
    - Interests: ${prefs.interests?.join(', ') || 'General exploration'}
    - Activity Level: ${prefs.activityLevel}
    - Must Haves: ${prefs.mustHaves}
    
    The destinations should range from popular/safe to unique/obscure.
    
    Return ONLY a JSON object with a "destinations" array. Do not include markdown formatting.
    Each destination must match this structure:
    {
      "id": "string (unique)",
      "name": "City, Country",
      "country": "Country Name",
      "airportCode": "IATA Airport Code (e.g. LHR, TYO, JFK)", 
      "description": "Engaging 2-sentence description",
      "imageUrl": "https://source.unsplash.com/800x600/?{search_term_related_to_destination}",
      "budgetLevel": "low" | "medium" | "high" | "luxury",
      "bestTimeToVisit": "string",
      "highlights": ["string", "string", "string"],
      "vibe": "string (e.g. Adventure, Relaxing, Cultural)",
      "matchReasoning": "Specific reason why this matches their preferences (vibe/interests)",
      "estimatedCost": {
        "flights": number (estimate as placeholder),
        "accommodation": number,
        "activities": number,
        "food": number,
        "total": number
      },
      "tags": ["string", "string"],
      "safetyRating": number (1-5)
    }
  `;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://kaza.app',
      'X-Title': 'Kaza Trip Planner'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    return parsed.destinations;
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    throw new Error('Invalid JSON response from AI');
  }
}

function getFallbackDestinations(prefs: TripPreferences): Destination[] {
  const budget = prefs.budget;
  
  return [
    {
      id: 'fb-1',
      name: 'Kyoto',
      country: 'Japan',
      description: 'The cultural heart of Japan, offering a blend of ancient temples, sublime gardens, and traditional tea houses. Experience the perfect harmony of tradition and modernity.',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      budgetLevel: 'medium',
      bestTimeToVisit: 'March-May or October-November',
      highlights: ['Fushimi Inari Shrine', 'Kinkaku-ji', 'Arashiyama Bamboo Grove', 'Gion District'],
      vibe: 'Cultural',
      whyThisFits: 'Matches your interest in culture and history with a safe, walkable environment.',
      estimatedCost: {
        flights: Math.round(budget * 0.3),
        accommodation: Math.round(budget * 0.35),
        activities: Math.round(budget * 0.15),
        food: Math.round(budget * 0.2),
        total: budget
      },
      tags: ['history', 'culture', 'food', 'safe'],
      safetyRating: 5
    },
    {
      id: 'fb-2',
      name: 'Oaxaca City',
      country: 'Mexico',
      description: 'A vibrant culinary capital known for its mole, colorful colonial architecture, and indigenous Zapotec culture. A sensory feast for the adventurous traveler.',
      imageUrl: 'https://images.unsplash.com/photo-1588665330389-9a2c3a373b88?w=800',
      budgetLevel: 'low',
      bestTimeToVisit: 'October-March (Day of the Dead is Nov 1-2)',
      highlights: ['Monte Albán Ruins', 'Hierve el Agua', 'Ethnobotanical Garden', 'Mezcal Tasting'],
      vibe: 'Foodie & Artsy',
      whyThisFits: 'Incredible value for money with world-class food and deep cultural roots.',
      estimatedCost: {
        flights: Math.round(budget * 0.25),
        accommodation: Math.round(budget * 0.3),
        activities: Math.round(budget * 0.2),
        food: Math.round(budget * 0.25),
        total: Math.round(budget * 0.8) 
      },
      tags: ['food', 'art', 'history', 'budget-friendly'],
      safetyRating: 3
    },
    {
      id: 'fb-3',
      name: 'Ljubljana',
      country: 'Slovenia',
      description: 'Europe\'s hidden gem, a green and pedestrian-friendly capital dominated by a hilltop castle. A fairy-tale setting without the crowds of Prague or Vienna.',
      imageUrl: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=800',
      budgetLevel: 'medium',
      bestTimeToVisit: 'April-September',
      highlights: ['Ljubljana Castle', 'Lake Bled Day Trip', 'Tivoli Park', 'Triple Bridge'],
      vibe: 'Relaxed & Romantic',
      whyThisFits: 'Perfect for a relaxed European getaway with stunning nature nearby.',
      estimatedCost: {
        flights: Math.round(budget * 0.35),
        accommodation: Math.round(budget * 0.3),
        activities: Math.round(budget * 0.15),
        food: Math.round(budget * 0.2),
        total: Math.round(budget * 0.95)
      },
      tags: ['nature', 'europe', 'romantic', 'safe'],
      safetyRating: 5
    },
    {
      id: 'fb-4',
      name: 'Sossusvlei',
      country: 'Namibia',
      description: 'Home to the towering red sand dunes of the Namib Desert and the surreal Deadvlei. An otherworldly landscape for those seeking true solitude and adventure.',
      imageUrl: 'https://images.unsplash.com/photo-1519293978507-9c6bb9f8231c?w=800',
      budgetLevel: 'high',
      bestTimeToVisit: 'July-October (Dry Season)',
      highlights: ['Dune 45', 'Deadvlei', 'Star Gazing', 'Safari in Etosha'],
      vibe: 'Adventure',
      whyThisFits: 'A unique, bucket-list adventure that offers complete disconnection.',
      estimatedCost: {
        flights: Math.round(budget * 0.4),
        accommodation: Math.round(budget * 0.3),
        activities: Math.round(budget * 0.2),
        food: Math.round(budget * 0.1),
        total: budget
      },
      tags: ['adventure', 'nature', 'photography', 'desert'],
      safetyRating: 4
    },
    {
      id: 'fb-5',
      name: 'Luang Prabang',
      country: 'Laos',
      description: 'A UNESCO World Heritage site known for its many Buddhist temples, French colonial architecture, and night markets. A spiritual and tranquil riverside retreat.',
      imageUrl: 'https://images.unsplash.com/photo-1558288395-97e3767f4075?w=800',
      budgetLevel: 'low',
      bestTimeToVisit: 'November-March (Dry & Cool)',
      highlights: ['Kuang Si Falls', 'Alms Giving Ceremony', 'Mount Phousi', 'Mekong River Cruise'],
      vibe: 'Spiritual & Chill',
      whyThisFits: 'Offers a slower pace of life and deep spiritual connection.',
      estimatedCost: {
        flights: Math.round(budget * 0.35),
        accommodation: Math.round(budget * 0.25),
        activities: Math.round(budget * 0.2),
        food: Math.round(budget * 0.2),
        total: Math.round(budget * 0.8)
      },
      tags: ['culture', 'spirituality', 'nature', 'budget-friendly'],
      safetyRating: 4
    }
  ];
}

export async function POST(request: NextRequest) {
  try {
    const preferences: TripPreferences = await request.json();

    if (!preferences.budget || !preferences.tripLength) {
      return NextResponse.json(
        { error: 'Budget and trip length are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    let destinations: Destination[] = [];

    // 1. Generate Destinations with AI
    if (apiKey) {
      try {
        destinations = await generateDestinationsWithAI(preferences, apiKey);
      } catch (error) {
        console.error('AI Generation failed, falling back:', error);
        destinations = getFallbackDestinations(preferences);
      }
    } else {
      console.warn('No OpenRouter API key, using fallback');
      destinations = getFallbackDestinations(preferences);
    }

    // 2. Enhance with Real Flight Prices (Amadeus)
    try {
      const amadeusToken = await getAmadeusToken();
      if (amadeusToken) {
        // Default to LAX if origin not provided (though in a real app we'd ask)
        const originCode = 'LAX'; 
        
        // Pick a date 60 days in the future for realistic pricing
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 60);
        const departureDate = futureDate.toISOString().split('T')[0];

        // Process in parallel
        const pricingPromises = destinations.map(async (dest) => {
           // We cast to access the hidden airportCode property
           const aiDest = dest as any;
           
           if (aiDest.airportCode) {
             const price = await getFlightPrice(amadeusToken, originCode, aiDest.airportCode, departureDate);
             if (price) {
               // Price found for destination
               // Update the flight cost
               dest.estimatedCost.flights = Math.round(price);
               // Re-calculate total
               dest.estimatedCost.total = 
                 dest.estimatedCost.flights + 
                 dest.estimatedCost.accommodation + 
                 dest.estimatedCost.activities + 
                 dest.estimatedCost.food;
             }
           }
           return dest;
        });

        destinations = await Promise.all(pricingPromises);
      }
    } catch (amadeusError) {
      console.error('Amadeus integration failed, keeping AI estimates:', amadeusError);
    }

    return NextResponse.json({
      tripId: 'trip-' + Date.now(),
      status: 'success',
      destinations,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
