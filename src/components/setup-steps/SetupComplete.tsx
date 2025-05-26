import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ExternalLink } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

export const SetupComplete: React.FC<BaseStepProps> = ({
  onPrevious,
  schoolData
}) => {
  const handleGoToScheduler = () => {
    // Redirect to the scheduler application
    window.open('https://chrono-school-scheduler-plus.lovable.app/', '_blank');
  };

  const handleStartOver = () => {
    localStorage.removeItem('schoolId');
    window.location.reload();
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle className="h-24 w-24 text-green-500" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Setup Complete!</h2>
        <p className="text-gray-600">
          Congratulations! Your school has been successfully set up with all the necessary information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>School Information:</strong>
              <p className="text-sm text-gray-600">Basic details configured</p>
            </div>
            <div>
              <strong>Students:</strong>
              <p className="text-sm text-gray-600">Student records added</p>
            </div>
            <div>
              <strong>Teachers:</strong>
              <p className="text-sm text-gray-600">Teaching staff configured</p>
            </div>
            <div>
              <strong>Subjects:</strong>
              <p className="text-sm text-gray-600">Course subjects defined</p>
            </div>
            <div>
              <strong>Classes:</strong>
              <p className="text-sm text-gray-600">Class groups created</p>
            </div>
            <div>
              <strong>Time Slots:</strong>
              <p className="text-sm text-gray-600">Schedule periods configured</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <p className="text-lg font-medium">
          Your school data is ready! You can now proceed to the scheduling system.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleGoToScheduler}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            Go to School Scheduler
            <ExternalLink className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleStartOver}
          >
            Setup Another School
          </Button>
        </div>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
      </div>
    </div>
  );
};
