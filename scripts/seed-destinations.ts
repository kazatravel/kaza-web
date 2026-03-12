import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface DestinationData {
  name: string;
  country: string;
  description: string;
  type: string;
  iata_code: string;
  budget_range: { min: number; max: number };
  trip_types: string[];
  highlights: string[];
  activities: string[];
  image_url?: string; // Optional for now
  is_active: boolean;
}

async function generateAndSeedDestinations() {
  console.log('Starting destination data generation and seeding...');

  const prompt = `You are an AI assistant specialized in generating travel destination data. Generate 10 diverse travel destinations. For each destination, provide:
    - **name**: The city name (e.g., Kyoto)
    - **country**: The country (e.g., Japan)
    - **description**: A brief, engaging description (2-3 sentences).
    - **type**: General travel type (e.g., cultural, adventure, relaxation, city-break).
    - **iata_code**: The IATA code for the primary airport in the city (e.g., KIX).
    - **budget_range**: An object with estimated min and max budget (USD) for a 7-day trip for one person (e.g., { min: 1500, max: 3000 }).
    - **trip_types**: An array of suitable trip types (e.g., ["solo", "family", "romantic"]).
    - **highlights**: An array of 2-3 key highlights or attractions.
    - **activities**: An array of 2-3 popular activities.
    - **image_url**: A placeholder or example image URL for now.
    - **is_active**: true

    Ensure the iata_code is always a valid 3-letter airport code for the city.
    Format your output as a JSON array of objects, like this example: [\n  { "name": "City1", "country": "Country1", ... },\n  { "name": "City2", "country": "Country2", ... }\n]. Only return the JSON array, no other text.

    `;

  try {
    console.log('Calling OpenAI for destination data...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', 
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: 'Generate 10 destinations.' }
      ],
      temperature: 0.7,
    });

const rawContent = completion.choices[0].message.content;
        console.log('\n--- Raw OpenAI Content (for debugging) ---');
        console.log(rawContent);
        console.log('--------------------------------------------\n');

        let rawDestinations: DestinationData[] = [];
        try {
const cleanedContent = rawContent?.replace(/^```json\s*|s*```$/g, '').trim();
        rawDestinations = JSON.parse(cleanedContent || '[]');
        } catch (jsonParseError: any) {
            console.error('JSON parsing failed:', jsonParseError.message);
            throw new Error('OpenAI returned invalid JSON: ' + (rawContent?.substring(0, 200) || ''));
        }
        
        if (!Array.isArray(rawDestinations) || rawDestinations.length === 0) {
          throw new Error('OpenAI did not return valid destination data (empty array or not an array).');
        }
    console.log(`Generated ${rawDestinations.length} destinations. Seeding to Supabase...`);

    // Insert into Supabase (handle potential duplicates or just insert)
    const { data, error } = await supabase.from('destinations').insert(rawDestinations);

    if (error) {
      console.error('Error seeding destinations to Supabase:', error);
      return { success: false, error: error.message };
    }

    console.log('Destination data seeded successfully!', data);
    return { success: true, count: rawDestinations.length };

  } catch (error) {
    console.error('Global error during generation/seeding:', error);
    return { success: false, error: (error as Error).message };
  }
}

generateAndSeedDestinations();
