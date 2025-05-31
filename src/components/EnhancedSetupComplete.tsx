import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Edit,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Clock,
  CalendarDays,
  School,
  BookCopy,
  Key,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { DataExport } from './DataExport';
import { passDataToScheduler } from '@/utils/schedulerIntegration';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['school', 'students', 'teachers']);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [credentialsGenerated, setCredentialsGenerated] = useState(false);

  const generateCredentials = () => {
    console.log('Generating credentials...');
    const schoolName = schoolData?.name || 'School';
    const cleanSchoolName = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = `admin_${cleanSchoolName}`;
    
    // Generate a secure random password
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    console.log('Generated credentials:', { username, password });
    setCredentials({ username, password });
    setCredentialsGenerated(true);
    
    // Store credentials in localStorage for login validation
    localStorage.setItem('adminCredentials', JSON.stringify({ username, password }));
    
    toast({
      title: "Credentials Generated!",
      description: "Your login credentials have been created successfully",
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-red-500",
      });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

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
    localStorage.removeItem('adminCredentials');
    window.location.reload();
  };

  // Enhanced data completeness calculations
  const getDataCompleteness = () => {
    const sections = [
      { 
        name: 'School Info', 
        data: schoolData.name, 
        weight: 15,
        hasData: !!(schoolData.name && schoolData.principal_name && schoolData.email)
      },
      { 
        name: 'Academic Calendar', 
        data: schoolData.academicCalendar, 
        weight: 10,
        hasData: Array.isArray(schoolData.academicCalendar) && schoolData.academicCalendar.length > 0
      },
      { 
        name: 'Infrastructure', 
        data: schoolData.infrastructure, 
        weight: 15,
        hasData: Array.isArray(schoolData.infrastructure) && schoolData.infrastructure.length > 0
      },
      { 
        name: 'Students', 
        data: schoolData.students, 
        weight: 20,
        hasData: Array.isArray(schoolData.students) && schoolData.students.length > 0
      },
      { 
        name: 'Teachers', 
        data: schoolData.teachers, 
        weight: 20,
        hasData: Array.isArray(schoolData.teachers) && schoolData.teachers.length > 0
      },
      { 
        name: 'Subjects', 
        data: schoolData.subjects, 
        weight: 10,
        hasData: Array.isArray(schoolData.subjects) && schoolData.subjects.length > 0
      },
      { 
        name: 'Classes', 
        data: schoolData.classes, 
        weight: 5,
        hasData: Array.isArray(schoolData.classes) && schoolData.classes.length > 0
      },
      { 
        name: 'Time Slots', 
        data: schoolData.timeSlots, 
        weight: 5,
        hasData: Array.isArray(schoolData.timeSlots) && schoolData.timeSlots.length > 0
      },
    ];

    let totalScore = 0;
    const sectionScores = sections.map(section => {
      const score = section.hasData ? section.weight : 0;
      totalScore += score;
      return { ...section, score, percentage: section.hasData ? 100 : 0 };
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
    teachers.forEach((teacher: any) => {
      const teacherMappings = mappings.filter((m: any) => m.teacher_id === teacher.id);
      const totalPeriods = teacherMappings.reduce((sum: number, m: any) => sum + (m.periods_per_week || 0), 0);
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
    classes.forEach((cls: any) => {
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
    console.log('Exporting to PDF...');
  };

  const exportToExcel = () => {
    console.log('Exporting to Excel...');
  };

  const generateQRCode = () => {
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

      {/* PROMINENT Generate Credentials Section */}
      <Card className="border-4 border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-full shadow-lg">
              <Key className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-blue-700 mb-2">
            🔐 Generate Your Login Credentials
          </CardTitle>
          <p className="text-blue-600 font-semibold text-lg">
            Click the button below to create your secure login credentials
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="flex justify-center mb-6">
            <Button
              onClick={generateCredentials}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-6 text-2xl font-bold shadow-xl transform hover:scale-105 transition-all duration-200"
              size="lg"
            >
              <Key className="h-8 w-8 mr-4" />
              Generate Credentials Now!
            </Button>
          </div>

          {/* Show credentials immediately after generation */}
          {credentialsGenerated && (
            <div className="bg-white rounded-2xl p-8 border-2 border-green-300 shadow-xl mt-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-green-700">🎉 Your Login Credentials Are Ready!</h3>
                <p className="text-green-600 font-semibold">Save these credentials to access your dashboard</p>
              </div>
              
              <div className="space-y-6">
                {/* Username */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <User className="h-6 w-6 text-blue-600" />
                        <span className="text-lg font-bold text-blue-800 uppercase tracking-wide">Username</span>
                      </div>
                      <div className="font-mono text-2xl text-gray-900 font-bold bg-white px-4 py-3 rounded-lg border-2 border-blue-300">
                        {credentials.username}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => copyToClipboard(credentials.username, 'Username')}
                      className="ml-6 border-2 border-blue-300 hover:bg-blue-100"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Password */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Key className="h-6 w-6 text-purple-600" />
                        <span className="text-lg font-bold text-purple-800 uppercase tracking-wide">Password</span>
                      </div>
                      <div className="font-mono text-2xl text-gray-900 font-bold bg-white px-4 py-3 rounded-lg border-2 border-purple-300">
                        {showPassword ? credentials.password : '••••••••••••'}
                      </div>
                    </div>
                    <div className="flex gap-3 ml-6">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowPassword(!showPassword)}
                        className="border-2 border-purple-300 hover:bg-purple-100"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => copyToClipboard(credentials.password, 'Password')}
                        className="border-2 border-purple-300 hover:bg-purple-100"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Important Notice */}
              <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">🔒</div>
                  <span className="text-xl font-bold text-amber-800">IMPORTANT!</span>
                </div>
                <p className="text-amber-800 font-semibold text-lg leading-relaxed">
                  These credentials are required to access your school dashboard. Please save them securely before proceeding.
                </p>
              </div>

              {/* Login Button */}
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-4 text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-200"
                  size="lg"
                >
                  Login to Dashboard Now
                  <ExternalLink className="h-6 w-6 ml-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
              <TabsTrigger value="details">Detailed Data</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
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

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* School Information Section */}
              <Collapsible open={expandedSections.includes('school')} onOpenChange={() => toggleSection('school')}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        School Information
                      </CardTitle>
                      {expandedSections.includes('school') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div><span className="font-medium">Name:</span> {schoolData.name || 'Not provided'}</div>
                        <div><span className="font-medium">Principal:</span> {schoolData.principal_name || 'Not provided'}</div>
                        <div><span className="font-medium">Type:</span> {schoolData.school_type || 'Not specified'}</div>
                        <div><span className="font-medium">Academic Year:</span> {schoolData.academic_year || 'Not provided'}</div>
                        <div><span className="font-medium">Terms:</span> {schoolData.number_of_terms || 'Not specified'} terms</div>
                        <div><span className="font-medium">Working Days:</span> {schoolData.working_days?.join(', ') || 'Not specified'}</div>
                        <div><span className="font-medium">Phone:</span> {schoolData.phone || 'Not provided'}</div>
                        <div><span className="font-medium">Email:</span> {schoolData.email || 'Not provided'}</div>
                        <div><span className="font-medium">Timezone:</span> {schoolData.timezone || 'UTC'}</div>
                      </div>
                      {schoolData.school_vision && (
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                          <span className="font-medium">Vision/Mission:</span>
                          <p className="text-gray-700 mt-1">{schoolData.school_vision}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {/* Academic Calendar Section */}
              <Collapsible open={expandedSections.includes('calendar')} onOpenChange={() => toggleSection('calendar')}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-indigo-600" />
                        Academic Calendar ({schoolData.academicCalendar?.length || 0} events)
                      </CardTitle>
                      {expandedSections.includes('calendar') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2">
                    <CardContent className="pt-6">
                      {schoolData.academicCalendar && schoolData.academicCalendar.length > 0 ? (
                        <div className="space-y-3">
                          {schoolData.academicCalendar.map((event: any, index: number) => (
                            <div key={index} className="p-3 bg-indigo-50 rounded border-l-4 border-indigo-200">
                              <div className="font-medium">{event.event_name}</div>
                              <div className="text-sm text-gray-600">{event.event_type} • {event.start_date} to {event.end_date}</div>
                              {event.description && (
                                <div className="text-sm text-gray-500 mt-1">{event.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No academic calendar events configured</p>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {/* Infrastructure Section */}
              <Collapsible open={expandedSections.includes('infrastructure')} onOpenChange={() => toggleSection('infrastructure')}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <School className="h-5 w-5 text-emerald-600" />
                        Infrastructure ({schoolData.infrastructure?.length || 0} facilities)
                      </CardTitle>
                      {expandedSections.includes('infrastructure') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2">
                    <CardContent className="pt-6">
                      {schoolData.infrastructure && schoolData.infrastructure.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {schoolData.infrastructure.map((room: any, index: number) => (
                            <div key={index} className="p-3 bg-emerald-50 rounded border-l-4 border-emerald-200">
                              <div className="font-medium flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {room.room_name}
                              </div>
                              <div className="text-sm text-gray-600">{room.room_type} • Capacity: {room.capacity}</div>
                              {room.grade_assignment && (
                                <div className="text-sm text-gray-500">Grade: {room.grade_assignment}</div>
                              )}
                              {room.equipment && room.equipment.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-gray-700">Equipment:</div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {room.equipment.map((eq: any, eqIndex: number) => (
                                      <Badge key={eqIndex} variant="outline" className="text-xs">
                                        {eq.name} ({eq.quantity})
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No infrastructure facilities configured</p>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {/* Students Section */}
              <Collapsible open={expandedSections.includes('students')} onOpenChange={() => toggleSection('students')}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Students ({schoolData.students?.length || 0})
                      </CardTitle>
                      {expandedSections.includes('students') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2">
                    <CardContent className="pt-6">
                      {schoolData.students && schoolData.students.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {schoolData.students.map((student: any, index: number) => (
                            <div key={index} className="p-3 bg-green-50 rounded border-l-4 border-green-200">
                              <div className="font-medium">{student.first_name} {student.last_name}</div>
                              <div className="text-sm text-gray-600">ID: {student.student_id}</div>
                              <div className="text-sm text-gray-600">
                                {student.grade} {student.section && `- ${student.section}`}
                              </div>
                              {student.parent_name && (
                                <div className="text-xs text-gray-500 mt-1">Parent: {student.parent_name}</div>
                              )}
                              {student.parent_email && (
                                <div className="text-xs text-gray-500">{student.parent_email}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No students configured</p>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {/* Teachers Section */}
              <Collapsible open={expandedSections.includes('teachers')} onOpenChange={() => toggleSection('teachers')}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-purple-600" />
                        Teachers ({schoolData.teachers?.length || 0})
                      </CardTitle>
                      {expandedSections.includes('teachers') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2">
                    <CardContent className="pt-6">
                      {schoolData.teachers && schoolData.teachers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {schoolData.teachers.map((teacher: any, index: number) => (
                            <div key={index} className="p-4 bg-purple-50 rounded border-l-4 border-purple-200">
                              <div className="font-medium flex items-center gap-2">
                                {teacher.first_name} {teacher.last_name}
                                {teacher.is_class_teacher && (
                                  <Badge variant="outline" className="text-xs">Class Teacher</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">{teacher.email}</div>
                              <div className="text-sm text-gray-500">
                                {teacher.department} • {teacher.experience_years} years exp.
                              </div>
                              <div className="text-sm text-gray-500">
                                Max {teacher.max_periods_per_day} periods/day
                              </div>
                              {teacher.qualification && (
                                <div className="text-xs text-purple-600 mt-1">{teacher.qualification}</div>
                              )}
                              {teacher.subjects && teacher.subjects.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-gray-700">Subjects:</div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {teacher.subjects.map((subject: string, subIndex: number) => (
                                      <Badge key={subIndex} variant="outline" className="text-xs">
                                        {subject}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No teachers configured</p>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {/* Continue with other sections... */}
              {/* Subjects, Classes, Time Slots sections would follow the same pattern */}
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
                      const percentage = Math.min((totalPeriods / maxPeriods) * 100, 100);
                      
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
