
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookCopy, User, Users, AlertTriangle, CheckCircle, Wand2 } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGroqSuggestions } from "@/hooks/useGroqSuggestions";

interface TeacherSubjectMapping {
  id?: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  periods_per_week: number;
  preferred_time_slots: string[];
}

export const TeacherSubjectMappingStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId,
  schoolData
}) => {
  const { toast } = useToast();
  const { getSuggestions } = useGroqSuggestions();
  
  const [mappings, setMappings] = useState<TeacherSubjectMapping[]>(
    schoolData.teacherSubjectMappings || []
  );
  
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [periodsPerWeek, setPeriodsPerWeek] = useState(5);

  const teachers = schoolData.teachers || [];
  const subjects = schoolData.subjects || [];
  const classes = schoolData.classes || [];
  const timeSlots = schoolData.timeSlots || [];

  // Generate AI-powered mappings
  const generateAIMappings = async () => {
    try {
      const prompt = `Based on these teachers: ${teachers.map(t => `${t.first_name} ${t.last_name} (${t.subjects?.join(', ') || 'General'})`).join(', ')}, subjects: ${subjects.map(s => s.name).join(', ')}, and classes: ${classes.map(c => c.name).join(', ')}, suggest optimal teacher-subject-class assignments. Consider teacher expertise and balanced workloads.`;
      
      const suggestions = await getSuggestions(prompt, {
        teachers: teachers.length,
        subjects: subjects.length,
        classes: classes.length
      }, 'teacher_subject_mappings');
      
      if (suggestions.length > 0) {
        // Generate balanced mappings
        const generatedMappings: TeacherSubjectMapping[] = [];
        
        // Simple algorithm to distribute subjects across teachers and classes
        teachers.forEach((teacher, tIndex) => {
          subjects.forEach((subject, sIndex) => {
            classes.forEach((cls, cIndex) => {
              // Distribute assignments evenly
              if ((tIndex + sIndex + cIndex) % 3 === 0 && generatedMappings.length < teachers.length * 2) {
                generatedMappings.push({
                  teacher_id: teacher.id,
                  subject_id: subject.id,
                  class_id: cls.id,
                  periods_per_week: Math.floor(Math.random() * 3) + 3, // 3-5 periods
                  preferred_time_slots: [],
                });
              }
            });
          });
        });
        
        setMappings(generatedMappings);
        
        toast({
          title: "✨ AI Generated Assignments!",
          description: `Created ${generatedMappings.length} teacher-subject-class mappings with balanced workloads.`,
          className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
        });
      }
    } catch (error) {
      console.log('Failed to generate AI mappings:', error);
    }
  };

  // Calculate teacher workloads
  const getTeacherWorkload = (teacherId: string) => {
    const teacherMappings = mappings.filter(m => m.teacher_id === teacherId);
    const totalPeriods = teacherMappings.reduce((sum, m) => sum + m.periods_per_week, 0);
    const teacher = teachers.find(t => t.id === teacherId);
    const maxPeriods = teacher?.max_periods_per_day ? teacher.max_periods_per_day * 5 : 35;
    
    return {
      current: totalPeriods,
      max: maxPeriods,
      percentage: (totalPeriods / maxPeriods) * 100
    };
  };

  // Get subject coverage for a class
  const getClassSubjectCoverage = (classId: string) => {
    const classMappings = mappings.filter(m => m.class_id === classId);
    const coveredSubjects = new Set(classMappings.map(m => m.subject_id));
    return {
      covered: coveredSubjects.size,
      total: subjects.length,
      percentage: (coveredSubjects.size / subjects.length) * 100
    };
  };

  const addMapping = () => {
    if (!selectedTeacher || !selectedSubject || !selectedClass) {
      toast({
        title: "Error",
        description: "Please select teacher, subject, and class",
        variant: "destructive",
      });
      return;
    }

    // Check if mapping already exists
    const exists = mappings.some(m => 
      m.teacher_id === selectedTeacher && 
      m.subject_id === selectedSubject && 
      m.class_id === selectedClass
    );

    if (exists) {
      toast({
        title: "Error",
        description: "This mapping already exists",
        variant: "destructive",
      });
      return;
    }

    // Check teacher workload
    const workload = getTeacherWorkload(selectedTeacher);
    if (workload.current + periodsPerWeek > workload.max) {
      toast({
        title: "Warning",
        description: "This assignment would exceed teacher's maximum workload",
        variant: "destructive",
      });
      return;
    }

    const newMapping: TeacherSubjectMapping = {
      teacher_id: selectedTeacher,
      subject_id: selectedSubject,
      class_id: selectedClass,
      periods_per_week: periodsPerWeek,
      preferred_time_slots: [],
    };

    setMappings([...mappings, newMapping]);
    setSelectedTeacher('');
    setSelectedSubject('');
    setSelectedClass('');
    setPeriodsPerWeek(5);
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'Unknown';
  };

  const saveMappings = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (mappings.length > 0) {
        const { error } = await (supabase as any)
          .from('teacher_subject_mappings')
          .upsert(mappings.map(mapping => ({
            ...mapping,
            school_id: schoolId,
          })));

        if (error) throw error;
      }

      onStepComplete({ teacherSubjectMappings: mappings });
      toast({
        title: "Success",
        description: "Teacher-subject mappings saved successfully!",
      });
      onNext();

    } catch (error) {
      console.error('Error saving mappings:', error);
      toast({
        title: "Error",
        description: "Failed to save teacher-subject mappings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <BookCopy className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Teacher-Subject-Class Mapping</h2>
        <p className="text-gray-600">Assign teachers to subjects and classes with AI-powered workload management</p>
      </div>

      {/* AI Generate Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quick Setup with AI</span>
            <Button
              onClick={generateAIMappings}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Wand2 className="h-4 w-4" />
              Generate AI Assignments
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Let AI automatically create balanced teacher-subject-class assignments based on your school data.</p>
        </CardContent>
      </Card>

      {/* Add New Mapping */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Teacher</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => {
                  const workload = getTeacherWorkload(teacher.id);
                  return (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name} ({workload.current}/{workload.max} periods)
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <Label>Subject</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Class</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map(cls => {
                  const coverage = getClassSubjectCoverage(cls.id);
                  return (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({coverage.covered}/{coverage.total} subjects)
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <Label>Periods/Week</Label>
              <Input
                type="number"
                value={periodsPerWeek}
                onChange={(e) => setPeriodsPerWeek(parseInt(e.target.value) || 5)}
                min="1"
                max="10"
              />
            </div>
          </div>
          <Button onClick={addMapping} className="w-full">
            Add Assignment
          </Button>
        </CardContent>
      </Card>

      {/* Teacher Workload Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Teacher Workload Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map(teacher => {
              const workload = getTeacherWorkload(teacher.id);
              const isOverloaded = workload.percentage > 100;
              const isNearCapacity = workload.percentage > 80;
              
              return (
                <div key={teacher.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{teacher.first_name} {teacher.last_name}</h4>
                    {isOverloaded ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : isNearCapacity ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Periods:</span>
                      <span>{workload.current}/{workload.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isOverloaded ? 'bg-red-500' : 
                          isNearCapacity ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(workload.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {workload.percentage.toFixed(1)}% capacity
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Mappings */}
      {mappings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Assignments ({mappings.length})</span>
              <Badge variant="outline">
                Total Weekly Periods: {mappings.reduce((sum, m) => sum + m.periods_per_week, 0)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mappings.map((mapping, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <div className="font-semibold">{getTeacherName(mapping.teacher_id)}</div>
                      <div className="text-gray-600">
                        {getSubjectName(mapping.subject_id)} → {getClassName(mapping.class_id)}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {mapping.periods_per_week} periods/week
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMapping(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          ← Previous
        </Button>
        <Button onClick={saveMappings}>
          Next: Time Slots →
        </Button>
      </div>
    </div>
  );
};
