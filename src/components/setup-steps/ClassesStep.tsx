
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2, Building, Users, Clock } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_CLASSES = [
  { 
    name: "Grade 5-A", 
    grade: "Grade 5", 
    section: "A", 
    capacity: 30, 
    room_number: "101",
    teacher_id: null,
    periods_per_day: 7,
    periods_per_week: 35,
    actual_enrollment: 28,
    class_teacher_id: null
  },
  { 
    name: "Grade 5-B", 
    grade: "Grade 5", 
    section: "B", 
    capacity: 30, 
    room_number: "102",
    teacher_id: null,
    periods_per_day: 7,
    periods_per_week: 35,
    actual_enrollment: 25,
    class_teacher_id: null
  },
  { 
    name: "Grade 6-A", 
    grade: "Grade 6", 
    section: "A", 
    capacity: 32, 
    room_number: "201",
    teacher_id: null,
    periods_per_day: 8,
    periods_per_week: 40,
    actual_enrollment: 30,
    class_teacher_id: null
  },
  { 
    name: "Grade 6-B", 
    grade: "Grade 6", 
    section: "B", 
    capacity: 32, 
    room_number: "202",
    teacher_id: null,
    periods_per_day: 8,
    periods_per_week: 40,
    actual_enrollment: 29,
    class_teacher_id: null
  },
  { 
    name: "Grade 7-A", 
    grade: "Grade 7", 
    section: "A", 
    capacity: 35, 
    room_number: "301",
    teacher_id: null,
    periods_per_day: 8,
    periods_per_week: 40,
    actual_enrollment: 33,
    class_teacher_id: null
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
    teacher_id: null,
    periods_per_day: 7,
    periods_per_week: 35,
    actual_enrollment: 0,
    class_teacher_id: null
  }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string | number | null) => {
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
      teacher_id: null,
      periods_per_day: 7,
      periods_per_week: 35,
      actual_enrollment: 0,
      class_teacher_id: null
    }]);
  };

  const removeClass = (index: number) => {
    if (classes.length > 1) {
      setClasses(classes.filter((_, i) => i !== index));
    }
  };

  const handleAutoFill = () => {
    setClasses(SAMPLE_CLASSES);
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

    console.log('Starting class data submission:', classes);
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
        name: cls.name.trim(),
        grade: cls.grade.trim(),
        section: cls.section.trim() || null,
        room_number: cls.room_number.trim() || null,
        school_id: schoolId
      }));

      console.log('Inserting classes:', classesWithSchoolId);

      const { error: insertError } = await supabase
        .from('classes')
        .insert(classesWithSchoolId);

      if (insertError) {
        console.error('Database insert error:', insertError);
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
          <p className="text-gray-600">Configure class structure, capacity, and scheduling information</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:from-orange-100 hover:to-red-100"
        >
          <Wand2 className="h-5 w-5 text-orange-600" />
          <span className="font-medium text-orange-700">Auto Fill Sample Data</span>
        </Button>
      </div>

      <div className="space-y-6">
        {classes.map((cls, index) => (
          <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building className="h-5 w-5 text-orange-600" />
                Class {index + 1}
              </CardTitle>
              {classes.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeClass(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Basic Class Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Class Name *</Label>
                  <Input
                    value={cls.name}
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    placeholder="e.g., Grade 5-A"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Grade *</Label>
                  <Input
                    value={cls.grade}
                    onChange={(e) => handleInputChange(index, 'grade', e.target.value)}
                    placeholder="e.g., Grade 5"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Section</Label>
                  <Input
                    value={cls.section}
                    onChange={(e) => handleInputChange(index, 'section', e.target.value)}
                    placeholder="e.g., A"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Capacity and Room Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Capacity & Room Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Capacity</Label>
                    <Input
                      type="number"
                      value={cls.capacity}
                      onChange={(e) => handleInputChange(index, 'capacity', parseInt(e.target.value) || 30)}
                      placeholder="30"
                      min="1"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Room Number</Label>
                    <Input
                      value={cls.room_number}
                      onChange={(e) => handleInputChange(index, 'room_number', e.target.value)}
                      placeholder="e.g., 101"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Current Enrollment</Label>
                    <Input
                      type="number"
                      value={cls.actual_enrollment}
                      onChange={(e) => handleInputChange(index, 'actual_enrollment', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Configuration */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Periods Per Day</Label>
                    <Input
                      type="number"
                      value={cls.periods_per_day}
                      onChange={(e) => handleInputChange(index, 'periods_per_day', parseInt(e.target.value) || 7)}
                      placeholder="7"
                      min="1"
                      max="12"
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Periods Per Week</Label>
                    <Input
                      type="number"
                      value={cls.periods_per_week}
                      onChange={(e) => handleInputChange(index, 'periods_per_week', parseInt(e.target.value) || 35)}
                      placeholder="35"
                      min="1"
                      max="60"
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addClass}
          className="w-full flex items-center gap-3 py-4 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50"
        >
          <Plus className="h-5 w-5 text-orange-600" />
          <span className="font-medium text-orange-600">Add Another Class</span>
        </Button>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="px-8 py-3"
        >
          ← Previous
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium"
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
