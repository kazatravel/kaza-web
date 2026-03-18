import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// IMPORTANT: Do not initialize OpenAI/Redis clients at module-load time.
// Next.js may evaluate/bundle routes during build; missing env vars would fail the build.
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function getRatelimit() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10s'),
    analytics: true,
  });
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    const ratelimit = getRatelimit();
    if (ratelimit) {
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return new NextResponse('Too many requests. Please try again later.', { status: 429 });
      }
    }
  }

  try {
    const { query, tripContext } = await req.json();

    if (!query) {
      return new NextResponse('Missing query parameter', { status: 400 });
    }

    const prompt = `You are an AI travel assistant. Suggest unique and interesting activities based on the following query and trip context. Provide a diverse list of activities, including different types (e.g., cultural, adventurous, relaxed, culinary). For each suggestion, provide a concise title and a short description.
    
    Query: "${query}"
    Trip Context: ${tripContext ? JSON.stringify(tripContext) : 'No specific trip context provided.'}
    
    Format your response as a JSON array of objects, where each object has 'title' (string) and 'description' (string) properties. Ensure the JSON is valid and only includes the array.
    
    Example:
    [
      {
        "title": "Explore the Historic Old Town",
        "description": "Wander through cobblestone streets, admire medieval architecture, and discover hidden cafes."
      },
      {
        "title": "Sunset Kayaking Adventure",
        "description": "Paddle along the coastline as the sun sets, offering stunning views and a peaceful experience."
      }
    ]`;

    const openai = getOpenAI();
    if (!openai) {
      return new NextResponse(
        JSON.stringify({ error: 'OPENAI_API_KEY is not configured.' }),
        { status: 501, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o for broader knowledge and good JSON output
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      response_format: { type: "json_object" }, // Request JSON object directly
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI.');
    }

    // OpenAI's response_format type "json_object" might still embed the array in an object
    // Attempt to parse and extract the array if it's nested.
    let suggestions;
    try {
        const parsedContent = JSON.parse(content);
        // Assuming the actual array is directly under a key, e.g., { "activities": [...] } or { "suggestions": [...] }
        if (Array.isArray(parsedContent)) {
            suggestions = parsedContent;
        } else if (typeof parsedContent === 'object' && parsedContent !== null) {
            // Try to find an array value in the object
            const keys = Object.keys(parsedContent);
            for (const key of keys) {
                if (Array.isArray(parsedContent[key])) {
                    suggestions = parsedContent[key];
                    break;
                }
            }
        }
        if (!suggestions) {
            throw new Error('Could not extract suggestions array from OpenAI response.');
        }
    } catch (parseError) {
        console.error("Error parsing OpenAI content as direct array or object with array:", parseError);
        // Fallback: If parsing as a direct array or object-containing-array fails,
        // assume it might be a malformed JSON string and try to recover or throw.
        // For robustness, if "response_format: { type: 'json_object' }" is used,
        // the model *should* generally provide valid JSON.
        throw new Error('Failed to parse AI suggestions response.');
    }
    
    return NextResponse.json(suggestions);
  } catch (error: any) {
    console.error('AI search error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}