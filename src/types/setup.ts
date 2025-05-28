
export interface BaseStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onStepComplete: (data: any) => void;
  schoolId: string | null;
  currentStep: number;
  totalSteps: number;
  schoolData: any;
}

// Define common data interfaces for type safety
export interface StudentData {
  first_name: string;
  last_name: string;
  student_id: string;
  grade: string;
  section: string;
  date_of_birth: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  address: string;
  parent_contact: string;
  assigned_class_id: string | null;
}

export interface TeacherData {
  first_name: string;
  last_name: string;
  teacher_id: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  qualification_details: string;
  experience_years: number;
  subjects: string[];
  max_periods_per_day: number;
  is_class_teacher: boolean;
  preferences: string;
  availability_notes: string;
}

export interface SubjectData {
  name: string;
  code: string;
  department: string;
  description: string;
  credits: number;
  periods_per_week: number;
  lab_required: boolean;
}

export interface ClassData {
  name: string;
  grade: string;
  section: string;
  capacity: number;
  actual_enrollment: number;
  room_number: string;
  periods_per_day: number;
  periods_per_week: number;
  class_teacher_id: string | null;
}

export interface TimeSlotData {
  name: string;
  start_time: string;
  end_time: string;
  slot_type: string;
  is_break: boolean;
}

export interface SchoolData {
  name: string;
  address: string;
  phone: string;
  email: string;
  principal_name: string;
  school_type: string;
  academic_year: string;
  academic_year_start: string;
  academic_year_end: string;
  number_of_terms: number;
  working_days: string[];
  school_vision: string;
  timezone: string;
}
