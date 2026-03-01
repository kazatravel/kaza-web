'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DropAnimation,
  defaultDropAnimationSideEffects,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ActivityItem, DayColumn } from '@/lib/itinerary-types';
import { ItineraryDay } from './ItineraryDay';
import { PlaygroundSidebar } from './PlaygroundSidebar';
import { ItineraryItem as SortableItem } from './ItineraryItem';
import { createPortal } from 'react-dom';

interface ItineraryBoardProps {
  initialDays: DayColumn[];
  initialPlayground: ActivityItem[];
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export function ItineraryBoard({ initialDays, initialPlayground }: ItineraryBoardProps) {
  const [days, setDays] = useState<DayColumn[]>(initialDays);
  const [playground, setPlayground] = useState<ActivityItem[]>(initialPlayground);
  const [activeItem, setActiveItem] = useState<ActivityItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (playground.find((item) => item.id === id)) return 'playground-pool';
    if (id === 'playground-pool') return 'playground-pool';

    const day = days.find((d) => d.id === id || d.items.find((item) => item.id === id));
    return day ? day.id : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id;
    
    const itemInPlayground = playground.find(i => i.id === id);
    if (itemInPlayground) {
      setActiveItem(itemInPlayground);
      return;
    }
    
    for (const day of days) {
      const item = day.items.find(i => i.id === id);
      if (item) {
        setActiveItem(item);
        return;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // For a smoother experience, we can implement optimistic UI updates here.
    // For now, we rely on DragOverlay for visuals and only commit on drop to avoid complexity/bugs.
    // To truly visualize insertion, we would need to temporarily mutate the lists here.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;

    if (!overId || activeId === overId) {
      setActiveItem(null);
      return;
    }

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer) {
      if (activeContainer === overContainer) {
        // Reordering within same container
        if (activeContainer === 'playground-pool') {
          setPlayground((items) => {
            const oldIndex = items.findIndex((i) => i.id === activeId);
            const newIndex = items.findIndex((i) => i.id === overId);
            return arrayMove(items, oldIndex, newIndex);
          });
        } else {
          setDays((prevDays) => prevDays.map(day => {
            if (day.id === activeContainer) {
              const oldIndex = day.items.findIndex((i) => i.id === activeId);
              const newIndex = day.items.findIndex((i) => i.id === overId);
              return { ...day, items: arrayMove(day.items, oldIndex, newIndex) };
            }
            return day;
          }));
        }
      } else {
        // Moving between containers
        let itemToMove: ActivityItem | undefined;

        // 1. Find and remove from source
        if (activeContainer === 'playground-pool') {
          itemToMove = playground.find(i => i.id === activeId);
          if (itemToMove) {
            setPlayground(prev => prev.filter(i => i.id !== activeId));
          }
        } else {
          const sourceDay = days.find(d => d.id === activeContainer);
          if (sourceDay) {
            itemToMove = sourceDay.items.find(i => i.id === activeId);
            if (itemToMove) {
              setDays(prev => prev.map(d => {
                if (d.id === activeContainer) {
                  return { ...d, items: d.items.filter(i => i.id !== activeId) };
                }
                return d;
              }));
            }
          }
        }

        if (itemToMove) {
          // 2. Add to destination
          if (overContainer === 'playground-pool') {
            setPlayground(prev => {
              const overIndex = prev.findIndex(i => i.id === overId);
              const newItems = [...prev];
              
              if (overId === 'playground-pool') {
                newItems.push(itemToMove!);
              } else {
                const insertIndex = overIndex >= 0 ? overIndex : newItems.length;
                newItems.splice(insertIndex, 0, itemToMove!);
              }
              return newItems;
            });
          } else {
             setDays(prev => prev.map(d => {
               if (d.id === overContainer) {
                 const newItems = [...d.items];
                 if (overId === overContainer) {
                   newItems.push(itemToMove!);
                 } else {
                   const overIndex = d.items.findIndex(i => i.id === overId);
                   const insertIndex = overIndex >= 0 ? overIndex : newItems.length;
                   newItems.splice(insertIndex, 0, itemToMove!);
                 }
                 return { ...d, items: newItems };
               }
               return d;
             }));
          }
        }
      }
    }

    setActiveItem(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">
        
        {/* Main Timeline Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Trip Itinerary</h1>
              <p className="text-muted-foreground mt-2">
                Drag activities from the playground or between days to plan your trip.
              </p>
            </header>

            <div className="space-y-6 pb-20">
              {days.map((day) => (
                <ItineraryDay 
                  key={day.id} 
                  day={day} 
                  items={day.items} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Playground Sidebar */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-card shadow-xl z-10 flex-shrink-0 h-[300px] lg:h-full overflow-hidden flex flex-col">
          <PlaygroundSidebar items={playground} />
        </div>
      </div>

      {mounted && createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeItem ? (
            <SortableItem item={activeItem} className="cursor-grabbing shadow-2xl rotate-2 scale-105 opacity-90" />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
