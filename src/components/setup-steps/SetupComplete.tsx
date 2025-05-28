
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ExternalLink, Download, User, Users, BookOpen, Building, Clock, GraduationCap, Calendar, Award, FlaskConical } from "lucide-react";
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
            Congratulations! Your school has been successfully configured with comprehensive information. 
            Your enhanced data is ready for the advanced scheduling system.
          </p>
        </div>
      </div>

      {/* Enhanced Setup Data Review */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-slate-50">
        <CardHeader>
          <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            Comprehensive Setup Data Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced School Information */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              School Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div><span className="font-medium">Name:</span> {schoolData.name || 'Not provided'}</div>
              <div><span className="font-medium">Type:</span> {schoolData.school_type || 'Not specified'}</div>
              <div><span className="font-medium">Address:</span> {schoolData.address || 'Not provided'}</div>
              <div><span className="font-medium">Phone:</span> {schoolData.phone || 'Not provided'}</div>
              <div><span className="font-medium">Email:</span> {schoolData.email || 'Not provided'}</div>
              <div><span className="font-medium">Principal:</span> {schoolData.principal_name || 'Not provided'}</div>
              <div><span className="font-medium">Academic Year:</span> {schoolData.academic_year || 'Not provided'}</div>
              <div><span className="font-medium">Terms:</span> {schoolData.number_of_terms || 'Not specified'} terms</div>
              <div><span className="font-medium">Working Days:</span> {schoolData.working_days || 'Not specified'} days/year</div>
            </div>
            {schoolData.school_vision && (
              <div className="mt-3 p-3 bg-blue-50 rounded">
                <span className="font-medium">Vision/Mission:</span>
                <p className="text-gray-700 mt-1">{schoolData.school_vision}</p>
              </div>
            )}
          </div>

          {/* Enhanced Students */}
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({schoolData.students?.length || 0})
            </h3>
            {schoolData.students && schoolData.students.length > 0 ? (
              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {schoolData.students.map((student: any, index: number) => (
                    <div key={index} className="bg-green-50 p-2 rounded">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-gray-600">
                        Grade {student.grade} {student.section && `- ${student.section}`}
                      </div>
                      <div className="text-gray-500">Roll {student.roll_number}</div>
                      {student.assigned_class_id && (
                        <div className="text-xs text-green-600">Assigned to class</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No students added</p>
            )}
          </div>

          {/* Enhanced Teachers */}
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h3 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Teachers ({schoolData.teachers?.length || 0})
            </h3>
            {schoolData.teachers && schoolData.teachers.length > 0 ? (
              <div className="max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {schoolData.teachers.map((teacher: any, index: number) => (
                    <div key={index} className="bg-purple-50 p-3 rounded border-l-2 border-purple-200">
                      <div className="font-medium flex items-center gap-2">
                        {teacher.first_name} {teacher.last_name}
                        {teacher.is_class_teacher && (
                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                            Class Teacher
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600">{teacher.email}</div>
                      <div className="text-gray-500">
                        {teacher.department} • {teacher.experience_years} years exp.
                      </div>
                      <div className="text-gray-500">
                        Max {teacher.max_periods_per_day} periods/day
                      </div>
                      {teacher.qualification && (
                        <div className="text-xs text-purple-600 mt-1">{teacher.qualification}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No teachers added</p>
            )}
          </div>

          {/* Enhanced Subjects */}
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subjects ({schoolData.subjects?.length || 0})
            </h3>
            {schoolData.subjects && schoolData.subjects.length > 0 ? (
              <div className="max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {schoolData.subjects.map((subject: any, index: number) => (
                    <div key={index} className="bg-orange-50 p-3 rounded border-l-2 border-orange-200">
                      <div className="font-medium flex items-center gap-2">
                        {subject.name}
                        {subject.lab_required && (
                          <FlaskConical className="h-3 w-3 text-orange-600" title="Lab Required" />
                        )}
                      </div>
                      <div className="text-gray-600">{subject.code}</div>
                      <div className="text-gray-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {subject.credits} credits
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {subject.periods_per_week}/week
                        </span>
                      </div>
                      {subject.department && (
                        <div className="text-xs text-orange-600 mt-1">{subject.department}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No subjects added</p>
            )}
          </div>

          {/* Enhanced Classes */}
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Classes ({schoolData.classes?.length || 0})
            </h3>
            {schoolData.classes && schoolData.classes.length > 0 ? (
              <div className="max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {schoolData.classes.map((cls: any, index: number) => (
                    <div key={index} className="bg-red-50 p-3 rounded border-l-2 border-red-200">
                      <div className="font-medium">{cls.name}</div>
                      <div className="text-gray-600">
                        Grade {cls.grade} {cls.section && `- ${cls.section}`}
                      </div>
                      <div className="text-gray-500">
                        Room {cls.room_number || 'TBA'}
                      </div>
                      <div className="text-gray-500 flex items-center justify-between">
                        <span>Capacity: {cls.capacity}</span>
                        {cls.actual_enrollment !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            cls.actual_enrollment > cls.capacity 
                              ? 'bg-red-200 text-red-800' 
                              : 'bg-green-200 text-green-800'
                          }`}>
                            {cls.actual_enrollment} enrolled
                          </span>
                        )}
                      </div>
                      {cls.class_teacher_id && (
                        <div className="text-xs text-red-600 mt-1">Class teacher assigned</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No classes added</p>
            )}
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <h3 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Slots ({schoolData.timeSlots?.length || 0})
            </h3>
            {schoolData.timeSlots && schoolData.timeSlots.length > 0 ? (
              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                  {schoolData.timeSlots.map((slot: any, index: number) => (
                    <div key={index} className="bg-indigo-50 p-2 rounded">
                      <div className="font-medium flex items-center gap-2">
                        {slot.period_name || slot.name}
                        {slot.is_break && (
                          <span className="text-xs bg-indigo-200 text-indigo-800 px-1 rounded">
                            Break
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600">{slot.start_time} - {slot.end_time}</div>
                      {slot.day_of_week && (
                        <div className="text-gray-500 text-xs">{slot.day_of_week}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No time slots added</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">✓</div>
            <div className="font-semibold text-gray-800 text-sm">School Info</div>
            <div className="text-xs text-gray-600">Enhanced details</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {schoolData.students?.length || 0}
            </div>
            <div className="font-semibold text-gray-800 text-sm">Students</div>
            <div className="text-xs text-gray-600">With class assignments</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {schoolData.teachers?.length || 0}
            </div>
            <div className="font-semibold text-gray-800 text-sm">Teachers</div>
            <div className="text-xs text-gray-600">With experience data</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {schoolData.subjects?.length || 0}
            </div>
            <div className="font-semibold text-gray-800 text-sm">Subjects</div>
            <div className="text-xs text-gray-600">With credits & labs</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {schoolData.classes?.length || 0}
            </div>
            <div className="font-semibold text-gray-800 text-sm">Classes</div>
            <div className="text-xs text-gray-600">With capacity data</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {schoolData.timeSlots?.length || 0}
            </div>
            <div className="font-semibold text-gray-800 text-sm">Time Slots</div>
            <div className="text-xs text-gray-600">Schedule periods</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Export Section */}
      {schoolId && <DataExport schoolId={schoolId} />}

      {/* Next Steps */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center text-xl">Ready for Advanced Scheduling!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-700 text-lg">
            Your comprehensive school data with enhanced academic details is now ready for the advanced scheduling system. 
            All configuration data will be automatically loaded and utilized for intelligent timetable generation.
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
              💡 <strong>Note:</strong> The scheduler will automatically detect and load your enhanced setup data including 
              teacher qualifications, subject requirements, class capacities, and academic configuration.
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
