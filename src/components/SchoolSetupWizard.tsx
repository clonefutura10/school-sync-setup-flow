import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [schoolData, setSchoolData] = useState({});
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const { toast } = useToast();

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  // Generate mock school ID if none exists
  const getMockSchoolId = () => {
    let mockId = localStorage.getItem('mockSchoolId');
    if (!mockId) {
      mockId = `mock-school-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('mockSchoolId', mockId);
    }
    return mockId;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepData: any) => {
    const updatedSchoolData = { ...schoolData, ...stepData };
    setSchoolData(updatedSchoolData);
    console.log('Step completed with data:', stepData);
    console.log('Complete school data so far:', updatedSchoolData);
    
    // Handle school creation or use mock ID
    if (stepData.schoolId) {
      setSchoolId(stepData.schoolId);
      localStorage.setItem('schoolId', stepData.schoolId);
    } else if (!schoolId) {
      const mockId = getMockSchoolId();
      setSchoolId(mockId);
    }
    
    // Store the complete setup data
    localStorage.setItem('setupData', JSON.stringify(updatedSchoolData));
    
    // Store individual step data with better organization
    Object.keys(stepData).forEach(key => {
      if (stepData[key] && Array.isArray(stepData[key])) {
        localStorage.setItem(`school${key.charAt(0).toUpperCase() + key.slice(1)}`, JSON.stringify(stepData[key]));
      } else if (typeof stepData[key] === 'object' && stepData[key] !== null) {
        localStorage.setItem(key, JSON.stringify(stepData[key]));
      }
    });
  };

  useEffect(() => {
    // Load existing data
    const savedSchoolId = localStorage.getItem('schoolId');
    const mockSchoolId = localStorage.getItem('mockSchoolId');
    
    if (savedSchoolId) {
      setSchoolId(savedSchoolId);
    } else if (mockSchoolId) {
      setSchoolId(mockSchoolId);
    } else {
      const newMockId = getMockSchoolId();
      setSchoolId(newMockId);
    }

    const savedSetupData = localStorage.getItem('setupData');
    if (savedSetupData) {
      try {
        const parsedData = JSON.parse(savedSetupData);
        setSchoolData(parsedData);
      } catch (error) {
        console.error('Error parsing setup data:', error);
      }
    }
  }, []);

  const renderCurrentStep = () => {
    const CurrentStepComponent = STEPS[currentStep - 1].component;
    
    const baseProps: BaseStepProps = {
      onNext: handleNext,
      onPrevious: handlePrevious,
      onStepComplete: handleStepComplete,
      schoolId: schoolId || getMockSchoolId(),
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">School Setup Wizard</h1>
          <p className="text-lg text-gray-600">Complete 10-step setup for comprehensive school management</p>
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
                <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
              </div>
            </div>
            <Progress value={progress} className="mt-4 h-2" />
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
