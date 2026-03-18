'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AirportPicker } from '@/components/ui/airport-picker';
import { MoodChips } from '@/components/ui/mood-chips';
import { ComparisonMatrix } from '@/components/ui/comparison-matrix';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Hotel, DollarSign, MapPin, Loader2, RotateCcw, ArrowRight, Sparkles, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Import the shared Supabase client

interface DayItinerary {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
}

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
  flightPriceAverage: number | null;
  flightPriceFlexibility: { date: string; price: number }[] | null;
  hotelPricePerNight: number | null;
  hotelEstimate: number;
  totalEstimate: number;
  imageUrl: string;
  dailyItinerary: DayItinerary[];
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const [tripLength, setTripLength] = useState(7);
  const [budget, setBudget] = useState(2000);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<Recommendation | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!origin) {
      setError('Please select a valid airport from the list');
      return;
    }
    
    setLoading(true);
    const data = {
      homeCity: origin,
      tripLength,
      budget,
      interests: selectedMoods.join(', '), // Convert mood chips to comma-separated interests
    };

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
      console.error('Failed to fetch recommendations:', err);
      setError(err.message || 'Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = async (destination: Recommendation) => {
    router.push('/plan/multi');
  };

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(cid => cid !== id));
    } else if (compareIds.length < 2) {
      setCompareIds([...compareIds, id]);
    } else {
      // Replace the first one if already 2 selected
      setCompareIds([compareIds[1], id]);
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (typeof amount !== 'number' || Number.isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            KAZA Discovery Engine
          </h1>
          <p className="text-gray-400 text-lg">Your AI-powered travel companion</p>
        </div>
        
        {!recommendations ? (
          <div className="max-w-2xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 rounded-xl backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">!</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-400 mb-1">Error</h3>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Discovery Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 shadow-2xl">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">
                  Where are you flying from?
                </label>
                <AirportPicker 
                  value={origin} 
                  onChange={setOrigin} 
                  className="w-full bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Trip Length (days)
                  </label>
                  <input 
                    name="tripLength" 
                    type="number" 
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400
                    focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={tripLength}
                    onChange={(e) => setTripLength(parseInt(e.target.value) || 1)}
                    min={1}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Budget ($ per person)
                  </label>
                  <input 
                    name="budget" 
                    type="number" 
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400
                    focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                    min={0}
                    required 
                  />
                </div>
              </div>

              {/* Mood Chips */}
              <MoodChips selectedMoods={selectedMoods} onChange={setSelectedMoods} />

              <button 
                type="submit" 
                className={`w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl text-base font-semibold
                bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500
                text-white shadow-lg shadow-purple-500/50 transition-all duration-200 transform hover:scale-[1.02]
                ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Discovering Your Perfect Trips...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Discover My Perfect Trip
                  </>
                )}
              </button>

              <Button 
                type="button"
                variant="outline" 
                onClick={() => router.push('/plan/multi')}
                className="w-full gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white py-6"
              >
                <ArrowRight className="w-4 h-4" /> Skip to Multi-Destination Planner
              </Button>
            </form>
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold">Your Perfect Destinations</h2>
                <p className="text-gray-400 mt-1">Handpicked by AI just for you</p>
              </div>
              <div className="flex gap-3">
                {compareIds.length === 2 && (
                  <Button 
                    onClick={() => setShowComparison(true)}
                    className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                  >
                    <Check className="w-4 h-4" /> Compare Selected ({compareIds.length})
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setRecommendations(null);
                    setCompareIds([]);
                    setShowComparison(false);
                  }}
                  variant="outline"
                  className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" /> Start Over
                </Button>
              </div>
            </div>
            
            {/* Bento Box Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((dest: Recommendation) => {
                const isSelected = compareIds.includes(dest.id);
                return (
                  <Card 
                    key={dest.id} 
                    className={`group overflow-hidden bg-gray-900/50 backdrop-blur-sm border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02] ${
                      isSelected ? 'border-green-500 shadow-lg shadow-green-500/30' : 'border-gray-800 hover:border-purple-500/50'
                    }`}
                  >
                    {/* Hero Image with Overlay */}
                    <div className="relative h-56 overflow-hidden">
                      {dest.imageUrl && (
                        <img 
                          src={dest.imageUrl} 
                          alt={dest.destination} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                      
                      {/* Type Badge */}
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
                        {dest.type}
                      </Badge>

                      {/* Compare Checkbox */}
                      <button
                        onClick={() => toggleCompare(dest.id)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50' 
                            : 'bg-gray-900/80 border-gray-600 hover:border-green-500'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>

                      {/* Destination Name Overlay */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">{dest.destination}</h3>
                        <p className="text-gray-200 text-sm drop-shadow">{dest.country}</p>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      {/* AI Why Section - Premium Highlight */}
                      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Why this fits your vibe</p>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed">{dest.why}</p>
                      </div>

                      {/* Price Breakdown */}
                      <div className="space-y-2 text-sm bg-gray-800/50 rounded-lg p-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-gray-300">
                            <span className="flex items-center gap-2">
                              <Plane className="w-4 h-4 text-blue-400"/> Flight
                            </span>
                            <span className="font-medium text-white">
                              {dest.flightPrice ? formatCurrency(dest.flightPrice) : 'N/A'}
                            </span>
                          </div>
                          {dest.flightPriceFlexibility && dest.flightPriceFlexibility.length > 0 && (
                            <div className="text-xs text-gray-400 pl-6">
                              ±3 days: {formatCurrency(Math.min(...dest.flightPriceFlexibility.map(p => p.price)))} - {formatCurrency(Math.max(...dest.flightPriceFlexibility.map(p => p.price)))}
                              {dest.flightPriceAverage && (
                                <span className="ml-2">(avg: {formatCurrency(dest.flightPriceAverage)})</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-gray-300">
                          <span className="flex items-center gap-2">
                            <Hotel className="w-4 h-4 text-purple-400"/> Hotel ({tripLength}d)
                          </span>
                          <span className="font-medium text-white">
                            {formatCurrency(dest.hotelEstimate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-2">
                          <span className="font-bold text-gray-200">Total</span>
                          <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
                            {formatCurrency(dest.totalEstimate)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Highlights */}
                      {dest.highlights && dest.highlights.length > 0 && (
                        <div className="space-y-1">
                          {dest.highlights.slice(0, 3).map((highlight, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                              <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTA Buttons */}
                      {dest.dailyItinerary && dest.dailyItinerary.length > 0 && (
                        <Button
                          onClick={() => setSelectedItinerary(dest)}
                          variant="outline"
                          className="w-full py-3 border-2 border-purple-500/50 text-purple-300 hover:bg-purple-900/30 hover:border-purple-400 font-semibold transition-all duration-200 gap-2"
                        >
                          <Sparkles className="w-4 h-4"/> View Day-by-Day Itinerary
                        </Button>
                      )}
                      <Button
                        onClick={() => handleSelectTrip(dest)}
                        className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg transition-all duration-200 gap-2"
                      >
                        <MapPin className="w-4 h-4"/> Plan This Trip
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Comparison Matrix Modal */}
            {showComparison && recommendations && (
              <ComparisonMatrix 
                destinations={recommendations}
                selectedIds={compareIds}
                onClose={() => setShowComparison(false)}
              />
            )}

            {/* Day-by-Day Itinerary Modal */}
            {selectedItinerary && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-gray-900 border-2 border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-500/20">
                  {/* Header */}
                  <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-900 to-blue-900 p-6 border-b border-purple-500/30">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          {selectedItinerary.destination}, {selectedItinerary.country}
                        </h2>
                        <p className="text-purple-200 flex items-center gap-2">
                          <Sparkles className="w-4 h-4"/> Your {tripLength}-Day Adventure
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedItinerary(null)}
                        className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Itinerary Content */}
                  <div className="p-6 space-y-6">
                    {selectedItinerary.dailyItinerary.map((day) => (
                      <div key={day.day} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {day.day}
                          </div>
                          <h3 className="text-2xl font-bold text-white">{day.title}</h3>
                        </div>
                        
                        <div className="space-y-4 ml-15">
                          {/* Morning */}
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-20 text-sm font-semibold text-amber-400 uppercase tracking-wide">
                              Morning
                            </div>
                            <p className="text-gray-300 leading-relaxed flex-1">{day.morning}</p>
                          </div>
                          
                          {/* Afternoon */}
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-20 text-sm font-semibold text-orange-400 uppercase tracking-wide">
                              Afternoon
                            </div>
                            <p className="text-gray-300 leading-relaxed flex-1">{day.afternoon}</p>
                          </div>
                          
                          {/* Evening */}
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-20 text-sm font-semibold text-indigo-400 uppercase tracking-wide">
                              Evening
                            </div>
                            <p className="text-gray-300 leading-relaxed flex-1">{day.evening}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer CTA */}
                  <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-6">
                    <Button
                      onClick={() => {
                        setSelectedItinerary(null);
                        handleSelectTrip(selectedItinerary);
                      }}
                      className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-semibold shadow-lg gap-2"
                    >
                      <MapPin className="w-5 h-5"/> Book This {tripLength}-Day Adventure
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
