'use client';

import { cn } from '@/lib/utils';
import { Palmtree, Heart, Mountain, Landmark, Building2, Coffee, Waves, Footprints, Camera, Sparkles } from 'lucide-react';

const VIBES = [
  { id: 'all', label: 'All Vibes', icon: Waves },
  { id: 'Romantic', label: 'Romantic', icon: Heart },
  { id: 'Adventure', label: 'Adventure', icon: Mountain },
  { id: 'Cultural', label: 'Cultural', icon: Landmark },
  { id: 'Relaxed', label: 'Relaxed', icon: Palmtree },
  { id: 'City', label: 'City Life', icon: Building2 },
  { id: 'Foodie', label: 'Foodie', icon: Coffee },
  { id: 'Nature', label: 'Nature', icon: Footprints },
  { id: 'Scenic', label: 'Scenic', icon: Camera },
  { id: 'Luxury', label: 'Luxury', icon: Sparkles },
];

interface VibeSelectorProps {
  selectedVibe: string | null;
  onSelect: (vibe: string | null) => void;
}

export function VibeSelector({ selectedVibe, onSelect }: VibeSelectorProps) {
  const current = selectedVibe || 'all';

  return (
    <div className="w-full pb-6 pt-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory">
      <div className="flex gap-4 px-2 sm:px-0 min-w-max">
        {VIBES.map((vibe) => {
          const Icon = vibe.icon;
          const isSelected = current === vibe.id || (vibe.id === 'all' && !selectedVibe);
          
          return (
            <button
              key={vibe.id}
              onClick={() => onSelect(vibe.id === 'all' ? null : vibe.id)}
              className={cn(
                "group relative flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 snap-center border-2 whitespace-nowrap outline-none focus:ring-4 focus:ring-zinc-200",
                isSelected 
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-900/20 scale-105" 
                  : "bg-white text-zinc-500 border-transparent hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                isSelected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200 group-hover:text-zinc-600"
              )}>
                 <Icon className="w-4 h-4" />
              </div>
              <span className="tracking-wide">{vibe.label}</span>
              
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
