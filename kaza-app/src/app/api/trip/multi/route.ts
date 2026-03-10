export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { amadeusFetch } from '@/lib/amadeus';

interface DestinationInput {
  city: string;
  checkIn: string;
  checkOut: string;
  country?: string;
}

async function getCityCode(city: string): Promise<string | null> {
  if (/^[A-Z]{3}$/i.test(city)) return city.toUpperCase();
  try {
    const locations = await amadeusFetch('/v1/reference-data/locations', {
      keyword: city, subType: 'CITY', limit: 1,
    });
    if (locations.data?.length > 0) return locations.data[0].iataCode;
  } catch (e) { console.error('City lookup failed:', e); }
  return null;
}

async function searchFlights(o: string, d: string, dt: string, a: number): Promise<any[]> {
  try {
    const r = await amadeusFetch('/v2/shopping/flight-offers', {
      originLocationCode: o, destinationLocationCode: d, departureDate: dt,
      adults: String(a), max: 3, currencyCode: 'USD',
    });
    if (!r.data?.length) return [];
    return r.data.map((x: any) => {
      const seg = x.itineraries[0].segments;
      return {
        id: x.id, price: x.price,
        origin: seg[0].departure.iataCode,
        destination: seg[seg.length-1].arrival.iataCode,
        departure: seg[0].departure.at,
        arrival: seg[seg.length-1].arrival.at,
        duration: x.itineraries[0].duration.replace('PT', '').toLowerCase(),
        stops: seg.length - 1,
        airlineName: r.dictionaries?.carriers?.[seg[0].carrierCode] || seg[0].carrierCode,
      };
    });
  } catch (e) { console.error('Flight error:', e); return []; }
}

async function searchHotels(c: string, inD: string, outD: string, a: number): Promise<any[]> {
  try {
    const h = await amadeusFetch('/v1/reference-data/locations/hotels/by-city', {
      cityCode: c, radius: 10, radiusUnit: 'KM', hotelSource: 'ALL',
    });
    if (!h.data?.length) return [];
    const ids = h.data.slice(0, 15).map((x: any) => x.hotelId).join(',');
    const o = await amadeusFetch('/v3/shopping/hotel-offers', {
      hotelIds: ids, adults: String(a), checkInDate: inD, checkOutDate: outD,
      roomQuantity: '1', currency: 'USD', bestRateOnly: 'true',
    });
    if (!o.data?.length) return [];
    const nights = Math.ceil((new Date(outD).getTime() - new Date(inD).getTime()) / (1000 * 60 * 60 * 24));
    return o.data.map((x: any) => {
      const p = parseFloat(x.offers?.[0]?.price?.total || 0);
      return {
        id: x.hotel?.hotelId, name: x.hotel?.name || 'Unknown',
        rating: x.hotel?.rating,
        price: { total: p, perNight: parseFloat((p / (nights || 1)).toFixed(2)), currency: 'USD' },
        nights, checkIn: inD, checkOut: outD,
      };
    });
  } catch (e) { console.error('Hotel error:', e); return []; }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.origin || !b.destinations?.length) {
      return NextResponse.json({ error: 'Origin and destinations required' }, { status: 400 });
    }
    if (b.destinations.length > 5) {
      return NextResponse.json({ error: 'Max 5 destinations' }, { status: 400 });
    }
    if (b.destinations.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 destinations' }, { status: 400 });
    }

    const t = b.travelers || 2;
    const originCode = await getCityCode(b.origin);
    if (!originCode) return NextResponse.json({ error: 'Invalid origin' }, { status: 400 });

    const dests = [];
    for (const d of b.destinations) {
      const code = await getCityCode(d.city);
      if (!code) return NextResponse.json({ error: `Invalid: ${d.city}` }, { status: 400 });
      const nights = Math.ceil((new Date(d.checkOut).getTime() - new Date(d.checkIn).getTime()) / 86400000);
      dests.push({ city: d.city, cityCode: code, checkIn: d.checkIn, checkOut: d.checkOut, nights });
    }

    const legs = [];
    let cur = originCode;
    for (const d of dests) {
      const f = await searchFlights(cur, d.cityCode, d.checkIn, t);
      legs.push({ from: cur, to: d.cityCode, city: d.city, date: d.checkIn, flights: f });
      cur = d.cityCode;
    }
    const ret = await searchFlights(cur, originCode, dests.at(-1)?.checkOut, t);
    legs.push({ from: cur, to: originCode, city: b.origin, date: dests.at(-1)?.checkOut, flights: ret });

    const results = [];
    let totalFlightCost = 0;
    let totalHotelCost = 0;

    for (let i = 0; i < dests.length; i++) {
      const d = dests[i];
      const hotels = await searchHotels(d.cityCode, d.checkIn, d.checkOut, t);
      const avgPrice = hotels.length ? hotels.reduce((a: number, h: any) => a + h.price.total, 0) / hotels.length : 0;
      const leg = legs[i] || { flights: [] };
      const flightPrice = leg.flights[0]?.price?.total ? parseFloat(leg.flights[0].price.total) : 0;
      totalFlightCost += flightPrice;
      totalHotelCost += avgPrice;

      results.push({
        city: d.city,
        nights: d.nights,
        hotelCostPerNight: avgPrice ? Math.round(avgPrice / d.nights) : 0,
        hotelTotal: Math.round(avgPrice),
        flightCost: Math.round(flightPrice),
        flights: leg.flights,
        hotels: hotels.slice(0, 5),
      });
    }

    const returnLeg = legs.at(-1);
    const returnFlightCost = returnLeg?.flights[0]?.price?.total ? parseFloat(returnLeg.flights[0].price.total) : 0;
    totalFlightCost += returnFlightCost;

    return NextResponse.json({
      success: true,
      origin: b.origin,
      destinationCount: dests.length,
      destinations: results,
      totalFlightCost: Math.round(totalFlightCost),
      totalHotelCost: Math.round(totalHotelCost),
      grandTotal: Math.round(totalFlightCost + totalHotelCost),
      flightLegs: legs.map(l => ({
        from: l.from, to: l.to, city: l.city, date: l.date,
        flightCount: l.flights.length,
        lowestPrice: l.flights[0]?.price?.total || null,
      })),
    });
  } catch (e: any) {
    console.error('Multi-destination error:', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
