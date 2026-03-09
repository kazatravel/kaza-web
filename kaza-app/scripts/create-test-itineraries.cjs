const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestData() {
  console.log('Creating test itineraries for comparison...');

  // 1. Create a dummy trip if needed (or use existing)
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert([{}])
    .select()
    .single();

  if (tripError) {
    console.error('Error creating trip:', tripError);
    return;
  }

  const tripId = trip.id;
  console.log(`Created test trip: ${tripId}`);

  // 2. Create Itinerary A (The Relaxed Luxury)
  const { data: itinA, error: errA } = await supabase
    .from('itineraries')
    .insert([{
      trip_id: tripId,
      title: 'Relaxed Luxury in Paris',
      summary: 'A slow-paced luxury trip with focus on fine dining and relaxation.',
      total_cost: 5000,
      status: 'draft'
    }])
    .select()
    .single();

  // 3. Create Itinerary B (Action-Packed Adventure)
  const { data: itinB, error: errB } = await supabase
    .from('itineraries')
    .insert([{
      trip_id: tripId,
      title: 'Action-Packed Paris',
      summary: 'See everything in Paris in 3 days. Fast paced and exciting.',
      total_cost: 3500,
      status: 'draft'
    }])
    .select()
    .single();

  if (errA || errB) {
    console.error('Error creating itineraries:', errA || errB);
    return;
  }

  console.log(`Created Itinerary A: ${itinA.id}`);
  console.log(`Created Itinerary B: ${itinB.id}`);

  // 4. Add some days and activities to Itinerary A
  const { data: dayA } = await supabase
    .from('itinerary_days')
    .insert([{ itinerary_id: itinA.id, day_number: 1, title: 'Arrival', accommodation: { name: 'Ritz Paris', cost: 1000 } }])
    .select().single();
  
  await supabase.from('itinerary_activities').insert([
    { day_id: dayA.id, title: 'Fine Dining', type: 'meal', cost: 300, time_of_day: 'evening' }
  ]);

  // 5. Add some days and activities to Itinerary B
  const { data: dayB } = await supabase
    .from('itinerary_days')
    .insert([{ itinerary_id: itinB.id, day_number: 1, title: 'The Sprint', accommodation: { name: 'Ibis Paris', cost: 150 } }])
    .select().single();

  await supabase.from('itinerary_activities').insert([
    { day_id: dayB.id, title: 'Eiffel Tower', type: 'activity', cost: 50, time_of_day: 'morning' },
    { day_id: dayB.id, title: 'Louvre Museum', type: 'activity', cost: 40, time_of_day: 'afternoon' },
    { day_id: dayB.id, title: 'Seine Cruise', type: 'activity', cost: 30, time_of_day: 'evening' },
    { day_id: dayB.id, title: 'Quick Crepe', type: 'meal', cost: 15, time_of_day: 'night' }
  ]);

  console.log('\nTest data created successfully!');
  console.log('Use these IDs to test the comparison API:');
  console.log(JSON.stringify([itinA.id, itinB.id]));
}

createTestData();
