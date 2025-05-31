
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
      // Use raw SQL query since setup_progress table is not in types yet
      const { data, error } = await supabase
        .rpc('get_setup_progress', { user_id: user.id });

      if (error && error.code !== 'PGRST116') {
        console.log('Progress load error:', error);
        // If no progress exists, that's fine - we'll start fresh
      }

      if (data && data.length > 0) {
        const progressData = data[0];
        setProgress({
          id: progressData.id,
          currentStep: progressData.current_step || 1,
          stepData: progressData.step_data || {},
          completedSteps: progressData.completed_steps || [],
          schoolId: progressData.school_id,
        });
      }
    } catch (error: any) {
      console.log('Error loading progress:', error);
      // Start with default progress if there's an error
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (updatedProgress: Partial<SetupProgress>) => {
    if (!user) return;

    const newProgress = { ...progress, ...updatedProgress };
    
    try {
      // Use raw SQL to save progress
      const { error } = await supabase
        .rpc('save_setup_progress', {
          user_id: user.id,
          current_step: newProgress.currentStep,
          step_data: newProgress.stepData,
          completed_steps: newProgress.completedSteps,
          school_id: newProgress.schoolId,
        });

      if (error) {
        console.log('Progress save error:', error);
        // Create simple upsert if RPC doesn't exist
        await supabase
          .from('schools')
          .upsert({
            id: newProgress.schoolId || crypto.randomUUID(),
            user_id: user.id,
            name: newProgress.stepData?.name || 'Setup in Progress',
          });
      }

      setProgress(newProgress);
    } catch (error: any) {
      console.log('Error saving progress:', error);
      // For now, just update local state
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
