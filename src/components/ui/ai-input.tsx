
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useGroqSuggestions } from '@/hooks/useGroqSuggestions';

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestionType: 'school_names' | 'subjects' | 'events' | 'room_types' | 'class_names';
  context?: any;
  fallbackOptions?: string[];
  className?: string;
  required?: boolean;
}

export const AIInput: React.FC<AIInputProps> = ({
  value,
  onChange,
  placeholder,
  suggestionType,
  context,
  fallbackOptions = [],
  className,
  required
}) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(fallbackOptions);
  const { loading, getSuggestions } = useGroqSuggestions();

  const loadSuggestions = async () => {
    if (suggestions.length > 0 && suggestions !== fallbackOptions) return;

    let prompt = '';
    switch (suggestionType) {
      case 'school_names':
        prompt = `Generate 5 professional school name suggestions. Include various types like Public School, High School, Academy, etc.`;
        break;
      case 'subjects':
        prompt = `Generate subject suggestions for ${context?.grade || 'general'} grade. Include core and optional subjects.`;
        break;
      case 'events':
        prompt = `Generate academic calendar events. Include holidays, exams, activities, etc.`;
        break;
      case 'room_types':
        prompt = `Generate room types for school infrastructure. Include classrooms, labs, facilities, etc.`;
        break;
      case 'class_names':
        prompt = `Generate class/section names for ${context?.grade || 'general'} grade. Include section naming conventions.`;
        break;
    }

    const aiSuggestions = await getSuggestions(prompt, context, suggestionType);
    if (aiSuggestions.length > 0) {
      setSuggestions(aiSuggestions);
    } else {
      setSuggestions(fallbackOptions);
    }
  };

  useEffect(() => {
    if (open) {
      loadSuggestions();
    }
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="pr-10"
      />
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : (
              <Sparkles className="h-4 w-4 text-blue-600" />
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-2" align="end">
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Suggestions
            </div>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-2 text-sm"
                onClick={() => {
                  onChange(suggestion);
                  setOpen(false);
                }}
              >
                {suggestion}
              </Button>
            ))}
            {suggestions.length === 0 && (
              <div className="text-xs text-gray-400 p-2">
                No suggestions available
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
