
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useGroqSuggestions } from '@/hooks/useGroqSuggestions';

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestionType: 'school_names' | 'subjects' | 'events' | 'room_types' | 'class_names' | 'academic_events' | 'student_data' | 'teacher_data' | 'class_organization';
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
      case 'academic_events':
        if (context?.type === 'term_break') {
          prompt = `Generate common school term break names like Summer Break, Winter Break, Spring Break, Mid-term Break, etc.`;
        } else if (context?.type === 'school_event') {
          prompt = `Generate school event names like Annual Sports Day, Science Fair, Cultural Festival, Parent-Teacher Meeting, etc.`;
        } else if (context?.type === 'event_type') {
          prompt = `Generate event type categories like Sports, Cultural, Academic, Administrative, Holiday, Examination, etc.`;
        } else {
          prompt = `Generate academic calendar events and activities for schools.`;
        }
        break;
      case 'room_types':
        prompt = `Generate room types for ${context?.schoolType || 'general'} school infrastructure. Include classrooms, labs, facilities, etc.`;
        break;
      case 'class_names':
        prompt = `Generate class/section names for ${context?.grade || 'general'} grade in ${context?.schoolType || 'general'} school. Include section naming conventions.`;
        break;
      case 'class_organization':
        if (context?.field === 'grade') {
          prompt = `Generate grade levels for school classes like 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, etc.`;
        } else if (context?.field === 'section') {
          prompt = `Generate section names for school classes like A, B, C, D, Alpha, Beta, etc.`;
        } else {
          prompt = `Generate class names for ${context?.grade || 'general'} grade like Grade 6A, Class 7B, Standard 8C, etc.`;
        }
        break;
      case 'student_data':
        if (context?.field === 'first_name') {
          prompt = `Generate common Indian first names for students.`;
        } else if (context?.field === 'last_name') {
          prompt = `Generate common Indian last names/surnames.`;
        } else if (context?.field === 'grade') {
          prompt = `Generate grade levels like 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.`;
        } else if (context?.field === 'section') {
          prompt = `Generate section names like A, B, C, D, Alpha, Beta, Gamma.`;
        } else if (context?.field === 'parent_name') {
          prompt = `Generate common Indian parent names with titles like Mr., Mrs., Dr.`;
        } else {
          prompt = `Generate student-related data suggestions.`;
        }
        break;
      case 'teacher_data':
        if (context?.field === 'first_name') {
          prompt = `Generate common Indian first names for teachers.`;
        } else if (context?.field === 'last_name') {
          prompt = `Generate common Indian last names/surnames for teachers.`;
        } else if (context?.field === 'department') {
          prompt = `Generate school department names like Science, Mathematics, Languages, Social Studies, Arts, Physical Education, etc.`;
        } else if (context?.field === 'qualification') {
          prompt = `Generate teacher qualifications like B.Ed, M.Ed, M.A., M.Sc., B.A., B.Sc., Ph.D., etc.`;
        } else if (context?.field === 'subjects') {
          prompt = `Generate school subjects like Mathematics, Physics, Chemistry, Biology, English, Hindi, History, Geography, etc.`;
        } else {
          prompt = `Generate teacher-related data suggestions.`;
        }
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
