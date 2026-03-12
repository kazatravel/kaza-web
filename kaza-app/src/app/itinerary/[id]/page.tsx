'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTrip, saveTrip } from '@/lib/itinerary-service';
import { ItineraryBuilder } from '@/components/itinerary/ItineraryBuilder';
import { DayColumn, ActivityItem, Trip } from '@/lib/itinerary-types';

export default function ItineraryPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState<Trip | null>(null);
  const [days, setDays] = useState<DayColumn[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItinerary() {
      try {
        setLoading(true);
        const { trip, days: fetchedDays, error: fetchError } = await getTrip(id);

        if (fetchError) {
          throw new Error(fetchError);
        }
        
        setItinerary(trip);
        setDays(fetchedDays || []); // Ensure days is an array
      } catch (e: any) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchItinerary();
  }, [id]);

  const handleSave = async (updatedDays: DayColumn[]) => {
    try {
      // Create a temporary Trip object if it's a new trip (itinerary is null)
      // The `saveTrip` service will handle the actual creation in Supabase
      const tripToSave: Trip | null = itinerary || {
        id: id, // Use current route ID as a placeholder, saveTrip will generate new UUID if id is not a valid trip ID or for a new trip
        user_id: '', // Will be filled by saveTrip with auth.uid()
        name: 'New Trip',
        start_date: updatedDays.length > 0 ? updatedDays[0].date : null,
        end_date: updatedDays.length > 0 ? updatedDays[updatedDays.length - 1].date : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { success, tripId, error: saveError } = await saveTrip(tripToSave, updatedDays);

      if (saveError) {
        throw new Error(saveError);
      }

      if (success && tripId && !itinerary) {
        // If a new trip was successfully created, update the itinerary state
        // This is important to ensure subsequent saves update the correct trip
        const { trip: newTripData } = await getTrip(tripId); // Fetch the newly saved trip with its data
        if (newTripData) {
            setItinerary(newTripData);
        }
      }

      alert('Itinerary saved successfully!');
    } catch (e: any) {
      console.error(e);
      alert('Error saving itinerary: ' + e.message);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
      <div className="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="font-semibold text-gray-500 animate-pulse text-lg">Preparing your itinerary...</p>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-[70vh] p-8">
      <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 max-w-md text-center">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="mb-6 opacity-80">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold">Try again</button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50/30 p-4 sm:p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl -z-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 mb-4 uppercase tracking-widest">
                Planned Trip
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">{itinerary?.title}</h1>
              <div className="flex items-center gap-4 mt-4 text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  {new Date(itinerary?.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                <div>{new Date(itinerary?.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Collaborator" />
                  </div>
                ))}
                <div className="h-10 w-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  +2
                </div>
              </div>
              <button className="ml-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors rounded-xl">Share</button>
            </div>
          </div>
        </header>

        <ItineraryBuilder initialDays={days} onSave={handleSave} />
      </div>
    </main>
  );
}
