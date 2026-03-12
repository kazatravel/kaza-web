import { ActivityItem, DayColumn } from '@/lib/itinerary-types';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { SortableActivity } from './SortableActivity';
import { ItineraryDay } from './ItineraryDay';
import { Save, Plus, Calendar } from 'lucide-react';

interface ItineraryBuilderProps {
  initialDays: DayColumn[];
  onSave: (days: DayColumn[]) => void;
}

export function ItineraryBuilder({ initialDays, onSave }: ItineraryBuilderProps) {
  const [days, setDays] = useState<DayColumn[]>(initialDays);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(days);
    setIsSaving(false);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDays((prevDays) => {
        const activeDayId = active.data.current?.dayId;
        const overDayId = over.data.current?.dayId;

        if (activeDayId === overDayId) {
          const dayIndex = prevDays.findIndex(d => d.id === activeDayId);
          const day = prevDays[dayIndex];
          const oldIndex = day.items.findIndex(item => item.id === active.id);
          const newIndex = day.items.findIndex(item => item.id === over.id);

          const newItems = arrayMove(day.items, oldIndex, newIndex);
          const newDays = [...prevDays];
          newDays[dayIndex] = { ...day, items: newItems };
          return newDays;
        }
        
        return prevDays;
      });
    }
  }

  const addActivity = (dayId: string) => {
    setDays(prev => prev.map(day => {
      if (day.id === dayId) {
        const newActivity: ActivityItem = {
          id: Math.random().toString(36).substr(2, 9),
          title: 'New Activity',
          type: 'activity',
          startTime: '12:00'
        };
        return { ...day, items: [...day.items, newActivity] };
      }
      return day;
    }));
  };

  const removeActivity = (dayId: string, activityId: string) => {
    setDays(prev => prev.map(day => {
      if (day.id === dayId) {
        return { ...day, items: day.items.filter(item => item.id !== activityId) };
      }
      return day;
    }));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="sticky top-[4.5rem] z-40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/90 backdrop-blur-sm py-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            Trip Schedule
          </h2>
          <p className="text-sm text-gray-500">Drag activities to reorder within days.</p>
        </div>
        <button 
          onClick={handleSaveClick}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {days.map((day) => (
            <ItineraryDay 
              key={day.id} 
              day={day} 
              onAddActivity={() => addActivity(day.id)}
              onRemoveActivity={(activityId) => removeActivity(day.id, activityId)}
            />
          ))}
        </DndContext>
      </div>
    </div>
  );
}
