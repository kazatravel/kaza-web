import { DayColumn } from '@/lib/itinerary-types';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableActivity } from './SortableActivity';
import { Plus, CalendarDays } from 'lucide-react';

interface ItineraryDayProps {
  day: DayColumn;
  onAddActivity: () => void;
  onRemoveActivity: (id: string) => void;
}

export function ItineraryDay({ day, onAddActivity, onRemoveActivity }: ItineraryDayProps) {
  const dateObj = new Date(day.date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const dayMonth = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold text-xs">
            <span>{dayName}</span>
            <span className="text-sm -mt-1">{dateObj.getDate()}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-none mb-1">Day {day.dayNumber}</h3>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{dayMonth}</p>
          </div>
        </div>
        <button 
          onClick={onAddActivity}
          className="h-8 w-8 flex items-center justify-center bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-full transition-colors border border-gray-100"
          title="Add activity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <SortableContext 
        items={day.items.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4 flex-grow min-h-[100px]">
          {day.items.map((item) => (
            <SortableActivity 
              key={item.id} 
              item={item} 
              dayId={day.id}
              onRemove={() => onRemoveActivity(item.id)}
            />
          ))}
          {day.items.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-sm bg-gray-50/30">
              <CalendarDays className="h-6 w-6 mb-2 opacity-20" />
              <p>Nothing planned</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
