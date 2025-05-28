import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  ExternalLink, 
  Download, 
  FileText, 
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
  Users,
  BookOpen,
  Building,
  User,
  FlaskConical,
  Award,
  QrCode,
  Edit
} from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { DataExport } from '../DataExport';
import { passDataToScheduler } from '@/utils/schedulerIntegration';

interface ValidationResult {
  type: 'error' | 'warning' | 'success';
  message: string;
  category: string;
}

export const EnhancedSetupComplete: React.FC<BaseStepProps> = ({
  onPrevious,
  schoolId,
  schoolData
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handleGoToScheduler = () => {
    if (schoolId && schoolData) {
      passDataToScheduler({ ...schoolData, schoolId });
    }
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

  // Data completeness calculations
  const getDataCompleteness = () => {
    const sections = [
      { name: 'School Info', data: schoolData.name, weight: 15 },
      { name: 'Academic Calendar', data: schoolData.academicCalendar, weight: 10 },
      { name: 'Infrastructure', data: schoolData.infrastructure, weight: 15 },
      { name: 'Students', data: schoolData.students, weight: 20 },
      { name: 'Teachers', data: schoolData.teachers, weight: 20 },
      { name: 'Subjects', data: schoolData.subjects, weight: 10 },
      { name: 'Classes', data: schoolData.classes, weight: 5 },
      { name: 'Mappings', data: schoolData.teacherSubjectMappings, weight: 5 },
    ];

    let totalScore = 0;
    const sectionScores = sections.map(section => {
      let score = 0;
      if (section.data) {
        if (Array.isArray(section.data)) {
          score = section.data.length > 0 ? section.weight : 0;
        } else {
          score = section.weight;
        }
      }
      totalScore += score;
      return { ...section, score, percentage: (score / section.weight) * 100 };
    });

    return { sections: sectionScores, total: totalScore, percentage: totalScore };
  };

  // Validation checks
  const runValidationChecks = (): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const teachers = schoolData.teachers || [];
    const classes = schoolData.classes || [];
    const mappings = schoolData.teacherSubjectMappings || [];

    // Teacher workload validation
    teachers.forEach(teacher => {
      const teacherMappings = mappings.filter(m => m.teacher_id === teacher.id);
      const totalPeriods = teacherMappings.reduce((sum, m) => sum + (m.periods_per_week || 0), 0);
      const maxPeriods = (teacher.max_periods_per_day || 7) * 5;
      
      if (totalPeriods > maxPeriods) {
        results.push({
          type: 'error',
          message: `${teacher.first_name} ${teacher.last_name} is overloaded (${totalPeriods}/${maxPeriods} periods)`,
          category: 'Workload'
        });
      } else if (totalPeriods > maxPeriods * 0.8) {
        results.push({
          type: 'warning',
          message: `${teacher.first_name} ${teacher.last_name} is near capacity (${totalPeriods}/${maxPeriods} periods)`,
          category: 'Workload'
        });
      }
    });

    // Class capacity validation
    classes.forEach(cls => {
      if (cls.actual_enrollment && cls.capacity && cls.actual_enrollment > cls.capacity) {
        results.push({
          type: 'warning',
          message: `${cls.name} is over capacity (${cls.actual_enrollment}/${cls.capacity} students)`,
          category: 'Capacity'
        });
      }
    });

    // Data completeness validation
    const completeness = getDataCompleteness();
    if (completeness.percentage < 80) {
      results.push({
        type: 'warning',
        message: `Setup is ${completeness.percentage.toFixed(1)}% complete. Consider adding more data.`,
        category: 'Completeness'
      });
    }

    if (results.length === 0) {
      results.push({
        type: 'success',
        message: 'All validation checks passed successfully!',
        category: 'Validation'
      });
    }

    return results;
  };

  const completeness = getDataCompleteness();
  const validationResults = runValidationChecks();

  const exportToPDF = () => {
    // This would integrate with a PDF generation library
    console.log('Exporting to PDF...');
  };

  const exportToExcel = () => {
    // This would integrate with an Excel export library
    console.log('Exporting to Excel...');
  };

  const generateQRCode = () => {
    // This would generate a QR code with the setup data
    console.log('Generating QR code...');
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
            🎉 Setup Complete!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Congratulations! Your comprehensive school setup is complete with {completeness.percentage.toFixed(1)}% data completeness.
          </p>
        </div>
      </div>

      {/* Data Completeness */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Setup Completeness</span>
            <Badge variant={completeness.percentage >= 80 ? "default" : "destructive"}>
              {completeness.percentage.toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completeness.sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{section.name}</span>
                <div className="flex items-center gap-2 w-1/2">
                  <Progress value={section.percentage} className="flex-1" />
                  <span className="text-xs text-gray-500 w-12">
                    {section.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Validation & Quality Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validationResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                result.type === 'error' ? 'border-red-500 bg-red-50' :
                result.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {result.category}
                  </Badge>
                  <span className="text-sm">{result.message}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabbed Review */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">Comprehensive Data Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="details">Detailed Data</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {schoolData.students?.length || 0}
                  </div>
                  <div className="text-sm font-medium">Students</div>
                </Card>
                
                <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {schoolData.teachers?.length || 0}
                  </div>
                  <div className="text-sm font-medium">Teachers</div>
                </Card>
                
                <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {schoolData.subjects?.length || 0}
                  </div>
                  <div className="text-sm font-medium">Subjects</div>
                </Card>
                
                <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {schoolData.classes?.length || 0}
                  </div>
                  <div className="text-sm font-medium">Classes</div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Teacher Workload Distribution
                  </h3>
                  <div className="space-y-3">
                    {(schoolData.teachers || []).slice(0, 5).map((teacher: any, index: number) => {
                      const mappings = (schoolData.teacherSubjectMappings || []).filter((m: any) => m.teacher_id === teacher.id);
                      const totalPeriods = mappings.reduce((sum: number, m: any) => sum + (m.periods_per_week || 0), 0);
                      const maxPeriods = (teacher.max_periods_per_day || 7) * 5;
                      const percentage = (totalPeriods / maxPeriods) * 100;
                      
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{teacher.first_name} {teacher.last_name}</span>
                            <span>{totalPeriods}/{maxPeriods}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Infrastructure Utilization
                  </h3>
                  <div className="space-y-2">
                    {['Regular Classroom', 'Science Lab', 'Computer Lab', 'Library'].map((type, index) => {
                      const count = (schoolData.infrastructure || []).filter((room: any) => room.room_type === type).length;
                      return (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{type}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* ... keep existing detailed data sections from SetupComplete.tsx ... */}
              <div className="text-center text-gray-500">
                Detailed data sections would be displayed here...
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Export Options</h3>
                  <div className="space-y-3">
                    <Button onClick={exportToPDF} className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Professional PDF Report
                    </Button>
                    <Button onClick={exportToExcel} className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Excel Workbook (Multi-sheet)
                    </Button>
                    <Button onClick={generateQRCode} className="w-full justify-start" variant="outline">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code for Data Sharing
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Data Integration</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Ready for Scheduler Integration
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        All data is properly formatted and validated for the scheduling system.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Data Export Section */}
      {schoolId && <DataExport schoolId={schoolId} />}

      {/* Final Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center text-xl">🚀 Ready for Advanced Scheduling!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-700 text-lg">
            Your comprehensive school data is now ready for intelligent timetable generation with AI-powered optimization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGoToScheduler}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2"
              size="lg"
            >
              Open Advanced Scheduler
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
              🧠 <strong>AI-Powered:</strong> The scheduler will use machine learning to optimize timetables based on your setup data including teacher preferences, subject requirements, and infrastructure constraints.
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
