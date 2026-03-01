'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ActivityItem } from '@/lib/itinerary-types';
import { ItineraryItem } from './ItineraryItem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lightbulb, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlaygroundSidebarProps {
  items: ActivityItem[];
}

export function PlaygroundSidebar({ items }: PlaygroundSidebarProps) {
  const { setNodeRef } = useDroppable({
    id: 'playground-pool',
  });

  return (
    <Card className="h-full border-l rounded-none shadow-none bg-muted/10">
      <CardHeader className="border-b bg-card pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Lightbulb className="w-5 h-5" />
            <CardTitle>Idea Playground</CardTitle>
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Drag ideas here to save for later.
        </p>
      </CardHeader>
      
      <CardContent className="p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
        <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
          <SortableContext 
            id="playground-pool" 
            items={items.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <ItineraryItem key={item.id} item={item} className="opacity-90 hover:opacity-100" />
            ))}
            {items.length === 0 && (
              <div className="text-center py-10 text-muted-foreground/50 text-sm border-2 border-dashed border-border/30 rounded-lg">
                Your playground is empty
              </div>
            )}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
}
