import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input'; // Assuming a UI input component
import { Button } from '@/components/ui/button'; // Assuming a UI button component
import { Search, Loader2, PlusCircle } from 'lucide-react';
import { Trip } from '@/lib/itinerary-types';

interface ActivitySearchProps {
  onAddActivity: (activity: { title: string; description?: string; type?: string; }) => void;
  tripContext?: Trip | null; // Optional: context of the current trip for better suggestions
}

interface AISuggestion {
  title: string;
  description: string;
}

export function ActivitySearch({ onAddActivity, tripContext }: ActivitySearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/activities/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, tripContext }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch suggestions');
      }

      const data: AISuggestion[] = await response.json();
      setSuggestions(data);
    } catch (err: any) {
      console.error('Error fetching AI suggestions:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [query, tripContext]);

  const handleAddClick = (suggestion: AISuggestion) => {
    onAddActivity({
      title: suggestion.title,
      description: suggestion.description,
      type: 'activity', // Default type for AI suggestions
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">AI Activity Ideas</h3>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for activity ideas (e.g., 'adventure sports in Kyoto')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchSuggestions();
            }
          }}
          className="flex-grow"
        />
        <Button onClick={fetchSuggestions} disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Search
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm">Error: {error}</p>}

      {suggestions.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
              <div>
                <p className="font-medium text-gray-800">{suggestion.title}</p>
                <p className="text-sm text-gray-500">{suggestion.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddClick(suggestion)}
                className="text-indigo-600 hover:bg-indigo-50"
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
