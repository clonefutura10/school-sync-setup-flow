import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2, UserCheck, GraduationCap, Clock } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_TEACHERS = [
  { 
    first_name: "Sarah", 
    last_name: "Johnson", 
    teacher_id: "T001", 
    email: "sarah.johnson@school.edu", 
    phone: "+1-555-0201",
    department: "Mathematics",
    subjects: ["Mathematics", "Statistics"],
    qualification: "M.Ed in Mathematics",
    qualification_details: "Master's in Education with Mathematics specialization, 8 years experience",
    experience_years: 8,
    max_hours_per_day: 6,
    max_periods_per_day: 7,
    is_class_teacher: true,
    preferences: "Prefers morning classes",
    availability_notes: "Available Monday-Friday, 8 AM - 4 PM"
  },
  { 
    first_name: "Michael", 
    last_name: "Davis", 
    teacher_id: "T002", 
    email: "michael.davis@school.edu", 
    phone: "+1-555-0202",
    department: "Science",
    subjects: ["Physics", "Chemistry"],
    qualification: "Ph.D in Physics",
    qualification_details: "Ph.D in Physics from MIT, specialized in experimental physics",
    experience_years: 12,
    max_hours_per_day: 5,
    max_periods_per_day: 6,
    is_class_teacher: false,
    preferences: "Lab sessions preferred",
    availability_notes: "Available all weekdays, prefers afternoon lab sessions"
  },
  { 
    first_name: "Emily", 
    last_name: "Brown", 
    teacher_id: "T003", 
    email: "emily.brown@school.edu", 
    phone: "+1-555-0203",
    department: "English",
    subjects: ["English Literature", "Creative Writing"],
    qualification: "M.A in English Literature",
    qualification_details: "Master's in English Literature, specialization in modern poetry",
    experience_years: 6,
    max_hours_per_day: 6,
    max_periods_per_day: 8,
    is_class_teacher: true,
    preferences: "Interactive sessions",
    availability_notes: "Flexible schedule, available for extra-curricular activities"
  }
];

export const TeachersStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [teachers, setTeachers] = useState([{
    first_name: '',
    last_name: '',
    teacher_id: '',
    email: '',
    phone: '',
    department: '',
    subjects: [] as string[],
    qualification: '',
    qualification_details: '',
    experience_years: 0,
    max_hours_per_day: 6,
    max_periods_per_day: 7,
    is_class_teacher: false,
    preferences: '',
    availability_notes: ''
  }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string | number | boolean | string[]) => {
    const updatedTeachers = [...teachers];
    updatedTeachers[index] = { ...updatedTeachers[index], [field]: value };
    setTeachers(updatedTeachers);
  };

  const addTeacher = () => {
    setTeachers([...teachers, {
      first_name: '',
      last_name: '',
      teacher_id: '',
      email: '',
      phone: '',
      department: '',
      subjects: [],
      qualification: '',
      qualification_details: '',
      experience_years: 0,
      max_hours_per_day: 6,
      max_periods_per_day: 7,
      is_class_teacher: false,
      preferences: '',
      availability_notes: ''
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

  const handleSubmit = async () => {
    if (!schoolId) {
      toast({
        title: "❌ Missing Information",
        description: "School ID is required. Please complete the school information step first.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting teacher data submission:', teachers);
    setLoading(true);

    try {
      const validTeachers = teachers.filter(teacher => 
        teacher.first_name.trim() && teacher.last_name.trim() && teacher.teacher_id.trim()
      );

      if (validTeachers.length === 0) {
        toast({
          title: "❌ Validation Error",
          description: "Please add at least one teacher with first name, last name, and teacher ID.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

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
        preferences: teacher.preferences.trim() || 'no preference',
        availability_notes: teacher.availability_notes.trim() || null,
        subjects: teacher.subjects,
        school_id: schoolId
      }));

      console.log('Inserting teachers:', teachersWithSchoolId);

      const { error: insertError } = await supabase
        .from('teachers')
        .insert(teachersWithSchoolId);

      if (insertError) {
        console.error('Database insert error:', insertError);
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
          <p className="text-gray-600">Enter teacher information, qualifications, and teaching preferences</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
        >
          <Wand2 className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-700">Auto Fill Sample Data</span>
        </Button>
      </div>

      <div className="space-y-6">
        {teachers.map((teacher, index) => (
          <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-600" />
                Teacher {index + 1}
              </CardTitle>
              {teachers.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTeacher(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">First Name *</Label>
                  <Input
                    value={teacher.first_name}
                    onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                    placeholder="Enter first name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Last Name *</Label>
                  <Input
                    value={teacher.last_name}
                    onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                    placeholder="Enter last name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Teacher ID *</Label>
                  <Input
                    value={teacher.teacher_id}
                    onChange={(e) => handleInputChange(index, 'teacher_id', e.target.value)}
                    placeholder="Enter teacher ID"
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
                    placeholder="Enter email address"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                  <Input
                    value={teacher.phone}
                    onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Academic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Department</Label>
                    <Input
                      value={teacher.department}
                      onChange={(e) => handleInputChange(index, 'department', e.target.value)}
                      placeholder="e.g., Mathematics"
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Qualification</Label>
                    <Input
                      value={teacher.qualification}
                      onChange={(e) => handleInputChange(index, 'qualification', e.target.value)}
                      placeholder="e.g., M.Ed in Mathematics"
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Qualification Details</Label>
                  <Input
                    value={teacher.qualification_details}
                    onChange={(e) => handleInputChange(index, 'qualification_details', e.target.value)}
                    placeholder="Detailed qualification information"
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Experience (Years)</Label>
                  <Input
                    type="number"
                    value={teacher.experience_years}
                    onChange={(e) => handleInputChange(index, 'experience_years', parseInt(e.target.value) || 0)}
                    placeholder="Years of experience"
                    min="0"
                    className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Teaching Preferences */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Teaching Preferences & Workload
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Max Hours Per Day</Label>
                    <Input
                      type="number"
                      value={teacher.max_hours_per_day}
                      onChange={(e) => handleInputChange(index, 'max_hours_per_day', parseInt(e.target.value) || 6)}
                      min="1"
                      max="10"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Max Periods Per Day</Label>
                    <Input
                      type="number"
                      value={teacher.max_periods_per_day}
                      onChange={(e) => handleInputChange(index, 'max_periods_per_day', parseInt(e.target.value) || 7)}
                      min="1"
                      max="12"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`class-teacher-${index}`}
                    checked={teacher.is_class_teacher}
                    onCheckedChange={(checked) => handleInputChange(index, 'is_class_teacher', checked)}
                  />
                  <Label htmlFor={`class-teacher-${index}`} className="text-sm font-medium">
                    Assigned as Class Teacher
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Teaching Preferences</Label>
                  <Input
                    value={teacher.preferences}
                    onChange={(e) => handleInputChange(index, 'preferences', e.target.value)}
                    placeholder="e.g., Prefers morning classes"
                    className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Availability Notes</Label>
                  <Input
                    value={teacher.availability_notes}
                    onChange={(e) => handleInputChange(index, 'availability_notes', e.target.value)}
                    placeholder="e.g., Available Monday-Friday, 8 AM - 4 PM"
                    className="border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addTeacher}
          className="w-full flex items-center gap-3 py-4 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50"
        >
          <Plus className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-600">Add Another Teacher</span>
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
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
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
