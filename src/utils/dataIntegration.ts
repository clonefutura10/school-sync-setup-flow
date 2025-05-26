
import { supabase } from "@/integrations/supabase/client";

export interface SchoolSetupData {
  school: any;
  students: any[];
  teachers: any[];
  subjects: any[];
  classes: any[];
  timeSlots: any[];
}

export const getSchoolSetupData = async (schoolId: string): Promise<SchoolSetupData | null> => {
  try {
    const [schoolResult, studentsResult, teachersResult, subjectsResult, classesResult, timeSlotsResult] = await Promise.all([
      supabase.from('schools').select('*').eq('id', schoolId).single(),
      supabase.from('students').select('*').eq('school_id', schoolId),
      supabase.from('teachers').select('*').eq('school_id', schoolId),
      supabase.from('subjects').select('*').eq('school_id', schoolId),
      supabase.from('classes').select('*').eq('school_id', schoolId),
      supabase.from('time_slots').select('*').eq('school_id', schoolId),
    ]);

    if (schoolResult.error) {
      console.error('Error fetching school data:', schoolResult.error);
      return null;
    }

    return {
      school: schoolResult.data,
      students: studentsResult.data || [],
      teachers: teachersResult.data || [],
      subjects: subjectsResult.data || [],
      classes: classesResult.data || [],
      timeSlots: timeSlotsResult.data || [],
    };
  } catch (error) {
    console.error('Error in getSchoolSetupData:', error);
    return null;
  }
};

export const checkForSetupData = (): string | null => {
  return localStorage.getItem('setupSchoolId') || localStorage.getItem('schoolId');
};
