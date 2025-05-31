
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Trash2, Users, Wand2 } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIInput } from "@/components/ui/ai-input";
import { useGroqSuggestions } from "@/hooks/useGroqSuggestions";

interface ClassData {
  name: string;
  grade: string;
  section: string;
  capacity: number;
  room_number: string;
  class_teacher_id: string;
  actual_enrollment: number;
}

export const ClassesStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId,
  schoolData
}) => {
  const { toast } = useToast();
  const { getSuggestions } = useGroqSuggestions();
  
  const [classes, setClasses] = useState<ClassData[]>(
    schoolData?.classes || []
  );
  const [newClass, setNewClass] = useState<ClassData>({
    name: '',
    grade: '',
    section: '',
    capacity: 30,
    room_number: '',
    class_teacher_id: '',
    actual_enrollment: 0,
  });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    // Load teachers and students data
    if (schoolData?.teachers) {
      setTeachers(schoolData.teachers);
    }
    if (schoolData?.students) {
      setStudents(schoolData.students);
    }
  }, [schoolData]);

  const generateAIClasses = async () => {
    try {
      const studentCount = students.length;
      const teacherCount = teachers.length;
      
      const prompt = `Generate appropriate class divisions for a school with ${studentCount} students and ${teacherCount} teachers. Suggest class names, grades, sections, and optimal capacity. Consider typical class sizes of 25-35 students.`;
      
      const suggestions = await getSuggestions(prompt, { 
        studentCount, 
        teacherCount,
        existingClasses: classes.length 
      }, 'class_organization');
      
      if (suggestions.length > 0) {
        const generatedClasses = suggestions.slice(0, 8).map((className: string, index: number) => ({
          name: className,
          grade: `${Math.floor(index / 2) + 6}`, // Grades 6-9
          section: index % 2 === 0 ? 'A' : 'B',
          capacity: 30,
          room_number: `Room ${100 + index + 1}`,
          class_teacher_id: teachers[index % teachers.length]?.teacher_id || '',
          actual_enrollment: Math.floor(Math.random() * 10) + 20, // 20-30 students
        }));
        
        setClasses([...classes, ...generatedClasses]);
        
        toast({
          title: "✨ AI Generated Classes!",
          description: `Created ${generatedClasses.length} class suggestions based on your school data.`,
          className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
        });
      }
    } catch (error) {
      console.log('Failed to generate class suggestions:', error);
    }
  };

  const addClass = () => {
    if (!newClass.name || !newClass.grade) {
      toast({
        title: "Validation Error",
        description: "Please fill in class name and grade",
        variant: "destructive",
      });
      return;
    }

    setClasses([...classes, { ...newClass }]);
    setNewClass({
      name: '',
      grade: '',
      section: '',
      capacity: 30,
      room_number: '',
      class_teacher_id: '',
      actual_enrollment: 0,
    });
  };

  const removeClass = (index: number) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  const saveClasses = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (classes.length > 0) {
        const { error } = await supabase
          .from('classes')
          .upsert(classes.map(classItem => ({
            ...classItem,
            school_id: schoolId,
          })));

        if (error) throw error;
      }

      onStepComplete({ classes });
      toast({
        title: "Success",
        description: `${classes.length} classes configured successfully!`,
      });
      onNext();

    } catch (error) {
      console.error('Error saving classes:', error);
      toast({
        title: "Error",
        description: "Failed to save classes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Building className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Class Configuration</h2>
        <p className="text-gray-600">Set up classes, assign teachers, and configure capacity</p>
      </div>

      {/* AI Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Based on your {students.length} students and {teachers.length} teachers, 
              let AI suggest optimal class divisions.
            </p>
            <Button 
              onClick={generateAIClasses}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Wand2 className="h-5 w-5" />
              Generate AI Class Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add New Class */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add Class
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Class Name</Label>
              <AIInput
                value={newClass.name}
                onChange={(value) => setNewClass(prev => ({ ...prev, name: value }))}
                placeholder="e.g., Grade 6A"
                suggestionType="class_organization"
                context={{ grade: newClass.grade }}
              />
            </div>
            <div>
              <Label>Grade</Label>
              <AIInput
                value={newClass.grade}
                onChange={(value) => setNewClass(prev => ({ ...prev, grade: value }))}
                placeholder="e.g., 6"
                suggestionType="class_organization"
                context={{ field: 'grade' }}
              />
            </div>
            <div>
              <Label>Section</Label>
              <AIInput
                value={newClass.section}
                onChange={(value) => setNewClass(prev => ({ ...prev, section: value }))}
                placeholder="e.g., A"
                suggestionType="class_organization"
                context={{ field: 'section' }}
              />
            </div>
            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                min="1"
                value={newClass.capacity}
                onChange={(e) => setNewClass(prev => ({ ...prev, capacity: parseInt(e.target.value) || 30 }))}
              />
            </div>
            <div>
              <Label>Room Number</Label>
              <Input
                value={newClass.room_number}
                onChange={(e) => setNewClass(prev => ({ ...prev, room_number: e.target.value }))}
                placeholder="e.g., Room 101"
              />
            </div>
            <div>
              <Label>Class Teacher</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={newClass.class_teacher_id}
                onChange={(e) => setNewClass(prev => ({ ...prev, class_teacher_id: e.target.value }))}
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher, index) => (
                  <option key={index} value={teacher.teacher_id}>
                    {teacher.first_name} {teacher.last_name} ({teacher.teacher_id})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={addClass} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </CardContent>
      </Card>

      {/* Classes List */}
      {classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Configured Classes ({classes.length})</span>
              <Badge variant="outline">
                <Users className="h-4 w-4 mr-1" />
                Total Capacity: {classes.reduce((sum, cls) => sum + cls.capacity, 0)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((classItem, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{classItem.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeClass(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge>Grade {classItem.grade}</Badge>
                    {classItem.section && <Badge variant="outline">Section {classItem.section}</Badge>}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Room: {classItem.room_number}</div>
                    <div>Capacity: {classItem.capacity} students</div>
                    <div>Current: {classItem.actual_enrollment} students</div>
                    {classItem.class_teacher_id && (
                      <div>Teacher: {classItem.class_teacher_id}</div>
                    )}
                  </div>
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
        <Button onClick={saveClasses}>
          Next: Teacher-Subject Mapping →
        </Button>
      </div>
    </div>
  );
};
