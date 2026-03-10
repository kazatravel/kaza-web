'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plane } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import airportsData from '@/lib/airports.json';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface AirportPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function AirportPicker({ value, onChange, className }: AirportPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAirports = React.useMemo(() => {
    if (!query) return airportsData.slice(0, 50); // Show top 50 initially
    const lowerQuery = query.toLowerCase();
    return airportsData.filter((airport) =>
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery) ||
      airport.iata.toLowerCase().includes(lowerQuery)
    ).slice(0, 50); // Limit results
  }, [query]);

  const selectedAirport = airportsData.find((a) => a.iata === value);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {selectedAirport ? (
          <span className="flex items-center gap-2 truncate">
            <span className="font-bold text-primary">{selectedAirport.iata}</span>
            <span className="text-muted-foreground truncate">
              {selectedAirport.city}, {selectedAirport.country}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">Select airport...</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-md">
          <div className="flex items-center border-b px-3 py-2">
            <Plane className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-6 w-full rounded-md bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search city or code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="p-1">
            {filteredAirports.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No airport found.</div>
            ) : (
              filteredAirports.map((airport) => (
                <div
                  key={airport.iata}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    value === airport.iata && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    onChange(airport.iata);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === airport.iata ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <div className="font-medium">
                      {airport.city} ({airport.iata})
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {airport.name}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
