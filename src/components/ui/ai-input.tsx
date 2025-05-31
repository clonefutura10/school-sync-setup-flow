
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useGroqSuggestions } from '@/hooks/useGroqSuggestions';

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestionType: 'school_names' | 'subjects' | 'events' | 'room_types' | 'class_names';
  context?: any;
  className?: string;
}

export const AIInput: React.FC<AIInputProps> = ({
  value,
  onChange,
  placeholder,
  suggestionType,
  context,
  className
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { loading, getSuggestions } = useGroqSuggestions();

  const handleGetSuggestions = async () => {
    let prompt = '';
    
    switch (suggestionType) {
      case 'school_names':
        prompt = `Generate 5 professional school name suggestions ${context?.location ? `for schools in ${context.location}` : ''}. Include various types like Public School, High School, Academy, etc.`;
        break;
      case 'subjects':
        prompt = `Generate subject suggestions for ${context?.grade || 'general'} grade in ${context?.schoolType || 'general'} school. Include core and optional subjects.`;
        break;
      case 'events':
        prompt = `Generate academic calendar events for ${context?.eventType || 'school'} ${context?.month ? `in ${context.month}` : ''}. Include holidays, exams, activities, etc.`;
        break;
      case 'room_types':
        prompt = `Generate room types for ${context?.schoolType || 'general'} school infrastructure. Include classrooms, labs, facilities, etc.`;
        break;
      case 'class_names':
        prompt = `Generate class/section names for ${context?.grade || 'general'} grade in ${context?.schoolType || 'general'} school. Include section naming conventions.`;
        break;
    }

    const results = await getSuggestions(prompt, context, suggestionType);
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetSuggestions}
          disabled={loading}
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
          <div className="px-3 py-2 border-t bg-gray-50">
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setShowSuggestions(false)}
            >
              Close suggestions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
