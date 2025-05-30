
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LogOut, 
  Users, 
  BookOpen, 
  Building, 
  User, 
  GraduationCap,
  Calendar,
  Clock,
  School,
  Settings
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [schoolData, setSchoolData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('currentUser');
    
    if (!isLoggedIn || !user) {
      navigate('/login');
      return;
    }

    setCurrentUser(user);

    // Load school data
    const schedulerData = localStorage.getItem('schedulerData');
    const schoolInfo = localStorage.getItem('schoolInfo');
    
    if (schedulerData) {
      try {
        setSchoolData(JSON.parse(schedulerData));
      } catch (error) {
        console.error('Error parsing scheduler data:', error);
      }
    } else if (schoolInfo) {
      try {
        setSchoolData(JSON.parse(schoolInfo));
      } catch (error) {
        console.error('Error parsing school info:', error);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-blue-500",
    });
    
    navigate('/login');
  };

  if (!schoolData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No School Data Found</h2>
          <p className="text-gray-600 mb-4">Please complete the school setup first.</p>
          <Button onClick={() => navigate('/')}>Go to Setup</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <School className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{schoolData.name || 'School Dashboard'}</h1>
                <p className="text-sm text-gray-500">Welcome back, {currentUser}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{schoolData.students?.length || 0}</p>
                  <p className="text-gray-600">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{schoolData.teachers?.length || 0}</p>
                  <p className="text-gray-600">Teachers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{schoolData.subjects?.length || 0}</p>
                  <p className="text-gray-600">Subjects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{schoolData.classes?.length || 0}</p>
                  <p className="text-gray-600">Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Data Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>School Management Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="school" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="school">School</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="teachers">Teachers</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="classes">Classes</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="school" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {schoolData.name}</p>
                      <p><span className="font-medium">Principal:</span> {schoolData.principal_name}</p>
                      <p><span className="font-medium">Type:</span> {schoolData.school_type}</p>
                      <p><span className="font-medium">Email:</span> {schoolData.email}</p>
                      <p><span className="font-medium">Phone:</span> {schoolData.phone}</p>
                      <p><span className="font-medium">Address:</span> {schoolData.address}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Academic Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Academic Year:</span> {schoolData.academic_year}</p>
                      <p><span className="font-medium">Terms:</span> {schoolData.number_of_terms}</p>
                      <p><span className="font-medium">Working Days:</span> {schoolData.working_days?.join(', ')}</p>
                      <p><span className="font-medium">Timezone:</span> {schoolData.timezone}</p>
                    </div>
                  </div>
                </div>
                {schoolData.school_vision && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Vision/Mission</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{schoolData.school_vision}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolData.students?.map((student: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="font-medium">{student.first_name} {student.last_name}</div>
                        <div className="text-sm text-gray-600">ID: {student.student_id}</div>
                        <div className="text-sm text-gray-600">Grade: {student.grade} {student.section}</div>
                        {student.parent_name && (
                          <div className="text-xs text-gray-500 mt-2">Parent: {student.parent_name}</div>
                        )}
                      </CardContent>
                    </Card>
                  )) || <p>No students data available</p>}
                </div>
              </TabsContent>

              <TabsContent value="teachers" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schoolData.teachers?.map((teacher: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{teacher.first_name} {teacher.last_name}</div>
                            <div className="text-sm text-gray-600">{teacher.email}</div>
                            <div className="text-sm text-gray-500">{teacher.department}</div>
                            <div className="text-sm text-gray-500">{teacher.experience_years} years experience</div>
                          </div>
                          {teacher.is_class_teacher && (
                            <Badge variant="outline">Class Teacher</Badge>
                          )}
                        </div>
                        {teacher.subjects && teacher.subjects.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-600">Subjects:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {teacher.subjects.map((subject: string, subIndex: number) => (
                                <Badge key={subIndex} variant="secondary" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )) || <p>No teachers data available</p>}
                </div>
              </TabsContent>

              <TabsContent value="subjects" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolData.subjects?.map((subject: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-sm text-gray-600">Code: {subject.code}</div>
                        <div className="text-sm text-gray-500">Credits: {subject.credits}</div>
                        <div className="text-sm text-gray-500">Periods/week: {subject.periods_per_week}</div>
                        {subject.lab_required && (
                          <Badge variant="outline" className="mt-2">Lab Required</Badge>
                        )}
                      </CardContent>
                    </Card>
                  )) || <p>No subjects data available</p>}
                </div>
              </TabsContent>

              <TabsContent value="classes" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schoolData.classes?.map((cls: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="font-medium">{cls.name}</div>
                        <div className="text-sm text-gray-600">Grade: {cls.grade} {cls.section}</div>
                        <div className="text-sm text-gray-500">Room: {cls.room_number}</div>
                        <div className="text-sm text-gray-500">Capacity: {cls.capacity}</div>
                        {cls.actual_enrollment && (
                          <div className="text-sm text-gray-500">Enrolled: {cls.actual_enrollment}</div>
                        )}
                      </CardContent>
                    </Card>
                  )) || <p>No classes data available</p>}
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Time Slots</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {schoolData.timeSlots?.map((slot: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{slot.name}</span>
                            <span className="text-sm text-gray-600">{slot.start_time} - {slot.end_time}</span>
                          </div>
                        )) || <p>No time slots configured</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Academic Calendar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {schoolData.academicCalendar?.slice(0, 5).map((event: any, index: number) => (
                          <div key={index} className="p-2 bg-gray-50 rounded">
                            <div className="font-medium">{event.event_name}</div>
                            <div className="text-sm text-gray-600">{event.start_date} - {event.end_date}</div>
                          </div>
                        )) || <p>No calendar events configured</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
