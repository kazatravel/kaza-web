'use client';

import { useState } from 'react';
import { Questionnaire } from '@/components/questionnaire';
import { DestinationGrid } from '@/components/destination-grid';
import { VibeSelector } from '@/components/vibe-selector';
import { TripPreferences, Destination } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Compass, ArrowLeft, Share2, Heart, MapPin, Sparkles } from 'lucide-react';
// cn removed

export default function Home() {
  const [step, setStep] = useState<'questionnaire' | 'loading' | 'results'>('questionnaire');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);

  const handleQuestionnaireComplete = async (preferences: TripPreferences) => {
    setStep('loading');

    // Simulate API delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const response = await fetch('/api/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setDestinations(data.destinations);
      setStep('results');
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
      // Fallback to local data if API fails
      setDestinations(getFallbackDestinations(preferences));
      setStep('results');
    }
  };

  const getFallbackDestinations = (preferences: TripPreferences): Destination[] => {
    const budget = preferences.budget || 5000;
    return [
      {
        id: '1',
        name: 'Santorini',
        country: 'Greece',
        description: 'Iconic whitewashed villages on volcanic cliffs with stunning Aegean views.',
        imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
        budgetLevel: 'high',
        bestTimeToVisit: 'May to October',
        highlights: ['Sunset in Oia', 'Wine tasting', 'Volcanic beaches'],
        vibe: 'Romantic',
        whyThisFits: 'Matches your romantic getaway preferences',
        estimatedCost: { flights: Math.round(budget*0.3), accommodation: Math.round(budget*0.4), activities: Math.round(budget*0.15), food: Math.round(budget*0.15), total: budget },
        tags: ['romantic', 'beach', 'luxury'],
        safetyRating: 5,
      },
      {
        id: '2',
        name: 'Bali',
        country: 'Indonesia',
        description: 'Tropical paradise with temples, rice terraces, and world-class beaches.',
        imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
        budgetLevel: 'medium',
        bestTimeToVisit: 'April to October',
        highlights: ['Ubud rice terraces', 'Uluwatu Temple', 'Beach clubs'],
        vibe: 'Relaxed',
        whyThisFits: 'Great value with diverse experiences',
        estimatedCost: { flights: Math.round(budget*0.25), accommodation: Math.round(budget*0.3), activities: Math.round(budget*0.25), food: Math.round(budget*0.2), total: Math.round(budget*0.85) },
        tags: ['adventure', 'beach', 'culture'],
        safetyRating: 4,
      },
      {
        id: '3',
        name: 'Kyoto',
        country: 'Japan',
        description: 'Ancient temples, traditional gardens, and world-class cuisine.',
        imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
        budgetLevel: 'medium',
        bestTimeToVisit: 'March-May or Oct-Nov',
        highlights: ['Fushimi Inari', 'Arashiyama', 'Gion district'],
        vibe: 'Cultural',
        whyThisFits: 'Rich cultural experience with amazing food',
        estimatedCost: { flights: Math.round(budget*0.32), accommodation: Math.round(budget*0.35), activities: Math.round(budget*0.18), food: Math.round(budget*0.15), total: budget },
        tags: ['culture', 'food', 'history'],
        safetyRating: 5,
      },
      {
        id: '4',
        name: 'Costa Rica',
        country: 'Costa Rica',
        description: 'Biodiversity hotspot with rainforests, volcanoes, and beaches.',
        imageUrl: 'https://images.unsplash.com/photo-1518182170546-0766bc6f9213?w=800&q=80',
        budgetLevel: 'medium',
        bestTimeToVisit: 'December to April',
        highlights: ['Arenal Volcano', 'Cloud forests', 'Wildlife'],
        vibe: 'Adventure',
        whyThisFits: 'Perfect for adventure and nature lovers',
        estimatedCost: { flights: Math.round(budget*0.28), accommodation: Math.round(budget*0.32), activities: Math.round(budget*0.25), food: Math.round(budget*0.15), total: Math.round(budget*0.9) },
        tags: ['adventure', 'nature', 'wildlife'],
        safetyRating: 4,
      },
      {
        id: '5',
        name: 'Reykjavik',
        country: 'Iceland',
        description: 'Land of fire and ice with stunning waterfalls, glaciers, and northern lights.',
        imageUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800&q=80',
        budgetLevel: 'high',
        bestTimeToVisit: 'Sept-Mar (Lights)',
        highlights: ['Blue Lagoon', 'Golden Circle', 'Northern Lights'],
        vibe: 'Nature',
        whyThisFits: 'Unmatched natural beauty and adventure',
        estimatedCost: { flights: Math.round(budget*0.35), accommodation: Math.round(budget*0.35), activities: Math.round(budget*0.2), food: Math.round(budget*0.2), total: Math.round(budget*1.1) },
        tags: ['nature', 'adventure', 'scenery'],
        safetyRating: 5,
      },
      {
        id: '6',
        name: 'New York City',
        country: 'USA',
        description: 'The city that never sleeps, offering world-class dining, arts, and energy.',
        imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
        budgetLevel: 'high',
        bestTimeToVisit: 'Anytime',
        highlights: ['Central Park', 'Broadway', 'Museums'],
        vibe: 'City',
        whyThisFits: 'Ultimate urban experience',
        estimatedCost: { flights: Math.round(budget*0.2), accommodation: Math.round(budget*0.5), activities: Math.round(budget*0.15), food: Math.round(budget*0.25), total: Math.round(budget*1.1) },
        tags: ['city', 'food', 'culture'],
        safetyRating: 4,
      },
    ];
  };

  const filteredDestinations = selectedVibe 
    ? destinations.filter(d => d.vibe === selectedVibe || d.tags.includes(selectedVibe.toLowerCase())) 
    : destinations;

  return (
    <main className="min-h-screen bg-zinc-50 font-sans selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setStep('questionnaire')}
            >
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-900/20 group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-5 h-5 text-white group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-zinc-900">Kaza</span>
            </div>
            
            <div className="flex items-center gap-4">
               {step === 'results' && (
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                        setStep('questionnaire');
                        setDestinations([]);
                        setSelectedDestination(null);
                        setSelectedVibe(null);
                    }} 
                    className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full px-4"
                 >
                    New Search
                 </Button>
               )}
               <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
                  <span className="sr-only">Profile</span>
                  <div className="w-4 h-4 bg-zinc-300 rounded-full" />
               </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 'questionnaire' && (
          <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-8">
            <div className="text-center mb-16 space-y-6">
              <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest border border-rose-100 shadow-sm">
                 <Sparkles className="w-3 h-3" />
                 AI Trip Planner
              </span>
              <h1 className="heading-lg">
                Where will your story <span className="text-zinc-400">begin?</span>
              </h1>
              <p className="subheading max-w-lg mx-auto">
                Tell us a bit about your style, and our AI will curate the perfect destinations with real-time pricing estimates.
              </p>
            </div>
            <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 transform transition-all hover:shadow-zinc-300/50">
                <Questionnaire onComplete={handleQuestionnaireComplete} />
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-50 duration-1000"></div>
                <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center relative z-10 border border-zinc-50">
                    <Compass className="w-10 h-10 text-rose-500 animate-spin duration-[3000ms]" />
                </div>
            </div>
            <h2 className="text-3xl font-bold mb-3 tracking-tight text-zinc-900">Curating your experience...</h2>
            <p className="text-zinc-500 animate-pulse text-lg">Analyzing flights, hotels, and local vibes.</p>
          </div>
        )}

        {step === 'results' && !selectedDestination && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-100">
              <div className="space-y-2">
                <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">Your Perfect Trips</h2>
                <p className="text-zinc-500 text-lg">Based on your preferences, we found {destinations.length} perfect matches.</p>
              </div>
              <div className="w-full md:w-auto">
                 <VibeSelector selectedVibe={selectedVibe} onSelect={setSelectedVibe} />
              </div>
            </div>
            
            <DestinationGrid destinations={filteredDestinations} onSelect={setSelectedDestination} />
          </div>
        )}

        {selectedDestination && (
          <div className="max-w-6xl mx-auto animate-in slide-in-from-right-8 duration-500">
            <Button 
                variant="ghost" 
                onClick={() => setSelectedDestination(null)} 
                className="mb-8 pl-0 hover:pl-2 transition-all hover:bg-transparent text-zinc-500 hover:text-zinc-900 group font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to results
            </Button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Hero Image */}
                    <div className="relative aspect-[16/9] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-900/10 group">
                        <img 
                            src={selectedDestination.imageUrl} 
                            alt={selectedDestination.name} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute top-6 right-6 flex gap-3 z-10">
                             <Button size="icon" variant="secondary" className="rounded-full h-12 w-12 bg-white/90 backdrop-blur-md hover:bg-white text-zinc-900 shadow-lg">
                                 <Share2 className="w-5 h-5" />
                             </Button>
                             <Button size="icon" variant="secondary" className="rounded-full h-12 w-12 bg-white/90 backdrop-blur-md hover:bg-white text-rose-500 shadow-lg">
                                 <Heart className="w-5 h-5 fill-current" />
                             </Button>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-10 pt-32">
                            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">{selectedDestination.name}</h1>
                            <div className="flex items-center gap-4 text-white/90">
                                <span className="flex items-center gap-2 text-xl font-medium px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                    <MapPin className="w-5 h-5" />
                                    {selectedDestination.country}
                                </span>
                                <span className="flex items-center gap-2 text-xl font-medium px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    {selectedDestination.vibe}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-zinc-900">Why this fits your vibe</h3>
                            <p className="text-zinc-600 leading-relaxed text-lg font-light">{selectedDestination.whyThisFits}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-zinc-900">Trip Highlights</h3>
                            <div className="space-y-3">
                                {selectedDestination.highlights.map((h, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-emerald-600 font-bold">✓</span>
                                        </div>
                                        <span className="text-zinc-700 font-medium">{h}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-2xl shadow-zinc-200/50 sticky top-28">
                        <div className="mb-8 text-center border-b border-zinc-50 pb-8">
                            <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest mb-2">Estimated Total Cost</p>
                            <div className="text-5xl font-extrabold text-zinc-900 tracking-tight">
                                ${selectedDestination.estimatedCost.total.toLocaleString()}
                            </div>
                            <p className="text-sm text-zinc-400 mt-3 font-medium">For {destinations.length > 0 ? '1 traveler' : 'your group'}</p>
                        </div>

                        <h3 className="font-bold text-lg mb-6 text-zinc-900 flex items-center gap-2">
                            <span className="w-1 h-6 bg-zinc-900 rounded-full"></span>
                            Cost Breakdown
                        </h3>
                        <div className="space-y-4 mb-8">
                            <CostRow label="Flights" amount={selectedDestination.estimatedCost.flights} icon="✈️" />
                            <CostRow label="Accommodation" amount={selectedDestination.estimatedCost.accommodation} icon="🏨" />
                            <CostRow label="Activities" amount={selectedDestination.estimatedCost.activities} icon="🎟️" />
                            <CostRow label="Food & Dining" amount={selectedDestination.estimatedCost.food} icon="🍽️" />
                        </div>

                        <Button className="w-full h-14 text-lg rounded-2xl font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-900/20 hover:shadow-zinc-900/30 transition-all hover:-translate-y-1">
                          Build Itinerary
                        </Button>
                        
                        <p className="text-center text-xs text-zinc-400 mt-4 px-4 leading-relaxed">
                            *Prices are estimates based on real-time data and may vary by season.
                        </p>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function CostRow({ label, amount, icon }: { label: string, amount: number, icon: string }) {
    return (
        <div className="flex justify-between items-center p-3 rounded-xl hover:bg-zinc-50 transition-colors group">
            <div className="flex items-center gap-3">
                <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{icon}</span>
                <span className="text-zinc-600 font-medium">{label}</span>
            </div>
            <span className="font-bold text-zinc-900">${amount.toLocaleString()}</span>
        </div>
    );
}
