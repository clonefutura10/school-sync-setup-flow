
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2, Building, Users, UserCheck } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  department?: string;
}

const SAMPLE_CLASSES = [
  { 
    name: "Grade 1-A", 
    grade: "1", 
    section: "A", 
    capacity: 25, 
    room_number: "101",
    actual_enrollment: 22
  },
  { 
    name: "Grade 1-B", 
    grade: "1", 
    section: "B", 
    capacity: 25, 
    room_number: "102",
    actual_enrollment: 24
  },
  { 
    name: "Grade 2-A", 
    grade: "2", 
    section: "A", 
    capacity: 30, 
    room_number: "201",
    actual_enrollment: 28
  },
  { 
    name: "Grade 3-A", 
    grade: "3", 
    section: "A", 
    capacity: 30, 
    room_number: "301",
    actual_enrollment: 29
  }
];

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
    capacity: 30,
    room_number: '',
    actual_enrollment: 0,
    class_teacher_id: ''
  }]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (schoolId) {
      fetchTeachers();
    }
  }, [schoolId]);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, first_name, last_name, email, department')
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error fetching teachers:', error);
        return;
      }

      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

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
      capacity: 30,
      room_number: '',
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
    setClasses(SAMPLE_CLASSES.map(cls => ({
      ...cls,
      class_teacher_id: ''
    })));
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
        className: "fixed top-4 right-4 w-96",
      });
      return;
    }

    setLoading(true);
    try {
      const validClasses = classes.filter(cls => 
        cls.name.trim() && cls.grade.trim()
      );

      if (validClasses.length === 0) {
        toast({
          title: "❌ Validation Error",
          description: "Please add at least one class with name and grade.",
          variant: "destructive",
          className: "fixed top-4 right-4 w-96",
        });
        setLoading(false);
        return;
      }

      // Delete existing classes for this school
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

      const { error: insertError } = await supabase
        .from('classes')
        .insert(classesWithSchoolId);

      if (insertError) {
        console.error('Detailed insert error:', insertError);
        throw new Error(`Failed to save classes: ${insertError.message}`);
      }

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
        description: error instanceof Error ? error.message : "Failed to save classes. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-96",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Add Classes</h2>
          <p className="text-gray-600">Configure classes with teacher assignments and enrollment tracking</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100 transition-all duration-300"
        >
          <Wand2 className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-700">Auto Fill Sample Data</span>
        </Button>
      </div>

      <div className="space-y-6">
        {classes.map((cls, index) => (
          <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
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
                    placeholder="e.g., Grade 1-A"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Grade *</Label>
                  <Input
                    value={cls.grade}
                    onChange={(e) => handleInputChange(index, 'grade', e.target.value)}
                    placeholder="e.g., 1"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Section</Label>
                  <Input
                    value={cls.section}
                    onChange={(e) => handleInputChange(index, 'section', e.target.value)}
                    placeholder="e.g., A"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                  />
                </div>
              </div>

              {/* Capacity and Enrollment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Capacity
                  </Label>
                  <Input
                    type="number"
                    value={cls.capacity}
                    onChange={(e) => handleInputChange(index, 'capacity', parseInt(e.target.value) || 30)}
                    placeholder="30"
                    min="1"
                    max="100"
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500">Maximum students</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Room Number</Label>
                  <Input
                    value={cls.room_number}
                    onChange={(e) => handleInputChange(index, 'room_number', e.target.value)}
                    placeholder="e.g., 101"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500">Assigned classroom</p>
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
                  <p className="text-xs text-gray-500">Currently enrolled students</p>
                </div>
              </div>

              {/* Class Teacher Assignment */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  Class Teacher
                </Label>
                <Select
                  value={cls.class_teacher_id}
                  onValueChange={(value) => handleInputChange(index, 'class_teacher_id', value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors">
                    <SelectValue placeholder="Select a class teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No teacher assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                        {teacher.department && (
                          <span className="text-gray-500 ml-2">({teacher.department})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Primary teacher responsible for this class</p>
              </div>

              {/* Enrollment Status Indicator */}
              {cls.actual_enrollment > 0 && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Enrollment Status:</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${
                      cls.actual_enrollment > cls.capacity 
                        ? 'bg-red-100 text-red-800' 
                        : cls.actual_enrollment === cls.capacity
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {cls.actual_enrollment}/{cls.capacity} students
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        cls.actual_enrollment > cls.capacity 
                          ? 'bg-red-500' 
                          : cls.actual_enrollment === cls.capacity
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((cls.actual_enrollment / cls.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addClass}
          className="w-full flex items-center gap-3 py-4 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
        >
          <Plus className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-600">Add Another Class</span>
        </Button>
      </div>

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
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 disabled:opacity-50"
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
