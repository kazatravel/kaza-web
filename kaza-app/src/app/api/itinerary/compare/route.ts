export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { itineraryIds } = await req.json();

    if (!itineraryIds || !Array.isArray(itineraryIds) || itineraryIds.length < 2) {
      return NextResponse.json(
        { error: 'At least two itinerary IDs are required for comparison.' },
        { status: 400 }
      );
    }

    // Fetch itineraries with their days and activities
    const { data: itineraries, error } = await supabaseAdmin
      .from('itineraries')
      .select(`
        *,
        itinerary_days (
          *,
          itinerary_activities (*)
        )
      `)
      .in('id', itineraryIds);

    if (error) {
      console.error('Error fetching itineraries:', error);
      return NextResponse.json({ error: 'Failed to fetch itineraries' }, { status: 500 });
    }

    if (!itineraries || itineraries.length === 0) {
      return NextResponse.json({ error: 'No itineraries found' }, { status: 404 });
    }

    const comparisonDetails = itineraries.map((itinerary) => {
      let totalFlightCost = 0;
      let totalHotelCost = 0;
      let totalActivityCost = 0;
      let activityCount = 0;
      const duration = itinerary.itinerary_days?.length || 0;

      itinerary.itinerary_days?.forEach((day: any) => {
        // Calculate flight cost from day's flight_info if available
        if (day.flight_info && day.flight_info.cost) {
          totalFlightCost += Number(day.flight_info.cost);
        }

        // Calculate hotel cost from day's accommodation if available
        if (day.accommodation && day.accommodation.cost) {
          totalHotelCost += Number(day.accommodation.cost);
        }

        // Calculate costs from activities
        day.itinerary_activities?.forEach((activity: any) => {
          if (activity.type === 'activity' || activity.type === 'meal') {
            totalActivityCost += Number(activity.cost || 0);
            activityCount++;
          } else if (activity.type === 'transport') {
            totalFlightCost += Number(activity.cost || 0);
          } else if (activity.type === 'accommodation') {
            totalHotelCost += Number(activity.cost || 0);
          }
        });
      });

      // Total cost from calculations vs itinerary.total_cost
      const calculatedTotal = totalFlightCost + totalHotelCost + totalActivityCost;
      const finalTotal = itinerary.total_cost || calculatedTotal;

      // Simple Heuristic for Vibe/Score
      // Score based on balance of activities and cost
      const activityIntensity = duration > 0 ? activityCount / duration : 0;
      let vibe = 'Relaxed';
      if (activityIntensity > 2) vibe = 'Action-Packed';
      else if (activityIntensity > 1) vibe = 'Balanced';

      let score = 70; // Base score
      if (itinerary.is_selected) score += 10;
      if (activityIntensity >= 1 && activityIntensity <= 2.5) score += 15; // Sweet spot for "Balanced"

      return {
        id: itinerary.id,
        title: itinerary.title,
        totalCost: finalTotal,
        costs: {
          flights: totalFlightCost,
          hotels: totalHotelCost,
          activities: totalActivityCost
        },
        duration,
        activityCount,
        vibe,
        score: Math.min(score, 100)
      };
    });

    return NextResponse.json({
      comparison: comparisonDetails,
      itineraries: itineraries
    });
  } catch (err: any) {
    console.error('Comparison API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
