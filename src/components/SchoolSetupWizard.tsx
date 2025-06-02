import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from './AuthProvider';
import { useSetupProgress } from '@/hooks/useSetupProgress';
import { SchoolInfoStep } from './setup-steps/SchoolInfoStep';
import { StudentsStep } from './setup-steps/StudentsStep';
import { TeachersStep } from './setup-steps/TeachersStep';
import { SubjectsStep } from './setup-steps/SubjectsStep';
import { ClassesStep } from './setup-steps/ClassesStep';
import { TimeSlotsStep } from './setup-steps/TimeSlotsStep';
import { AcademicCalendarStep } from './setup-steps/AcademicCalendarStep';
import { InfrastructureStep } from './setup-steps/InfrastructureStep';
import { TeacherSubjectMappingStep } from './setup-steps/TeacherSubjectMappingStep';
import { EnhancedSetupComplete } from './EnhancedSetupComplete';
import { BaseStepProps } from '@/types/setup';
import { LogOut } from 'lucide-react';
import { 
  GraduationCap, 
  Users, 
  UserCheck, 
  BookOpen, 
  Building, 
  Clock, 
  CheckCircle,
  CalendarDays,
  School,
  BookCopy
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'School Information', component: SchoolInfoStep, needsSchoolCreated: true, icon: GraduationCap, color: 'text-blue-600' },
  { id: 2, title: 'Academic Calendar', component: AcademicCalendarStep, needsSchoolCreated: false, icon: CalendarDays, color: 'text-indigo-600' },
  { id: 3, title: 'Infrastructure', component: InfrastructureStep, needsSchoolCreated: false, icon: School, color: 'text-emerald-600' },
  { id: 4, title: 'Students', component: StudentsStep, needsSchoolCreated: false, icon: Users, color: 'text-green-600' },
  { id: 5, title: 'Teachers', component: TeachersStep, needsSchoolCreated: false, icon: UserCheck, color: 'text-purple-600' },
  { id: 6, title: 'Subjects', component: SubjectsStep, needsSchoolCreated: false, icon: BookOpen, color: 'text-orange-600' },
  { id: 7, title: 'Classes', component: ClassesStep, needsSchoolCreated: false, icon: Building, color: 'text-red-600' },
  { id: 8, title: 'Teacher-Subject Mapping', component: TeacherSubjectMappingStep, needsSchoolCreated: false, icon: BookCopy, color: 'text-pink-600' },
  { id: 9, title: 'Time Slots', component: TimeSlotsStep, needsSchoolCreated: false, icon: Clock, color: 'text-amber-600' },
  { id: 10, title: 'Complete', component: EnhancedSetupComplete, needsSchoolCreated: false, icon: CheckCircle, color: 'text-emerald-600' },
];

