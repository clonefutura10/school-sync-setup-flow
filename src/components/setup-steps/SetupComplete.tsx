
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ExternalLink, Download } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { DataExport } from '../DataExport';
import { passDataToScheduler } from '@/utils/schedulerIntegration';

export const SetupComplete: React.FC<BaseStepProps> = ({
  onPrevious,
  schoolId,
  schoolData
}) => {
  const handleGoToScheduler = () => {
    // Pass comprehensive data to scheduler
    if (schoolId && schoolData) {
      passDataToScheduler({ ...schoolData, schoolId });
    }
    
    // Open scheduler in new tab
    window.open('https://chrono-school-scheduler-plus.lovable.app/', '_blank');
  };

  const handleStartOver = () => {
    localStorage.removeItem('schoolId');
    localStorage.removeItem('setupSchoolId');
    localStorage.removeItem('schedulerData');
    localStorage.removeItem('setupComplete');
    localStorage.removeItem('schoolInfo');
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Success Animation */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <CheckCircle className="h-32 w-32 text-green-500 animate-pulse" />
            <div className="absolute inset-0 h-32 w-32 bg-green-500 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Setup Complete!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Congratulations! Your school has been successfully configured with all the necessary information. 
            Your data is ready to be used in the scheduling system.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">✓</div>
            <div className="font-semibold text-gray-800">School Information</div>
            <div className="text-sm text-gray-600">Basic details configured</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
            <div className="font-semibold text-gray-800">Students</div>
            <div className="text-sm text-gray-600">Student records added</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">✓</div>
            <div className="font-semibold text-gray-800">Teachers</div>
            <div className="text-sm text-gray-600">Teaching staff configured</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">✓</div>
            <div className="font-semibold text-gray-800">Subjects</div>
            <div className="text-sm text-gray-600">Course subjects defined</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">✓</div>
            <div className="font-semibold text-gray-800">Classes</div>
            <div className="text-sm text-gray-600">Class groups created</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">✓</div>
            <div className="font-semibold text-gray-800">Time Slots</div>
            <div className="text-sm text-gray-600">Schedule periods configured</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Export Section */}
      {schoolId && <DataExport schoolId={schoolId} />}

      {/* Next Steps */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center text-xl">Ready to Schedule!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-700 text-lg">
            Your school data is now ready for the scheduling system. Click below to proceed to the scheduler 
            where all your setup information will be automatically loaded.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGoToScheduler}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2"
              size="lg"
            >
              Open School Scheduler
              <ExternalLink className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleStartOver}
              className="px-8 py-3 rounded-lg font-semibold border-2"
              size="lg"
            >
              Setup Another School
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              💡 <strong>Note:</strong> The scheduler will automatically detect and load your setup data when you open it.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-start pt-4">
        <Button variant="outline" onClick={onPrevious} className="px-6">
          ← Previous Step
        </Button>
      </div>
    </div>
  );
};
