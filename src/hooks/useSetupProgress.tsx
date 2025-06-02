
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface SetupProgress {
  id?: string;
  currentStep: number;
  stepData: any;
  completedSteps: number[];
  schoolId?: string;
}

export const useSetupProgress = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [progress, setProgress] = useState<SetupProgress>({
    currentStep: 1,
    stepData: {},
    completedSteps: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgressWithTimeout = async () => {
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('Progress loading timed out, using defaults');
        setLoading(false);
      }, 3000);

      try {
        if (user) {
          await loadProgress();
        } else {
          // If no user, just stop loading and use defaults
          setLoading(false);
        }
      } catch (error) {
        console.log('Error in progress loading effect:', error);
        setLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    loadProgressWithTimeout();
  }, [user]);

  const loadProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading progress for user:', user.id);
      const { data, error } = await supabase
        .from('setup_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Progress load error:', error);
      }

      if (data) {
        console.log('Loaded progress data:', data);
        setProgress({
          id: data.id,
          currentStep: data.current_step || 1,
          stepData: data.step_data || {},
          completedSteps: data.completed_steps || [],
          schoolId: data.school_id,
        });
      }
    } catch (error: any) {
      console.log('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (updatedProgress: Partial<SetupProgress>) => {
    if (!user) return;

    const newProgress = { ...progress, ...updatedProgress };
    console.log('Saving progress:', newProgress);
    
    try {
      const { error } = await supabase
        .from('setup_progress')
        .upsert({
          user_id: user.id,
          current_step: newProgress.currentStep,
          step_data: newProgress.stepData,
          completed_steps: newProgress.completedSteps,
          school_id: newProgress.schoolId,
        });

      if (error) {
        console.log('Progress save error:', error);
      } else {
        console.log('Progress saved successfully');
      }

      setProgress(newProgress);
    } catch (error: any) {
      console.log('Error saving progress:', error);
      setProgress(newProgress);
    }
  };

  return {
    progress,
    loading,
    saveProgress,
    loadProgress,
  };
};
