
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2, Users, User } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_CLASSES = [
  { name: "Grade 9 Section A", grade: "9", section: "A", room_number: "101", capacity: 30, actual_enrollment: 28 },
  { name: "Grade 9 Section B", grade: "9", section: "B", room_number: "102", capacity: 30, actual_enrollment: 30 },
  { name: "Grade 10 Section A", grade: "10", section: "A", room_number: "201", capacity: 28, actual_enrollment: 25 },
  { name: "Grade 10 Section B", grade: "10", section: "B", room_number: "202", capacity: 28, actual_enrollment: 27 },
  { name: "Grade 11 Science", grade: "11", section: "Science", room_number: "301", capacity: 25, actual_enrollment: 22 },
  { name: "Grade 12 Science", grade: "12", section: "Science", room_number: "302", capacity: 25, actual_enrollment: 24 }
];

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  is_class_teacher: boolean;
}

export const ClassesStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [classes, setClasses] = useState([{
    name: '',
    grade: '',
    section: '',
    room_number: '',
    capacity: 30,
    actual_enrollment: 0,
    class_teacher_id: ''
  }]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch teachers when component mounts
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!schoolId) return;
      
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select('id, first_name, last_name, is_class_teacher')
          .eq('school_id', schoolId);

        if (error) throw error;
        setTeachers(data || []);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };

    fetchTeachers();
  }, [schoolId]);

  const handleInputChange = (index: number, field: string, value: string | number) => {
    const updatedClasses = [...classes];
    updatedClasses[index] = { ...updatedClasses[index], [field]: value };
    setClasses(updatedClasses);
  };

  const addClass = () => {
    setClasses([...classes, {
      name: '',
      grade: '',
      section: '',
      room_number: '',
      capacity: 30,
      actual_enrollment: 0,
      class_teacher_id: ''
    }]);
  };

  const removeClass = (index: number) => {
    if (classes.length > 1) {
      setClasses(classes.filter((_, i) => i !== index));
    }
  };

  const handleAutoFill = () => {
    setClasses(SAMPLE_CLASSES.map(cls => ({ ...cls, class_teacher_id: '' })));
    toast({
      title: "✨ Auto-filled successfully!",
      description: "Sample class data has been loaded into the form.",
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const handleSubmit = async () => {
    if (!schoolId) {
      toast({
        title: "❌ Missing Information",
        description: "School ID is required. Please complete the school information step first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const validClasses = classes.filter(cls => 
        cls.name && cls.grade
      );

      if (validClasses.length === 0) {
        toast({
          title: "❌ Validation Error",
          description: "Please add at least one class with name and grade.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // First, delete existing classes for this school to prevent duplicates
      const { error: deleteError } = await supabase
        .from('classes')
        .delete()
        .eq('school_id', schoolId);

      if (deleteError) {
        console.error('Error deleting existing classes:', deleteError);
      }

      const classesWithSchoolId = validClasses.map(cls => ({
        ...cls,
        school_id: schoolId,
        class_teacher_id: cls.class_teacher_id || null
      }));

      const { error } = await supabase
        .from('classes')
        .insert(classesWithSchoolId);

      if (error) throw error;

      toast({
        title: "✅ Success!",
        description: `${validClasses.length} classes added successfully!`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      onStepComplete({ classes: validClasses });
      onNext();
    } catch (error) {
      console.error('Error saving classes:', error);
      toast({
        title: "❌ Save Failed",
        description: "Failed to save classes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTeachers = (currentIndex: number) => {
    const assignedTeacherIds = classes
      .map((cls, idx) => idx !== currentIndex ? cls.class_teacher_id : null)
      .filter(id => id);
    
    return teachers.filter(teacher => !assignedTeacherIds.includes(teacher.id));
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Add Classes</h2>
          <p className="text-gray-600">Configure classes with capacity and teacher assignments</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 transition-all duration-300"
        >
          <Wand2 className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-700">Auto Fill Sample Data</span>
        </Button>
      </div>

      <div className="space-y-6">
        {classes.map((cls, index) => (
          <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                Class {index + 1}
              </CardTitle>
              {classes.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeClass(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Class Name *</Label>
                  <Input
                    value={cls.name}
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    placeholder="Grade 9 Section A"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Grade *</Label>
                  <Input
                    value={cls.grade}
                    onChange={(e) => handleInputChange(index, 'grade', e.target.value)}
                    placeholder="9"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Section</Label>
                  <Input
                    value={cls.section}
                    onChange={(e) => handleInputChange(index, 'section', e.target.value)}
                    placeholder="A"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Room and Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Room Number</Label>
                  <Input
                    value={cls.room_number}
                    onChange={(e) => handleInputChange(index, 'room_number', e.target.value)}
                    placeholder="101"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Maximum Capacity</Label>
                  <Input
                    type="number"
                    value={cls.capacity}
                    onChange={(e) => handleInputChange(index, 'capacity', parseInt(e.target.value) || 30)}
                    placeholder="30"
                    min="1"
                    max="100"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Actual Enrollment</Label>
                  <Input
                    type="number"
                    value={cls.actual_enrollment}
                    onChange={(e) => handleInputChange(index, 'actual_enrollment', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    max={cls.capacity}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500">Current student count</p>
                </div>
              </div>

              {/* Class Teacher Assignment */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Class Teacher Assignment
                </Label>
                <Select 
                  value={cls.class_teacher_id} 
                  onValueChange={(value) => handleInputChange(index, 'class_teacher_id', value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Select a class teacher (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No class teacher assigned</SelectItem>
                    {getAvailableTeachers(index).map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                        {teacher.is_class_teacher && " (Experienced Class Teacher)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {cls.class_teacher_id && (
                  <p className="text-xs text-green-600">
                    Assigned to: {getTeacherName(cls.class_teacher_id)}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Class teachers handle administrative duties and student guidance
                </p>
              </div>

              {/* Capacity Warning */}
              {cls.actual_enrollment > cls.capacity && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ Enrollment exceeds capacity by {cls.actual_enrollment - cls.capacity} students
                  </p>
                </div>
              )}

              {/* Utilization Info */}
              {cls.capacity > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    📊 Utilization: {Math.round((cls.actual_enrollment / cls.capacity) * 100)}% 
                    ({cls.actual_enrollment}/{cls.capacity} students)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addClass}
          className="w-full flex items-center gap-3 py-4 border-2 border-dashed border-gray-300 hover:border-red-400 hover:bg-red-50 transition-all duration-300"
        >
          <Plus className="h-5 w-5 text-red-600" />
          <span className="font-medium text-red-600">Add Another Class</span>
        </Button>
      </div>

      {/* Summary Information */}
      {classes.some(cls => cls.capacity > 0) && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Classes:</span> {classes.filter(c => c.name).length}
              </div>
              <div>
                <span className="font-medium">Total Capacity:</span> {classes.reduce((sum, c) => sum + (c.capacity || 0), 0)}
              </div>
              <div>
                <span className="font-medium">Total Enrollment:</span> {classes.reduce((sum, c) => sum + (c.actual_enrollment || 0), 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="px-8 py-3 border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ← Previous
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium transition-all duration-300 disabled:opacity-50"
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
    </div>
  );
};
