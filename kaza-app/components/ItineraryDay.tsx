'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DayColumn, ActivityItem } from '@/lib/itinerary-types';
import { ItineraryItem } from './ItineraryItem';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ItineraryDayProps {
  day: DayColumn;
  items: ActivityItem[];
  activeId?: string;
  isOver?: boolean;
}

export function ItineraryDay({ day, items, activeId }: ItineraryDayProps) {
  const { setNodeRef } = useDroppable({
    id: day.id,
  });

  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className={cn(
      "mb-6 transition-all duration-200 border-border/40 shadow-sm hover:shadow-md",
      // activeId && "opacity-50" // Only dim if not target? No, standard practice is fine.
    )}>
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              <CalendarIcon size={18} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">Day {day.dayNumber}</CardTitle>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-0.5">{formattedDate}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <PlusCircle size={18} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 bg-muted/5 min-h-[120px]">
        <SortableContext 
          id={day.id} 
          items={items.map(i => i.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="space-y-3 min-h-[80px]">
            {items.map((item) => (
              <ItineraryItem key={item.id} item={item} />
            ))}
            
            {items.length === 0 && (
              <div className="h-20 border-2 border-dashed border-border/40 rounded-lg flex items-center justify-center text-muted-foreground/40 text-sm italic">
                Drag activities here
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}