export const SchoolSetupWizard = () => {
  const { user, signOut } = useAuthContext();
  const { progress, loading: progressLoading, saveProgress } = useSetupProgress();
  const [schoolData, setSchoolData] = useState({});
  const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  useEffect(() => {
    // Load from progress first, then fallback to localStorage
    if (progress.stepData) {
      setSchoolData(progress.stepData);
      console.log('Loaded school data from progress:', progress.stepData);
    }
    
    if (progress.schoolId) {
      setCurrentSchoolId(progress.schoolId);
      console.log('Current school ID from progress:', progress.schoolId);
    } else {
      // Fallback to localStorage
      const storedSchoolId = localStorage.getItem('currentSchoolId');
      const storedSchoolData = localStorage.getItem('schoolData');
      
      if (storedSchoolId) {
        setCurrentSchoolId(storedSchoolId);
        console.log('Current school ID from localStorage:', storedSchoolId);
      }
      
      if (storedSchoolData) {
        try {
          const parsedData = JSON.parse(storedSchoolData);
          setSchoolData(parsedData);
          console.log('Loaded school data from localStorage:', parsedData);
        } catch (error) {
          console.error('Error parsing stored school data:', error);
        }
      }
    }

    // Set current step from progress
    setCurrentStep(progress.currentStep || 1);
  }, [progress]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      const newStep = currentStep + 1;
      console.log(`WIZARD: Moving from step ${currentStep} to step ${newStep}`);
      
      // Update local state first
      setCurrentStep(newStep);
      
      // Then save to progress
      saveProgress({ 
        currentStep: newStep,
        completedSteps: [...(progress.completedSteps || []), currentStep]
      });
      
      console.log(`WIZARD: Step changed to ${newStep}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      console.log(`Moving back to step ${newStep}`);
      setCurrentStep(newStep);
      saveProgress({ currentStep: newStep });
    }
  };

  const handleStepComplete = async (stepData: any) => {
    console.log('WIZARD: Step completed with data:', stepData);
    
    const updatedSchoolData = { ...schoolData, ...stepData };
    setSchoolData(updatedSchoolData);
    
    let newSchoolId = currentSchoolId;
    if (stepData.schoolId && !currentSchoolId) {
      newSchoolId = stepData.schoolId;
      setCurrentSchoolId(newSchoolId);
      localStorage.setItem('currentSchoolId', newSchoolId);
      console.log('Setting new school ID:', newSchoolId);
    }
    
    // Always store in localStorage as backup
    localStorage.setItem('schoolData', JSON.stringify(updatedSchoolData));
    
    await saveProgress({
      stepData: updatedSchoolData,
      schoolId: newSchoolId,
      completedSteps: [...(progress.completedSteps || []), currentStep]
    });

    // Store individual step data in localStorage for compatibility
    if (stepData.students) {
      localStorage.setItem('schoolStudents', JSON.stringify(stepData.students));
    }
    if (stepData.teachers) {
      localStorage.setItem('schoolTeachers', JSON.stringify(stepData.teachers));
    }
    if (stepData.subjects) {
      localStorage.setItem('schoolSubjects', JSON.stringify(stepData.subjects));
    }
    if (stepData.classes) {
      localStorage.setItem('schoolClasses', JSON.stringify(stepData.classes));
    }
    if (stepData.timeSlots) {
      localStorage.setItem('schoolTimeSlots', JSON.stringify(stepData.timeSlots));
    }
    if (stepData.academicCalendar) {
      localStorage.setItem('academicCalendar', JSON.stringify(stepData.academicCalendar));
    }
    if (stepData.infrastructure) {
      localStorage.setItem('infrastructure', JSON.stringify(stepData.infrastructure));
    }
    if (stepData.teacherSubjectMappings) {
      localStorage.setItem('teacherSubjectMappings', JSON.stringify(stepData.teacherSubjectMappings));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Reset to step 1 on sign out
      setCurrentStep(1);
      setSchoolData({});
      setCurrentSchoolId(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    const CurrentStepComponent = STEPS[currentStep - 1].component;
    
    const baseProps: BaseStepProps = {
      onNext: handleNext,
      onPrevious: handlePrevious,
      onStepComplete: handleStepComplete,
      schoolId: currentSchoolId,
      currentStep,
      totalSteps: STEPS.length,
      schoolData,
    };
    
    return <CurrentStepComponent {...baseProps} />;
  };

  const renderStepIndicator = () => {
    let visibleSteps = STEPS;
    const maxVisibleSteps = 5;
    
    if (window.innerWidth < 1024 && STEPS.length > maxVisibleSteps) {
      const startIdx = Math.max(0, Math.min(
        currentStep - Math.ceil(maxVisibleSteps / 2),
        STEPS.length - maxVisibleSteps
      ));
      visibleSteps = STEPS.slice(startIdx, startIdx + maxVisibleSteps);
    }

    return (
      <div className="flex items-center justify-center mb-8 overflow-x-auto pb-4">
        <div className="flex items-center space-x-2 min-w-max">
          {visibleSteps.map((step, index) => {
            const actualStepIndex = STEPS.findIndex(s => s.id === step.id);
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const IconComponent = step.icon;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center ${isCurrent ? 'scale-110' : ''} transition-transform duration-200`}>
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                        ? `border-blue-500 ${step.color} bg-blue-50` 
                        : 'border-gray-300 text-gray-400 bg-gray-50'
                    }
                  `}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className={`
                    text-xs mt-2 text-center max-w-16 leading-tight
                    ${isCurrent ? 'font-semibold text-gray-800' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </span>
                </div>
                {index < visibleSteps.length - 1 && (
                  <div className={`
                    w-8 h-0.5 transition-colors duration-300
                    ${actualStepIndex < currentStep - 1 ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">School Setup Wizard</h1>
            <p className="text-lg text-gray-600">Complete 10-step setup for comprehensive school management</p>
            {currentSchoolId && (
              <p className="text-sm text-green-600 mt-2">School ID: {currentSchoolId}</p>
            )}
            <p className="text-sm text-blue-600 mt-1">Current Step: {currentStep}</p>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          )}
        </div>

        {renderStepIndicator()}

        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  {STEPS[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Step {currentStep} of {STEPS.length}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Progress</div>
                <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercent)}%</div>
              </div>
            </div>
            <Progress value={progressPercent} className="mt-4 h-2" />
          </CardHeader>
        </Card>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>✨ Enhanced with AI-powered analytics and comprehensive data validation</p>
        </div>
      </div>
    </div>
  );
};
