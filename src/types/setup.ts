
export interface BaseStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onStepComplete: (data: any) => void;
  schoolId: string | null;
  currentStep: number;
  totalSteps: number;
  schoolData: any;
}

export interface SchoolInfoStepProps extends BaseStepProps {
  onSchoolCreated: (id: string) => void;
}
