'use client';

import { Destination } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Heart, MapPin } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
  onSelect: () => void;
}

export function DestinationCard({ destination, onSelect }: DestinationCardProps) {
  const budgetColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-purple-100 text-purple-800',
    luxury: 'bg-amber-100 text-amber-800',
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 overflow-hidden">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{destination.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {destination.country}
            </CardDescription>
          </div>
          <Badge className={budgetColors[destination.budgetLevel]}>
            {destination.budgetLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-600">{destination.description}</p>
        
        <div className="flex flex-wrap gap-1">
          {destination.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Shield className={`w-4 h-4 ${destination.safetyRating >= 4 ? 'text-green-600' : 'text-amber-600'}`} />
          <span>Safety: {destination.safetyRating}/5</span>
          <Heart className="w-4 h-4 text-rose-500 ml-2" />
          <span>{destination.vibe}</span>
        </div>

        <div className="bg-zinc-50 p-3 rounded-lg">
          <p className="text-sm text-zinc-700">
            <span className="font-semibold">Why this fits:</span> {destination.whyThisFits}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm">
            <span className="text-zinc-500">Est. Total:</span>
            <span className="font-bold ml-1">
              ${destination.estimatedCost.total.toLocaleString()}
            </span>
          </div>
          <Button onClick={onSelect}>Select Destination</Button>
        </div>
      </CardContent>
    </Card>
  );
}
