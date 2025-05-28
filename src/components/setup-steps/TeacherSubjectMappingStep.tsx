
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, UserCheck, BookOpen, Building, AlertCircle } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  department?: string;
  max_periods_per_day: number;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
  department?: string;
  periods_per_week: number;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  section?: string;
}

interface TeacherSubjectMapping {
  id?: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  periods_per_week: number;
}

export const TeacherSubjectMappingStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [mappings, setMappings] = useState<TeacherSubjectMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();
  
  // State for tracking workload and conflicts
  const [teacherWorkload, setTeacherWorkload] = useState<Record<string, number>>({});
  const [conflicts, setConflicts] = useState<string[]>([]);
  
  // UI state
  const [view, setView] = useState<'matrix' | 'list'>('matrix');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  // Fetch all required data when component mounts
  useEffect(() => {
    if (schoolId) {
      Promise.all([
        fetchTeachers(),
        fetchSubjects(),
        fetchClasses()
      ]).then(() => {
        setLoadingData(false);
      });
    }
  }, [schoolId]);

  // Update workload and conflicts whenever mappings change
  useEffect(() => {
    calculateWorkload();
    detectConflicts();
  }, [mappings]);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, first_name, last_name, department, max_periods_per_day')
        .eq('school_id', schoolId);

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Failed to load teachers",
        description: "Could not fetch teacher data from the database.",
        variant: "destructive"
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code, department, periods_per_week')
        .eq('school_id', schoolId);

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Failed to load subjects",
        description: "Could not fetch subject data from the database.",
        variant: "destructive"
      });
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, grade, section')
        .eq('school_id', schoolId);

      if (error) throw error;
      setClasses(data || []);

      // Also try to fetch existing mappings if any
      await fetchExistingMappings();
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Failed to load classes",
        description: "Could not fetch class data from the database.",
        variant: "destructive"
      });
    }
  };

  const fetchExistingMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_subject_assignments')
        .select('id, teacher_id, subject_id, class_id, periods_per_week')
        .eq('class_id', schoolId);

      if (error) throw error;

      if (data && data.length > 0) {
        setMappings(data);
        toast({
          title: "Existing assignments loaded",
          description: `${data.length} teacher-subject assignments found.`,
        });
      }
    } catch (error) {
      console.error('Error fetching existing mappings:', error);
    }
  };

  const addMapping = (teacherId: string, subjectId: string, classId: string) => {
    // Check if mapping already exists
    const existingMapping = mappings.find(
      m => m.teacher_id === teacherId && m.subject_id === subjectId && m.class_id === classId
    );
    
    if (existingMapping) {
      toast({
        title: "Mapping already exists",
        description: "This teacher-subject-class combination is already assigned.",
        variant: "destructive"
      });
      return;
    }

    // Get default periods per week from subject
    const subject = subjects.find(s => s.id === subjectId);
    const defaultPeriods = subject?.periods_per_week || 5;
    
    // Add new mapping
    setMappings([...mappings, {
      teacher_id: teacherId,
      subject_id: subjectId,
      class_id: classId,
      periods_per_week: defaultPeriods
    }]);

    toast({
      title: "Assignment created",
      description: `Added new teacher-subject-class assignment.`,
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const updateMapping = (index: number, field: keyof TeacherSubjectMapping, value: string | number) => {
    const updatedMappings = [...mappings];
    updatedMappings[index] = { ...updatedMappings[index], [field]: value };
    setMappings(updatedMappings);
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
    toast({
      title: "Assignment removed",
      description: "The teacher-subject-class assignment has been deleted.",
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-red-500",
    });
  };

  const calculateWorkload = () => {
    // Calculate total periods per week for each teacher
    const workload: Record<string, number> = {};
    
    for (const mapping of mappings) {
      workload[mapping.teacher_id] = (workload[mapping.teacher_id] || 0) + mapping.periods_per_week;
    }
    
    setTeacherWorkload(workload);
  };

  const detectConflicts = () => {
    const newConflicts: string[] = [];
    
    // Check for teacher overloading
    for (const teacherId in teacherWorkload) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (teacher) {
        const maxWeeklyPeriods = teacher.max_periods_per_day * 5; // Assuming 5 days per week
        if (teacherWorkload[teacherId] > maxWeeklyPeriods) {
          newConflicts.push(`Teacher ${teacher.first_name} ${teacher.last_name} is overloaded (${teacherWorkload[teacherId]} > ${maxWeeklyPeriods} periods/week)`);
        }
      }
    }
    
    // Check for class-subject conflicts (duplicate subjects for same class)
    const classSubjectMap: Record<string, Set<string>> = {};
    
    for (const mapping of mappings) {
      if (!classSubjectMap[mapping.class_id]) {
        classSubjectMap[mapping.class_id] = new Set();
      }
      
      if (classSubjectMap[mapping.class_id].has(mapping.subject_id)) {
        const subject = subjects.find(s => s.id === mapping.subject_id);
        const classItem = classes.find(c => c.id === mapping.class_id);
        if (subject && classItem) {
          newConflicts.push(`Multiple teachers assigned to ${subject.name} for class ${classItem.name}`);
        }
      } else {
        classSubjectMap[mapping.class_id].add(mapping.subject_id);
      }
    }
    
    setConflicts(newConflicts);
  };

  const generateSampleData = () => {
    if (teachers.length < 2 || subjects.length < 3 || classes.length < 2) {
      toast({
        title: "Insufficient data",
        description: "You need at least 2 teachers, 3 subjects, and 2 classes to generate sample data.",
        variant: "destructive"
      });
      return;
    }

    // Create some sample assignments based on available data
    const sampleMappings: TeacherSubjectMapping[] = [];
    
    // For each class, assign teachers to subjects
    for (let c = 0; c < classes.length; c++) {
      const classId = classes[c].id;
      
      // Assign different subjects to teachers
      for (let s = 0; s < Math.min(subjects.length, 5); s++) {
        const subjectId = subjects[s].id;
        // Rotate through teachers for better distribution
        const teacherId = teachers[s % teachers.length].id;
        const periodsPerWeek = subjects[s].periods_per_week || 5;
        
        sampleMappings.push({
          teacher_id: teacherId,
          subject_id: subjectId,
          class_id: classId,
          periods_per_week: periodsPerWeek
        });
      }
    }
    
    setMappings(sampleMappings);
    
    toast({
      title: "✨ Sample data generated",
      description: `Created ${sampleMappings.length} teacher-subject assignments.`,
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const handleSubmit = async () => {
    if (!schoolId) {
      toast({
        title: "❌ Missing Information",
        description: "School ID is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (mappings.length === 0) {
        throw new Error("Please add at least one teacher-subject-class assignment.");
      }

      // Delete existing assignments for this school's teachers
      const teacherIds = teachers.map(t => t.id);
      if (teacherIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('teacher_subject_assignments')
          .delete()
          .in('teacher_id', teacherIds);

        if (deleteError) {
          console.error('Error deleting existing assignments:', deleteError);
        }
      }

      // Insert new mappings
      const { error: insertError } = await supabase
        .from('teacher_subject_assignments')
        .insert(mappings);

      if (insertError) {
        throw new Error(`Failed to save assignments: ${insertError.message}`);
      }

      toast({
        title: "✅ Success!",
        description: `${mappings.length} teacher-subject assignments saved successfully.`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      onStepComplete({ teacherSubjectMappings: mappings });
      onNext();
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save assignments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for UI rendering
  const getTeacherName = (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher';
  };

  const getSubjectName = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getClassName = (id: string) => {
    const classItem = classes.find(c => c.id === id);
    return classItem ? classItem.name : 'Unknown Class';
  };

  const getWorkloadPercentage = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return 0;
    
    const maxWeekly = teacher.max_periods_per_day * 5;
    const current = teacherWorkload[teacherId] || 0;
    
    return Math.min((current / maxWeekly) * 100, 100);
  };

  const getWorkloadColor = (teacherId: string) => {
    const percentage = getWorkloadPercentage(teacherId);
    
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const renderMatrixView = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Assignment Matrix</h3>
            <p className="text-sm text-gray-600">Assign teachers to subjects for each class</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.first_name} {teacher.last_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 border-r">
                  Class / Subject
                </th>
                {subjects
                  .filter(sub => !selectedClass || mappings.some(m => m.class_id === selectedClass && m.subject_id === sub.id))
                  .map((subject) => (
                    <th key={subject.id} className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[120px] truncate">
                              {subject.name}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{subject.name}</p>
                            <p className="text-xs text-gray-500">{subject.periods_per_week} periods/week</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes
                .filter(cls => !selectedClass || cls.id === selectedClass)
                .map((classItem) => (
                  <tr key={classItem.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r">
                      {classItem.name}
                    </td>
                    {subjects
                      .filter(sub => !selectedClass || mappings.some(m => m.class_id === selectedClass && m.subject_id === sub.id))
                      .map((subject) => {
                        const mapping = mappings.find(
                          m => m.class_id === classItem.id && m.subject_id === subject.id
                        );
                        
                        return (
                          <td key={`${classItem.id}-${subject.id}`} className="py-2 px-3 text-sm text-gray-500">
                            {mapping ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                                <div className="text-xs font-medium mb-1 flex items-center justify-between">
                                  <span>
                                    {getTeacherName(mapping.teacher_id)}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const index = mappings.findIndex(m => m.teacher_id === mapping.teacher_id && 
                                        m.subject_id === mapping.subject_id && m.class_id === mapping.class_id);
                                      if (index !== -1) removeMapping(index);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M18 6 6 18"></path>
                                      <path d="m6 6 12 12"></path>
                                    </svg>
                                  </button>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={mapping.periods_per_week}
                                    onChange={(e) => {
                                      const index = mappings.findIndex(m => m.teacher_id === mapping.teacher_id && 
                                        m.subject_id === mapping.subject_id && m.class_id === mapping.class_id);
                                      if (index !== -1) updateMapping(index, 'periods_per_week', parseInt(e.target.value) || 1);
                                    }}
                                    className="w-16 px-1 py-0.5 border border-gray-300 rounded text-center"
                                  />
                                  <span className="ml-1">periods/week</span>
                                </div>
                              </div>
                            ) : (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="w-full text-blue-600 border-dashed border-blue-300 hover:bg-blue-50"
                                  >
                                    Assign Teacher
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Assign Teacher</h4>
                                    <p className="text-xs text-gray-500">
                                      {getClassName(classItem.id)} - {getSubjectName(subject.id)}
                                    </p>
                                    <div className="max-h-48 overflow-y-auto border rounded">
                                      {teachers
                                        .filter(teacher => !selectedTeacher || teacher.id === selectedTeacher)
                                        .map((teacher) => (
                                          <button
                                            key={teacher.id}
                                            onClick={() => {
                                              addMapping(teacher.id, subject.id, classItem.id);
                                              document.body.click(); // Close popover
                                            }}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                                          >
                                            <span>
                                              {teacher.first_name} {teacher.last_name}
                                              {teacher.department && <span className="text-xs text-gray-500 ml-1">({teacher.department})</span>}
                                            </span>
                                            <Progress 
                                              value={getWorkloadPercentage(teacher.id)} 
                                              className="w-16 h-1.5" 
                                              indicatorClassName={getWorkloadColor(teacher.id)}
                                            />
                                          </button>
                                        ))}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </td>
                        );
                      })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Assignment List</h3>
          <Button 
            onClick={() => {
              if (teachers.length && subjects.length && classes.length) {
                addMapping(teachers[0].id, subjects[0].id, classes[0].id);
              } else {
                toast({
                  title: "Missing data",
                  description: "You need teachers, subjects, and classes to create assignments.",
                  variant: "destructive"
                });
              }
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Assignment
          </Button>
        </div>

        {mappings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-600">No Assignments Yet</h4>
            <p className="text-sm text-gray-500 mb-4">Start by assigning teachers to subjects for each class.</p>
            <Button
              onClick={() => generateSampleData()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Generate Sample Assignments
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {mappings.map((mapping, index) => (
              <Card key={index} className="shadow-sm hover:shadow transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{getTeacherName(mapping.teacher_id)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-600" />
                        <span>{getSubjectName(mapping.subject_id)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-orange-600" />
                        <span>{getClassName(mapping.class_id)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`periods-${index}`} className="whitespace-nowrap">Periods/week:</Label>
                        <Input 
                          id={`periods-${index}`}
                          type="number" 
                          min="1" 
                          max="10"
                          value={mapping.periods_per_week} 
                          onChange={(e) => updateMapping(index, 'periods_per_week', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 h-8" 
                        />
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeMapping(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Teacher-Subject-Class Mapping</h2>
          <p className="text-gray-600">Assign teachers to subjects for each class and configure teaching workload</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => generateSampleData()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100 transition-all duration-300"
        >
          <Wand2 className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-700">Generate Assignments</span>
        </Button>
      </div>

      {loadingData ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-lg text-gray-700">Loading data...</span>
        </div>
      ) : (
        <>
          {teachers.length === 0 || subjects.length === 0 || classes.length === 0 ? (
            <Card className="shadow-lg bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                  <div>
                    <h3 className="text-lg font-medium text-orange-800">Missing Prerequisites</h3>
                    <p className="text-orange-700">
                      You need teachers, subjects, and classes before creating assignments.
                      Please complete previous setup steps first.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Resource summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Teachers</h4>
                        <p className="text-2xl font-bold text-blue-700">{teachers.length}</p>
                      </div>
                      <UserCheck className="h-8 w-8 text-blue-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-green-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Subjects</h4>
                        <p className="text-2xl font-bold text-green-700">{subjects.length}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-green-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-orange-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Classes</h4>
                        <p className="text-2xl font-bold text-orange-700">{classes.length}</p>
                      </div>
                      <Building className="h-8 w-8 text-orange-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conflicts alert */}
              {conflicts.length > 0 && (
                <Card className="shadow-md bg-red-50 border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Assignment Conflicts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1 pb-4">
                    <ul className="list-disc pl-5 space-y-1">
                      {conflicts.map((conflict, i) => (
                        <li key={i} className="text-sm text-red-700">{conflict}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Teacher workload summary */}
              {mappings.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Teacher Workload</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {Object.keys(teacherWorkload).map((teacherId) => {
                        const teacher = teachers.find(t => t.id === teacherId);
                        if (!teacher) return null;
                        
                        const workload = teacherWorkload[teacherId];
                        const maxWeekly = teacher.max_periods_per_day * 5;
                        const percentage = (workload / maxWeekly) * 100;
                        
                        return (
                          <div key={teacherId} className="flex items-center gap-2">
                            <div className="w-32 text-sm truncate">
                              {teacher.first_name} {teacher.last_name}
                            </div>
                            <Progress 
                              value={percentage} 
                              className="h-2 flex-grow" 
                              indicatorClassName={getWorkloadColor(teacherId)}
                            />
                            <div className="text-xs whitespace-nowrap">
                              <span className="font-medium">{workload}</span>
                              <span className="text-gray-500">/{maxWeekly} periods</span>
                              <span className="ml-1 font-medium">
                                ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assignment view toggle */}
              <div>
                <Tabs value={view} onValueChange={(v) => setView(v as 'matrix' | 'list')} className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="matrix" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                        <path d="M3 9h18"></path>
                        <path d="M9 21V9"></path>
                      </svg>
                      Matrix View
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 6h13"></path>
                        <path d="M8 12h13"></path>
                        <path d="M8 18h13"></path>
                        <path d="M3 6h.01"></path>
                        <path d="M3 12h.01"></path>
                        <path d="M3 18h.01"></path>
                      </svg>
                      List View
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="matrix" className="mt-6">
                    {renderMatrixView()}
                  </TabsContent>
                  
                  <TabsContent value="list" className="mt-6">
                    {renderListView()}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Assignment stats */}
              {mappings.length > 0 && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Assignment Statistics</h4>
                          <p className="text-sm text-gray-600">
                            {mappings.length} assignments across {classes.length} classes
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-white">
                          <span className="font-normal text-gray-500">Total Periods:</span>
                          <span className="ml-1 font-medium">
                            {mappings.reduce((sum, m) => sum + m.periods_per_week, 0)}
                          </span>
                        </Badge>
                        
                        <Badge variant="outline" className="bg-white">
                          <span className="font-normal text-gray-500">Subjects Covered:</span>
                          <span className="ml-1 font-medium">
                            {new Set(mappings.map(m => m.subject_id)).size}/{subjects.length}
                          </span>
                        </Badge>
                        
                        <Badge variant="outline" className="bg-white">
                          <span className="font-normal text-gray-500">Teachers Assigned:</span>
                          <span className="ml-1 font-medium">
                            {new Set(mappings.map(m => m.teacher_id)).size}/{teachers.length}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={onPrevious}
              className="px-8 py-3 border-gray-300 hover:bg-gray-50"
            >
              ← Previous
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || teachers.length === 0 || subjects.length === 0 || classes.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                'Next Step →'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
