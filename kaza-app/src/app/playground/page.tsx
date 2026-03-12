'use client';

import { useState, useEffect } from 'react';
import { ActivitySearch } from '@/components/itinerary/ActivitySearch';
import { ItineraryBuilder } from '@/components/itinerary/ItineraryBuilder';
import { DayColumn, ActivityItem, Trip } from '@/lib/itinerary-types';
import { saveTrip, getTrip } from '@/lib/itinerary-service';
import { Plus, Calendar } from 'lucide-react';

const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

export default function PlaygroundPage() {
  const [days, setDays] = useState<DayColumn[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For the playground, we might want to load a "default" or "last edited" trip,
  // or simply start with a blank canvas. For now, let's start blank.
  useEffect(() => {
    // In a real playground, you might load a specific playground trip ID or user's last draft.
    // For this milestone, we'll start with an empty itinerary.
    setDays([{
      id: generateUniqueId(),
      date: new Date().toISOString().split('T')[0], // Today's date
      items: [],
    }]);
    setLoading(false);
  }, []);

  const handleAddActivity = (newActivity: { title: string; description?: string; type?: string; }) => {
    setDays(prevDays => {
      const updatedDays = [...prevDays];
      // Add to the first day, or create a new day if none exist
      if (updatedDays.length === 0) {
        updatedDays.push({
          id: generateUniqueId(),
          date: new Date().toISOString().split('T')[0],
          items: [],
        });
      }
      const targetDay = updatedDays[0]; // Always add to the first day for simplicity in playground

      targetDay.items.push({
        id: generateUniqueId(), // Generate new ID for DND-kit
        dayId: targetDay.id,
        title: newActivity.title,
        description: newActivity.description || null,
        type: newActivity.type || 'activity',
        start_time: null,
        end_time: null,
        location: null,
        cost: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return updatedDays;
    });
  };

  const handleSaveItinerary = async (updatedDays: DayColumn[]) => {
    setLoading(true);
    setError(null);
    try {
      const tripToSave: Trip | null = currentTrip || {
        id: generateUniqueId(), // Placeholder ID, service will replace for new trip
        user_id: '', // Will be filled by saveTrip with auth.uid()
        name: 'My Playground Trip',
        start_date: updatedDays.length > 0 ? updatedDays[0].date : null,
        end_date: updatedDays.length > 0 ? updatedDays[updatedDays.length - 1].date : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { success, tripId, error: saveError } = await saveTrip(tripToSave, updatedDays);

      if (saveError) {
        throw new Error(saveError);
      }

      if (success && tripId && !currentTrip) {
        // If a new trip was successfully created, update the currentTrip state
        const { trip: newTripData } = await getTrip(tripId);
        if (newTripData) {
            setCurrentTrip(newTripData);
        }
      }

      alert('Playground Itinerary saved successfully!');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error saving playground itinerary.');
      alert('Error saving playground itinerary: ' + e.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
      <div className="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="font-semibold text-gray-500 animate-pulse text-lg">Loading Playground...</p>
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
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4">
                <Plus className="h-10 w-10 text-indigo-600" />
                Playground
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Experiment with AI-powered activity suggestions and build your itinerary.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ActivitySearch onAddActivity={handleAddActivity} tripContext={currentTrip} />
          </div>
          <div className="lg:col-span-2">
            <ItineraryBuilder initialDays={days} onSave={handleSaveItinerary} />
          </div>
        </div>
      </div>
    </main>
  );
}
