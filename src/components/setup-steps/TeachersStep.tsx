
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2, User, GraduationCap, Clock } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_TEACHERS = [
  { 
    teacher_id: "T001", 
    first_name: "Sarah", 
    last_name: "Johnson", 
    email: "sarah.johnson@school.edu", 
    phone: "+1234567890", 
    department: "Mathematics", 
    qualification: "M.Sc Mathematics",
    experience_years: 8,
    is_class_teacher: true,
    max_periods_per_day: 6,
    qualification_details: "M.Sc Mathematics from State University, B.Ed from Teachers College"
  },
  { 
    teacher_id: "T002", 
    first_name: "Michael", 
    last_name: "Chen", 
    email: "michael.chen@school.edu", 
    phone: "+1234567891", 
    department: "Science", 
    qualification: "M.Sc Physics",
    experience_years: 12,
    is_class_teacher: false,
    max_periods_per_day: 7,
    qualification_details: "M.Sc Physics, B.Ed, Specialized in Laboratory Management"
  },
  { 
    teacher_id: "T003", 
    first_name: "Emily", 
    last_name: "Davis", 
    email: "emily.davis@school.edu", 
    phone: "+1234567892", 
    department: "English", 
    qualification: "M.A English Literature",
    experience_years: 5,
    is_class_teacher: true,
    max_periods_per_day: 5,
    qualification_details: "M.A English Literature, B.Ed, Certificate in Creative Writing"
  },
  { 
    teacher_id: "T004", 
    first_name: "Robert", 
    last_name: "Wilson", 
    email: "robert.wilson@school.edu", 
    phone: "+1234567893", 
    department: "Social Studies", 
    qualification: "M.A History",
    experience_years: 15,
    is_class_teacher: false,
    max_periods_per_day: 6,
    qualification_details: "M.A History, B.Ed, Research experience in Ancient Civilizations"
  }
];

