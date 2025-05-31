
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
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('setup_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProgress({
          id: data.id,
          currentStep: data.current_step,
          stepData: data.step_data || {},
          completedSteps: data.completed_steps || [],
          schoolId: data.school_id,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading progress",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (updatedProgress: Partial<SetupProgress>) => {
    if (!user) return;

    const newProgress = { ...progress, ...updatedProgress };
    
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

      if (error) throw error;

      setProgress(newProgress);
    } catch (error: any) {
      toast({
        title: "Error saving progress",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    progress,
    loading,
    saveProgress,
    loadProgress,
  };
};
