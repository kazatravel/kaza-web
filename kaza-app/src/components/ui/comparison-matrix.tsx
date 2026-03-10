'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, Minus, Plane, Hotel, DollarSign, MapPin } from 'lucide-react';

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
  hotelPricePerNight: number | null;
  hotelEstimate: number;
  totalEstimate: number;
  imageUrl: string;
  dailyItinerary: DayItinerary[];
}

interface ComparisonMatrixProps {
  destinations: Recommendation[];
  selectedIds: string[];
  onClose: () => void;
}

export function ComparisonMatrix({ destinations, selectedIds, onClose }: ComparisonMatrixProps) {
  const compareItems = selectedIds
    .map(id => destinations.find(d => d.id === id))
    .filter(Boolean) as Recommendation[];

  if (compareItems.length !== 2) {
    return null;
  }

  const [dest1, dest2] = compareItems;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const ComparisonRow = ({ 
    label, 
    value1, 
    value2, 
    icon 
  }: { 
    label: string; 
    value1: React.ReactNode; 
    value2: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-700 items-center">
      <div className="text-sm font-medium text-gray-400 flex items-center gap-2">
        {icon}
        {label}
      </div>
      <div className="text-sm text-gray-200">{value1}</div>
      <div className="text-sm text-gray-200">{value2}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Destination Comparison</h2>
          <Button 
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Hero Images */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-sm font-medium text-gray-400"></div>
            <div className="space-y-3">
              {dest1.imageUrl && (
                <img 
                  src={dest1.imageUrl} 
                  alt={dest1.destination}
                  className="w-full h-48 object-cover rounded-xl shadow-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{dest1.destination}</h3>
                <p className="text-gray-400">{dest1.country}</p>
                <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                  {dest1.type}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              {dest2.imageUrl && (
                <img 
                  src={dest2.imageUrl} 
                  alt={dest2.destination}
                  className="w-full h-48 object-cover rounded-xl shadow-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{dest2.destination}</h3>
                <p className="text-gray-400">{dest2.country}</p>
                <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                  {dest2.type}
                </Badge>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="space-y-0">
            <ComparisonRow 
              label="Why this trip?" 
              value1={<p className="text-sm">{dest1.why}</p>}
              value2={<p className="text-sm">{dest2.why}</p>}
              icon={<MapPin className="w-4 h-4" />}
            />
            
            <ComparisonRow 
              label="Flight Price" 
              value1={dest1.flightPrice ? formatCurrency(dest1.flightPrice) : 'N/A'}
              value2={dest2.flightPrice ? formatCurrency(dest2.flightPrice) : 'N/A'}
              icon={<Plane className="w-4 h-4" />}
            />
            
            <ComparisonRow 
              label="Hotel Total" 
              value1={formatCurrency(dest1.hotelEstimate)}
              value2={formatCurrency(dest2.hotelEstimate)}
              icon={<Hotel className="w-4 h-4" />}
            />
            
            <ComparisonRow 
              label="Total Estimate" 
              value1={<span className="font-bold text-green-400">{formatCurrency(dest1.totalEstimate)}</span>}
              value2={<span className="font-bold text-green-400">{formatCurrency(dest2.totalEstimate)}</span>}
              icon={<DollarSign className="w-4 h-4" />}
            />

            <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-700">
              <div className="text-sm font-medium text-gray-400">Highlights</div>
              <div className="space-y-1">
                {dest1.highlights?.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    {h}
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {dest2.highlights?.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    {h}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-700">
              <div className="text-sm font-medium text-gray-400">Top Activities</div>
              <div className="space-y-1">
                {dest1.activities?.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    {a}
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {dest2.activities?.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Itinerary Preview */}
            {dest1.dailyItinerary?.length > 0 && dest2.dailyItinerary?.length > 0 && (
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-sm font-medium text-gray-400">Sample Days</div>
                <div className="space-y-2">
                  {dest1.dailyItinerary.slice(0, 2).map((day) => (
                    <div key={day.day} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="font-semibold text-purple-400 text-xs mb-1">Day {day.day}</div>
                      <div className="text-sm text-gray-300 font-medium mb-1">{day.title}</div>
                      <div className="text-xs text-gray-400 line-clamp-2">{day.morning}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {dest2.dailyItinerary.slice(0, 2).map((day) => (
                    <div key={day.day} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="font-semibold text-purple-400 text-xs mb-1">Day {day.day}</div>
                      <div className="text-sm text-gray-300 font-medium mb-1">{day.title}</div>
                      <div className="text-xs text-gray-400 line-clamp-2">{day.morning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
