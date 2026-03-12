import { supabase } from './supabase';
import { Trip, TripItem, DayColumn, ActivityItem } from './itinerary-types';

const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

interface SaveTripResult {
  success: boolean;
  tripId?: string;
  error?: string;
}

// Helper to convert DayColumn[] to TripItem[]
const convertDayColumnsToTripItems = (days: DayColumn[], tripId: string): TripItem[] => {
  return days.flatMap(day => 
    day.items.map(activity => ({
      id: activity.id, // Use existing ID if present, otherwise Supabase will generate
      trip_id: tripId,
      name: activity.title,
      description: activity.description || null,
      type: activity.type || null,
      start_time: activity.start_time || null,
      end_time: activity.end_time || null,
      location: activity.location || null,
      cost: activity.cost || null,
      created_at: activity.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  );
};

// Helper to convert TripItem[] to DayColumn[]
const convertTripItemsToDayColumns = (tripItems: TripItem[]): DayColumn[] => {
  const daysMap = new Map<string, DayColumn>();

  tripItems.forEach(item => {
    const dateKey = item.start_time ? new Date(item.start_time).toISOString().split('T')[0] : 'undated';
    if (!daysMap.has(dateKey)) {
      daysMap.set(dateKey, { 
        id: generateUniqueId(), // Generate a stable ID for DND-kit, though not persisted
        date: dateKey, 
        items: [] 
      });
    }
    const day = daysMap.get(dateKey)!;
    day.items.push({
      id: item.id,
      dayId: day.id, // Reference to the DayColumn ID
      title: item.name,
      description: item.description,
      type: item.type,
      start_time: item.start_time,
      end_time: item.end_time,
      location: item.location,
      cost: item.cost,
      created_at: item.created_at,
      updated_at: item.updated_at,
    });
  });

  // Sort days by date and activities by start_time
  return Array.from(daysMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(day => ({
      ...day,
      items: day.items.sort((a, b) => {
        if (!a.start_time && !b.start_time) return 0;
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      })
    }));
};

export async function getTrip(tripId: string): Promise<{ trip: Trip | null; days: DayColumn[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      trip_items (*)
    `)
    .eq('id', tripId)
    .single();

  if (error) {
    console.error('Error fetching trip:', error);
    return { trip: null, days: null, error: error.message };
  }

  if (!data) {
    return { trip: null, days: null, error: 'Trip not found' };
  }

  const trip: Trip = data;
  const tripItems: TripItem[] = data.trip_items || [];
  const days = convertTripItemsToDayColumns(tripItems);

  return { trip, days, error: null };
}

export async function saveTrip(currentTrip: Trip | null, days: DayColumn[]): Promise<SaveTripResult> {
  try {
    const userResponse = await supabase.auth.getUser();
    if (userResponse.error || !userResponse.data?.user) {
      return { success: false, error: userResponse.error?.message || 'User not authenticated.' };
    }
    const userId = userResponse.data.user.id;

    let tripId: string;

    // 1. Handle Trip (Insert or Update)
    if (currentTrip && currentTrip.id) {
      // Update existing trip
      const { data, error } = await supabase
        .from('trips')
        .update({ 
          name: currentTrip.name, 
          start_date: currentTrip.start_date, 
          end_date: currentTrip.end_date, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', currentTrip.id)
        .eq('user_id', userId) // Ensure user owns the trip
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update trip: ${error.message}`);
      }
      if (!data) {
        throw new Error('Trip not found or user not authorized to update.');
      }
      tripId = data.id;
    } else {
      // Insert new trip
      const newTripName = days.length > 0 && days[0].items.length > 0 ? days[0].items[0].title : 'New Trip';
      const startDate = days.length > 0 ? days[0].date : null;
      const endDate = days.length > 0 ? days[days.length - 1].date : null;

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: userId,
          name: newTripName,
          start_date: startDate,
          end_date: endDate,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create new trip: ${error.message}`);
      }
      tripId = data.id;
    }

    // 2. Handle Trip Items (Delete all existing, then insert new ones)
    // Delete existing trip items for this trip
    const { error: deleteError } = await supabase
      .from('trip_items')
      .delete()
      .eq('trip_id', tripId);

    if (deleteError) {
      throw new Error(`Failed to delete existing trip items: ${deleteError.message}`);
    }

    // Convert DayColumn[] to TripItem[] for insertion
    const tripItemsToInsert = convertDayColumnsToTripItems(days, tripId);
    
    if (tripItemsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('trip_items')
        .insert(tripItemsToInsert);

      if (insertError) {
        throw new Error(`Failed to insert new trip items: ${insertError.message}`);
      }
    }

    return { success: true, tripId };
  } catch (err: any) {
    console.error('Error saving trip:', err.message);
    return { success: false, error: err.message };
  }
}

export async function loadTrips(): Promise<{ trips: Trip[] | null; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { trips: null, error: 'Not authenticated' };
    
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return { trips: data as Trip[], error: null };
  } catch (e: any) {
    console.error('Error loading trips:', e);
    return { trips: null, error: e.message };
  }
}

export async function deleteTrip(tripId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { success: false, error: 'Not authenticated' };
    
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', userData.user.id);
      
    if (error) throw error;
    return { success: true, error: null };
  } catch (e: any) {
    console.error('Error deleting trip:', e);
    return { success: false, error: e.message };
  }
}
