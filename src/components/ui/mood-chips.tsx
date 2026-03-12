'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Mountain, 
  Waves, 
  Building2, 
  UtensilsCrossed, 
  Gem, 
  Trees, 
  Camera, 
  Music,
  Heart,
  Sparkles
} from 'lucide-react';

export interface MoodChip {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const MOOD_CHIPS: MoodChip[] = [
  { id: 'adventure', label: 'Adventure', icon: <Mountain className="w-4 h-4" /> },
  { id: 'beach', label: 'Beach', icon: <Waves className="w-4 h-4" /> },
  { id: 'culture', label: 'Culture', icon: <Building2 className="w-4 h-4" /> },
  { id: 'foodie', label: 'Foodie', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: 'luxury', label: 'Luxury', icon: <Gem className="w-4 h-4" /> },
  { id: 'nature', label: 'Nature', icon: <Trees className="w-4 h-4" /> },
  { id: 'photography', label: 'Photography', icon: <Camera className="w-4 h-4" /> },
  { id: 'nightlife', label: 'Nightlife', icon: <Music className="w-4 h-4" /> },
  { id: 'romantic', label: 'Romantic', icon: <Heart className="w-4 h-4" /> },
  { id: 'spiritual', label: 'Spiritual', icon: <Sparkles className="w-4 h-4" /> },
];

interface MoodChipsProps {
  selectedMoods: string[];
  onChange: (moods: string[]) => void;
}

export function MoodChips({ selectedMoods, onChange }: MoodChipsProps) {
  const toggleMood = (moodId: string) => {
    if (selectedMoods.includes(moodId)) {
      onChange(selectedMoods.filter(id => id !== moodId));
    } else {
      onChange([...selectedMoods, moodId]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-200">
        What's your vibe? (Select all that apply)
      </label>
      <div className="flex flex-wrap gap-2">
        {MOOD_CHIPS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => toggleMood(mood.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 transform hover:scale-105
              ${selectedMoods.includes(mood.id)
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }
            `}
          >
            {mood.icon}
            {mood.label}
          </button>
        ))}
      </div>
      {selectedMoods.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          {selectedMoods.length} vibe{selectedMoods.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
