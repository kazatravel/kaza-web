'use client';

import { useEffect, useState } from 'react';
import { Destination } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Sparkles } from 'lucide-react';
import { createApi } from 'unsplash-js';

// Initialize Unsplash API (client-side capable)
const unsplash = createApi({
  accessKey: 'AQsgWNbs0v15v9eSaWe8nWtmiWp8oa7fMmMiaLhETKY',
});

// Simple in-memory cache
const imageCache: Record<string, string> = {};

interface DestinationGridProps {
  destinations: Destination[];
  onSelect: (destination: Destination) => void;
}

export function DestinationGrid({ destinations, onSelect }: DestinationGridProps) {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchImages = async () => {
      const newImages: Record<string, string> = {};
      
      for (const dest of destinations) {
        if (imageCache[dest.name]) {
          newImages[dest.id] = imageCache[dest.name];
          continue;
        }

        try {
          const result = await unsplash.search.getPhotos({
            query: `${dest.name} travel landmark`,
            page: 1,
            perPage: 1,
            orientation: 'portrait', // Better for masonry
          });

          if (result.response && result.response.results.length > 0) {
            const url = result.response.results[0].urls.regular;
            newImages[dest.id] = url;
            imageCache[dest.name] = url;
          } else {
             newImages[dest.id] = dest.imageUrl; // Fallback to original
          }
        } catch (e) {
          console.error(`Failed to fetch image for ${dest.name}`, e);
          newImages[dest.id] = dest.imageUrl; // Fallback
        }
      }
      setImages(prev => ({ ...prev, ...newImages }));
    };

    if (destinations.length > 0) {
      fetchImages();
    }
  }, [destinations]);

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-20 px-4 sm:px-0">
      {destinations.map((destination, index) => {
        const imageUrl = images[destination.id] || destination.imageUrl;
        
        return (
          <div
            key={destination.id}
            className="break-inside-avoid animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div 
              onClick={() => onSelect(destination)}
              className="group relative overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-zinc-200/50 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-zinc-900/10"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-80 transition-opacity duration-500 group-hover:opacity-60" />
                
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={destination.name}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 will-change-transform"
                  loading="lazy"
                />
                
                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
                  <Badge 
                    variant="secondary" 
                    className="bg-white/90 backdrop-blur-md text-zinc-900 border-0 font-bold px-3 py-1.5 shadow-lg uppercase tracking-wider text-[10px]"
                  >
                    {destination.vibe}
                  </Badge>

                   <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold">{destination.safetyRating}.0</span>
                   </div>
                </div>

                {/* Bottom Content (Overlay) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                  <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-medium uppercase tracking-widest mb-2 opacity-0 -translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 delay-100">
                      <MapPin className="w-3 h-3" />
                      {destination.country}
                  </div>
                  
                  <h3 className="text-3xl font-extrabold text-white mb-2 tracking-tight leading-tight drop-shadow-md">
                    {destination.name}
                  </h3>
                  
                  <p className="text-zinc-200 text-sm line-clamp-2 mb-4 font-light leading-relaxed opacity-0 max-h-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-500 delay-75">
                    {destination.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
                     <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs uppercase tracking-wide">
                        <Sparkles className="w-3 h-3" />
                        {destination.highlights[0]}
                     </div>
                     <span className="text-white font-bold text-lg drop-shadow-sm">
                        ${destination.estimatedCost.total.toLocaleString()}
                     </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
