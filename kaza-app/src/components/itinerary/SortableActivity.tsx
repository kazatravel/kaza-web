import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActivityItem } from '@/lib/itinerary-types';
import { GripVertical, X, Calendar, MapPin, Clock, Utensils, Hotel, Camera } from 'lucide-react';

interface SortableActivityProps {
  item: ActivityItem;
  dayId: string;
  onRemove: () => void;
}

const TypeIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'meal': return <Utensils className={className} />;
    case 'lodging': return <Hotel className={className} />;
    case 'activity': return <Camera className={className} />;
    default: return <Calendar className={className} />;
  }
};

const TypeStyles: Record<string, string> = {
  meal: 'bg-orange-50 text-orange-600 border-orange-100',
  lodging: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  activity: 'bg-emerald-50 text-emerald-600 border-emerald-100'
};

export function SortableActivity({ item, dayId, onRemove }: SortableActivityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: item.id,
    data: { dayId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeStyle = TypeStyles[item.type] || 'bg-gray-50 text-gray-600 border-gray-100';

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 group relative transition-all ${isDragging ? 'opacity-50 scale-105 z-50 shadow-xl border-indigo-200' : 'hover:border-indigo-100 hover:shadow-md'}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab text-gray-300 hover:text-indigo-400 self-center"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`flex items-center gap-1.5 text-[10px] uppercase px-2.5 py-1 rounded-full border font-bold tracking-wider ${typeStyle}`}>
                <TypeIcon type={item.type} className="h-3 w-3" />
                {item.type}
              </span>
              {item.startTime && (
                <div className="flex items-center text-xs font-semibold text-gray-400 gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                  <Clock className="h-3 w-3" />
                  {item.startTime}
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onRemove}
            className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
            title="Remove activity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
