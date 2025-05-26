
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
import { SetupComplete } from './setup-steps/SetupComplete';

const STEPS = [
  { id: 1, title: 'School Information', component: SchoolInfoStep },
  { id: 2, title: 'Students', component: StudentsStep },
  { id: 3, title: 'Teachers', component: TeachersStep },
  { id: 4, title: 'Subjects', component: SubjectsStep },
  { id: 5, title: 'Classes', component: ClassesStep },
  { id: 6, title: 'Time Slots', component: TimeSlotsStep },
  { id: 7, title: 'Complete', component: SetupComplete },
];

export const SchoolSetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [schoolData, setSchoolData] = useState({});
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const { toast } = useToast();

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

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
    setSchoolData(prev => ({ ...prev, ...stepData }));
    console.log('Step completed with data:', stepData);
  };

  const handleSchoolCreated = (id: string) => {
    setSchoolId(id);
    localStorage.setItem('schoolId', id);
  };

  useEffect(() => {
    // Check if we have a school ID in localStorage
    const savedSchoolId = localStorage.getItem('schoolId');
    if (savedSchoolId) {
      setSchoolId(savedSchoolId);
    }
  }, []);

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800">
              School Setup Wizard
            </CardTitle>
            <CardDescription className="text-center">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </CardDescription>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CurrentStepComponent
              onNext={handleNext}
              onPrevious={handlePrevious}
              onStepComplete={handleStepComplete}
              onSchoolCreated={handleSchoolCreated}
              schoolId={schoolId}
              currentStep={currentStep}
              totalSteps={STEPS.length}
              schoolData={schoolData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
