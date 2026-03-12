// Partial output from Agent C before Gemini overload failure
// This amadeusFetch helper should be integrated into the restart

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com'; // Use test environment for now

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
    throw new Error('Amadeus API credentials not configured');
  }

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: AMADEUS_CLIENT_ID,
      client_secret: AMADEUS_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch access token: ${response.statusText}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  // Token usually expires in 1800 seconds (30 mins). Set expiry slightly earlier.
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  
  return accessToken;
}

export async function amadeusFetch(endpoint: string, params: Record<string, string | number>) {
  const token = await getAccessToken();
  const url = new URL(`${AMADEUS_BASE_URL}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Amadeus API error (${endpoint}):`, errorBody);
    throw new Error(`Amadeus API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
