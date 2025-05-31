
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGroqSuggestions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSuggestions = async (prompt: string, context?: any, type?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('groq-suggestions', {
        body: { prompt, context, type }
      });

      if (error) throw error;
      
      return data.suggestions || [];
    } catch (error: any) {
      console.error('Error getting suggestions:', error);
      toast({
        title: "AI Suggestions Unavailable",
        description: "Using fallback options instead.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getSchoolNameSuggestions = async (location?: string) => {
    const prompt = `Generate 5 professional school name suggestions ${location ? `for schools in ${location}` : ''}. Include various types like Public School, High School, Academy, etc.`;
    return getSuggestions(prompt, { location }, 'school_names');
  };

  const getSubjectSuggestions = async (grade?: string, schoolType?: string) => {
    const prompt = `Generate subject suggestions for ${grade || 'general'} grade in ${schoolType || 'general'} school. Include core and optional subjects.`;
    return getSuggestions(prompt, { grade, schoolType }, 'subjects');
  };

  const getEventSuggestions = async (eventType?: string, month?: string) => {
    const prompt = `Generate academic calendar events for ${eventType || 'school'} ${month ? `in ${month}` : ''}. Include holidays, exams, activities, etc.`;
    return getSuggestions(prompt, { eventType, month }, 'events');
  };

  const getRoomTypeSuggestions = async (schoolType?: string) => {
    const prompt = `Generate room types for ${schoolType || 'general'} school infrastructure. Include classrooms, labs, facilities, etc.`;
    return getSuggestions(prompt, { schoolType }, 'room_types');
  };

  const getClassNameSuggestions = async (grade?: string, schoolType?: string) => {
    const prompt = `Generate class/section names for ${grade || 'general'} grade in ${schoolType || 'general'} school. Include section naming conventions.`;
    return getSuggestions(prompt, { grade, schoolType }, 'class_names');
  };

  return {
    loading,
    getSuggestions,
    getSchoolNameSuggestions,
    getSubjectSuggestions,
    getEventSuggestions,
    getRoomTypeSuggestions,
    getClassNameSuggestions,
  };
};