export const TeachersStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [teachers, setTeachers] = useState([{
    teacher_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    qualification: '',
    experience_years: 0,
    is_class_teacher: false,
    max_periods_per_day: 6,
    qualification_details: ''
  }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string | number | boolean) => {
    const updatedTeachers = [...teachers];
    updatedTeachers[index] = { ...updatedTeachers[index], [field]: value };
    setTeachers(updatedTeachers);
  };

  const addTeacher = () => {
    setTeachers([...teachers, {
      teacher_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      qualification: '',
      experience_years: 0,
      is_class_teacher: false,
      max_periods_per_day: 6,
      qualification_details: ''
    }]);
  };

  const removeTeacher = (index: number) => {
    if (teachers.length > 1) {
      setTeachers(teachers.filter((_, i) => i !== index));
    }
  };

  const handleAutoFill = () => {
    setTeachers(SAMPLE_TEACHERS);
    toast({
      title: "✨ Auto-filled successfully!",
      description: "Sample teacher data has been loaded into the form.",
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const validateForm = () => {
    const validTeachers = teachers.filter(teacher => 
      teacher.first_name.trim() && teacher.last_name.trim() && teacher.teacher_id.trim()
    );

    if (validTeachers.length === 0) {
      toast({
        title: "❌ Validation Error",
        description: "Please add at least one teacher with first name, last name, and teacher ID.",
        variant: "destructive",
      });
      return false;
    }

    // Check for duplicate teacher IDs
    const teacherIds = validTeachers.map(t => t.teacher_id.trim());
    const duplicateIds = teacherIds.filter((id, index) => teacherIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      toast({
        title: "❌ Validation Error",
        description: `Duplicate teacher IDs found: ${duplicateIds.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
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

    if (!validateForm()) return;

    setLoading(true);
    try {
      const validTeachers = teachers.filter(teacher => 
        teacher.first_name.trim() && teacher.last_name.trim() && teacher.teacher_id.trim()
      );

      // First, delete existing teachers for this school to prevent duplicates
      const { error: deleteError } = await supabase
        .from('teachers')
        .delete()
        .eq('school_id', schoolId);

      if (deleteError) {
        console.error('Error deleting existing teachers:', deleteError);
      }

      const teachersWithSchoolId = validTeachers.map(teacher => ({
        ...teacher,
        first_name: teacher.first_name.trim(),
        last_name: teacher.last_name.trim(),
        teacher_id: teacher.teacher_id.trim(),
        email: teacher.email.trim() || null,
        phone: teacher.phone.trim() || null,
        department: teacher.department.trim() || null,
        qualification: teacher.qualification.trim() || null,
        qualification_details: teacher.qualification_details.trim() || null,
        school_id: schoolId
      }));

      const { error: insertError } = await supabase
        .from('teachers')
        .insert(teachersWithSchoolId);

      if (insertError) {
        console.error('Detailed insert error:', insertError);
        throw new Error(`Failed to save teachers: ${insertError.message}`);
      }

      toast({
        title: "✅ Success!",
        description: `${validTeachers.length} teachers added successfully!`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      onStepComplete({ teachers: validTeachers });
      onNext();
    } catch (error) {
      console.error('Error saving teachers:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save teachers. Please try again.",
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Add Teachers</h2>
          <p className="text-gray-600">Configure your teaching staff with detailed information</p>
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
        {teachers.map((teacher, index) => (
          <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Teacher {index + 1}
              </CardTitle>
              {teachers.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTeacher(index)}
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
                  <Label className="text-sm font-semibold text-gray-700">Teacher ID *</Label>
                  <Input
                    value={teacher.teacher_id}
                    onChange={(e) => handleInputChange(index, 'teacher_id', e.target.value)}
                    placeholder="T001"
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">First Name *</Label>
                  <Input
                    value={teacher.first_name}
                    onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                    placeholder="John"
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Last Name *</Label>
                  <Input
                    value={teacher.last_name}
                    onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                    placeholder="Doe"
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Email</Label>
                  <Input
                    type="email"
                    value={teacher.email}
                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    placeholder="john.doe@school.edu"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                  <Input
                    value={teacher.phone}
                    onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                    placeholder="+1234567890"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Department</Label>
                  <Input
                    value={teacher.department}
                    onChange={(e) => handleInputChange(index, 'department', e.target.value)}
                    placeholder="Mathematics"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Basic Qualification</Label>
                  <Input
                    value={teacher.qualification}
                    onChange={(e) => handleInputChange(index, 'qualification', e.target.value)}
                    placeholder="M.Sc Mathematics"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Experience (Years)
                  </Label>
                  <Input
                    type="number"
                    value={teacher.experience_years}
                    onChange={(e) => handleInputChange(index, 'experience_years', parseInt(e.target.value) || 0)}
                    placeholder="5"
                    min="0"
                    max="50"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Teaching Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Max Periods Per Day
                  </Label>
                  <Input
                    type="number"
                    value={teacher.max_periods_per_day}
                    onChange={(e) => handleInputChange(index, 'max_periods_per_day', parseInt(e.target.value) || 6)}
                    placeholder="6"
                    min="1"
                    max="10"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500">Maximum teaching periods per day</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Role Assignment
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`class-teacher-${index}`}
                      checked={teacher.is_class_teacher}
                      onCheckedChange={(checked) => handleInputChange(index, 'is_class_teacher', checked)}
                    />
                    <Label htmlFor={`class-teacher-${index}`} className="text-sm">
                      Assign as Class Teacher
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">Class teachers have additional responsibilities</p>
                </div>
              </div>

              {/* Detailed Qualifications */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  Detailed Qualifications
                </Label>
                <Textarea
                  value={teacher.qualification_details}
                  onChange={(e) => handleInputChange(index, 'qualification_details', e.target.value)}
                  placeholder="Detailed educational background, certifications, and specializations..."
                  rows={3}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500">Include degrees, certifications, and special training</p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addTeacher}
          className="w-full flex items-center gap-3 py-4 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
        >
          <Plus className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-600">Add Another Teacher</span>
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
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all duration-300 disabled:opacity-50"
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
