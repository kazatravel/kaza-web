'use client';

import { FormEvent, useState } from 'react';
import { useRouter } 'next/navigation';
import { AirportPicker } '@/components/ui/airport-picker';
import { createClient } '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } '@/components/ui/card';
import { Button } '@/components/ui/button';
import { Badge } '@/components/ui/badge';
import { Plane, Hotel, DollarSign, MapPin, Loader2, RotateCcw, ArrowRight } 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Recommendation {
  id: string;
  destination: string;
  country: string;
  description: string;
  why: string;
  type: string;
  highlights: string[];
  activities: string[];
  flightPrice: number | null;
  hotelPricePerNight: number | null;
  hotelEstimate: number;
  totalEstimate: number;
  imageUrl: string;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const [tripLength, setTripLength] = useState(7); // Default trip length
  const [budget, setBudget] = useState(2000);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!origin) {
      setError('Please select a valid airport from the list');
      return;
    }
    
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    // Use the state value for origin (airport code)
    data.homeCity = origin;
    data.tripLength = tripLength;
    data.budget = budget;

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to get recommendations');
      }
      
      const json = await res.json();
      setRecommendations(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = async (destination: Recommendation) => {
    // This will eventually pre-fill the multi-destination planner
    // For now, it navigates to the multi-destination planner
    router.push('/plan/multi');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-6xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">KAZA Trip Planner</h1>
        
        {!recommendations ? (
          <div className="max-w-md mx-auto">
            <p className="text-gray-600 mb-6 text-center">Where are you flying from?</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="block">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Airport (Required)
                </label>
                <AirportPicker 
                  value={origin} 
                  onChange={setOrigin} 
                  className="w-full"
                />
              </div>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Trip Length (days)</span>
                <input 
                  name="tripLength" 
                  type="number" 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={tripLength}
                  onChange={(e) => setTripLength(parseInt(e.target.value) || 1)}
                  min={1}
                  required 
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Budget ($ per person)</span>
                <input 
                  name="budget" 
                  type="number" 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                  min={0}
                  required 
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Interests (comma separated)</span>
                <input 
                  name="interests" 
                  type="text" 
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Beach, Hiking, Food, History"
                />
              </label>

              <button 
                type="submit" 
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finding Perfect Trips...
                  </>
                ) : (
                  'Plan My Trip'
                )}
              </button>

              <Button 
                variant="outline" 
                onClick={() => router.push('/plan/multi')}
                className="w-full gap-2 mt-4"
              >
                <ArrowRight className="w-4 h-4" /> Go to Multi-Destination Planner
              </Button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recommended Destinations</h2>
              <Button 
                onClick={() => setRecommendations(null)}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Start Over
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((dest: Recommendation) => (
                <Card key={dest.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                  {dest.imageUrl && (
                    <img src={dest.imageUrl} alt={dest.destination} className="w-full h-48 object-cover" />
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{dest.destination}, {dest.country}</CardTitle>
                    <Badge variant="secondary" className="w-fit">{dest.type}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 text-sm line-clamp-3">{dest.description}</p>
                    <p className="text-sm text-gray-600">**Why this trip?** {dest.why}</p>
                    
                    <div className="space-y-2 text-sm border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1"><Plane className="w-3 h-3"/> Flight ({origin}):</span>
                        <span className="font-medium">{dest.flightPrice ? formatCurrency(dest.flightPrice) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1"><Hotel className="w-3 h-3"/> Hotel (Total for {tripLength} days):</span>
                        <span className="font-medium">{formatCurrency(dest.hotelEstimate)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-bold">Total Estimate:</span>
                        <span className="font-bold text-green-600">{formatCurrency(dest.totalEstimate)}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleSelectTrip(dest)}
                      className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors gap-2"
                      disabled={loading}
                    >
                      <MapPin className="w-4 h-4"/> Plan This Trip
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
