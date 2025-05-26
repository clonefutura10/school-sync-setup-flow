
export interface BaseStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onStepComplete: (data: any) => void;
  schoolId: string | null;
  currentStep: number;
  totalSteps: number;
  schoolData: any;
}

// Remove the separate SchoolInfoStepProps interface since it's causing issues
// SchoolInfoStep will now use BaseStepProps and handle school creation internally
