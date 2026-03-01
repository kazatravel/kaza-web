'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActivityItem } from '@/lib/itinerary-types';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Clock, DollarSign, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItineraryItemProps {
  item: ActivityItem;
  className?: string;
}

export function ItineraryItem({ item, className }: ItineraryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { item } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'activity': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'meal': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'lodging': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'transport': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={cn("mb-3 touch-none", className)}>
      <Card className="border-border/60 hover:border-primary/50 transition-colors shadow-sm bg-card">
        <CardContent className="p-3 flex items-start gap-3">
          <div {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
            <GripVertical size={16} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider", getTypeColor(item.type))}>
                {item.type}
              </span>
              {item.cost && (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <DollarSign size={10} /> {item.cost}
                </span>
              )}
            </div>

            <h4 className="font-semibold text-sm truncate">{item.title}</h4>
            
            {(item.startTime || item.duration || item.location) && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                {item.startTime && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {item.startTime}
                    {item.duration && <span className="text-muted-foreground/60">({item.duration}m)</span>}
                  </span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1 truncate max-w-[120px]">
                    <MapPin size={12} /> {item.location}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
