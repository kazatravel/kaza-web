// /data/.openclaw/workspace/projects/kaza/kaza-app/src/lib/budget.ts

interface FlightOffer {
  id: string;
  price: {
    grandTotal: string;
  };
  // ... other flight details
}

interface FlightPriceFlexibility {
  date: string;
  price: number;
}

interface BudgetCalculationOptions {
  flights?: FlightOffer[];
  flightPrices?: FlightPriceFlexibility[]; // Alternative: flexible pricing data
  hotelPricePerNight?: number;
  dailyExpenses?: number; // per person, per day (excluding hotel)
  numberOfDays?: number;
  numberOfAdults?: number;
  // ... potentially other cost categories
}

export function calculateTripBudget(options: BudgetCalculationOptions) {
  const { 
    flights, 
    flightPrices,
    hotelPricePerNight,
    dailyExpenses = 50, 
    numberOfDays = 1, 
    numberOfAdults = 1 
  } = options;

  // Calculate flight cost
  let totalFlightCost = 0;
  let cheapestFlightCost = 0;
  let averageFlightCost = 0;

  if (flightPrices && flightPrices.length > 0) {
    // Use flexible pricing if available
    const prices = flightPrices.map(f => f.price);
    cheapestFlightCost = Math.min(...prices);
    averageFlightCost = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    totalFlightCost = cheapestFlightCost; // Use cheapest for budget
  } else if (flights && flights.length > 0) {
    // Fallback to old flight offers format
    const cheapestFlight = flights.sort((a, b) => 
      parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal)
    )[0];
    totalFlightCost = parseFloat(cheapestFlight.price.grandTotal);
    cheapestFlightCost = totalFlightCost;
    averageFlightCost = totalFlightCost;
  }

  // Calculate hotel cost
  const hotelCost = hotelPricePerNight 
    ? hotelPricePerNight * numberOfDays * numberOfAdults
    : 0;

  // Calculate other daily expenses (food, activities, transport)
  const otherDailyCosts = dailyExpenses * numberOfDays * numberOfAdults;

  // Total budget
  const totalBudget = totalFlightCost + hotelCost + otherDailyCosts;

  return {
    totalFlightCost: Math.round(totalFlightCost),
    cheapestFlightCost: Math.round(cheapestFlightCost),
    averageFlightCost: Math.round(averageFlightCost),
    hotelCost: Math.round(hotelCost),
    otherDailyCosts: Math.round(otherDailyCosts),
    totalBudget: Math.round(totalBudget),
    currency: 'USD', // Assuming USD for now, could be dynamic from flight data
    breakdown: {
      flights: Math.round(totalFlightCost),
      accommodation: Math.round(hotelCost),
      daily: Math.round(otherDailyCosts),
    }
  };
}

/**
 * Calculate budget with flexibility awareness
 * Useful for showing users how much they can save by being flexible with dates
 */
export function calculateFlexibleBudget(options: BudgetCalculationOptions) {
  const budget = calculateTripBudget(options);
  
  if (!options.flightPrices || options.flightPrices.length === 0) {
    return {
      ...budget,
      savingsOpportunity: 0,
      recommendedDates: []
    };
  }

  const { cheapestFlightCost, averageFlightCost } = budget;
  const savingsOpportunity = Math.round(averageFlightCost - cheapestFlightCost);
  
  // Recommend the 3 cheapest dates
  const recommendedDates = options.flightPrices
    .sort((a, b) => a.price - b.price)
    .slice(0, 3)
    .map(f => ({ date: f.date, price: f.price, savings: Math.round(averageFlightCost - f.price) }));

  return {
    ...budget,
    savingsOpportunity,
    recommendedDates
  };
}
