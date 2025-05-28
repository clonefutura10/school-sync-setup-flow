
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2, Users, Upload } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_STUDENTS = [
  { 
    first_name: "Emma", 
    last_name: "Johnson", 
    student_id: "STU001", 
    grade: "Grade 5", 
    section: "A",
    date_of_birth: "2014-03-15",
    parent_name: "Sarah Johnson",
    parent_email: "sarah.johnson@email.com",
    parent_phone: "+1-555-0101",
    address: "123 Oak Street, Springfield",
    parent_contact: "Mother: Sarah Johnson, +1-555-0101"
  },
  { 
    first_name: "Liam", 
    last_name: "Smith", 
    student_id: "STU002", 
    grade: "Grade 5", 
    section: "A",
    date_of_birth: "2014-07-22",
    parent_name: "Michael Smith",
    parent_email: "michael.smith@email.com", 
    parent_phone: "+1-555-0102",
    address: "456 Pine Avenue, Springfield",
    parent_contact: "Father: Michael Smith, +1-555-0102"
  },
  { 
    first_name: "Olivia", 
    last_name: "Brown", 
    student_id: "STU003", 
    grade: "Grade 6", 
    section: "B",
    date_of_birth: "2013-11-08",
    parent_name: "Jessica Brown",
    parent_email: "jessica.brown@email.com",
    parent_phone: "+1-555-0103", 
    address: "789 Maple Drive, Springfield",
    parent_contact: "Mother: Jessica Brown, +1-555-0103"
  },
  { 
    first_name: "Noah", 
    last_name: "Davis", 
    student_id: "STU004", 
    grade: "Grade 6", 
    section: "A",
    date_of_birth: "2013-09-12",
    parent_name: "David Davis",
    parent_email: "david.davis@email.com",
    parent_phone: "+1-555-0104",
    address: "321 Elm Street, Springfield", 
    parent_contact: "Father: David Davis, +1-555-0104"
  },
  { 
    first_name: "Ava", 
    last_name: "Wilson", 
    student_id: "STU005", 
    grade: "Grade 7", 
    section: "A",
    date_of_birth: "2012-05-19",
    parent_name: "Lisa Wilson",
    parent_email: "lisa.wilson@email.com",
    parent_phone: "+1-555-0105",
    address: "654 Cedar Lane, Springfield",
    parent_contact: "Mother: Lisa Wilson, +1-555-0105"
  }
];

export const StudentsStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [students, setStudents] = useState([{
    first_name: '',
    last_name: '',
    student_id: '',
    grade: '',
    section: '',
    date_of_birth: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    address: '',
    parent_contact: '',
    assigned_class_id: null
  }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedStudents = [...students];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    setStudents(updatedStudents);
  };

  const addStudent = () => {
    setStudents([...students, {
      first_name: '',
      last_name: '',
      student_id: '',
      grade: '',
      section: '',
      date_of_birth: '',
      parent_name: '',
      parent_email: '',
      parent_phone: '',
      address: '',
      parent_contact: '',
      assigned_class_id: null
    }]);
  };

  const removeStudent = (index: number) => {
    if (students.length > 1) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  const handleAutoFill = () => {
    setStudents(SAMPLE_STUDENTS);
    toast({
      title: "✨ Auto-filled successfully!",
      description: "Sample student data has been loaded into the form.",
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

    console.log('Starting student data submission:', students);
    setLoading(true);
    
    try {
      const validStudents = students.filter(student => 
        student.first_name.trim() && student.last_name.trim() && student.student_id.trim()
      );

      if (validStudents.length === 0) {
        toast({
          title: "❌ Validation Error",
          description: "Please add at least one student with first name, last name, and student ID.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // First, delete existing students for this school to prevent duplicates
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('school_id', schoolId);

      if (deleteError) {
        console.error('Error deleting existing students:', deleteError);
      }

      const studentsWithSchoolId = validStudents.map(student => ({
        ...student,
        first_name: student.first_name.trim(),
        last_name: student.last_name.trim(),
        student_id: student.student_id.trim(),
        grade: student.grade.trim() || null,
        section: student.section.trim() || null,
        date_of_birth: student.date_of_birth || null,
        parent_name: student.parent_name.trim() || null,
        parent_email: student.parent_email.trim() || null,
        parent_phone: student.parent_phone.trim() || null,
        address: student.address.trim() || null,
        parent_contact: student.parent_contact.trim() || null,
        assigned_class_id: student.assigned_class_id,
        school_id: schoolId
      }));

      console.log('Inserting students:', studentsWithSchoolId);

      const { error: insertError } = await supabase
        .from('students')
        .insert(studentsWithSchoolId);

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Failed to save students: ${insertError.message}`);
      }

      toast({
        title: "✅ Success!",
        description: `${validStudents.length} students added successfully!`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      onStepComplete({ students: validStudents });
      onNext();

    } catch (error) {
      console.error('Error saving students:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save students. Please try again.",
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Add Students</h2>
          <p className="text-gray-600">Enter student information and parent contact details</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:from-green-100 hover:to-blue-100"
        >
          <Wand2 className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-700">Auto Fill Sample Data</span>
        </Button>
      </div>

      <div className="space-y-6">
        {students.map((student, index) => (
          <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Student {index + 1}
              </CardTitle>
              {students.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStudent(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Student Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">First Name *</Label>
                  <Input
                    value={student.first_name}
                    onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                    placeholder="Enter first name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Last Name *</Label>
                  <Input
                    value={student.last_name}
                    onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                    placeholder="Enter last name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Student ID *</Label>
                  <Input
                    value={student.student_id}
                    onChange={(e) => handleInputChange(index, 'student_id', e.target.value)}
                    placeholder="Enter student ID"
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Academic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Grade</Label>
                  <Input
                    value={student.grade}
                    onChange={(e) => handleInputChange(index, 'grade', e.target.value)}
                    placeholder="e.g., Grade 5"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Section</Label>
                  <Input
                    value={student.section}
                    onChange={(e) => handleInputChange(index, 'section', e.target.value)}
                    placeholder="e.g., A"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Date of Birth</Label>
                  <Input
                    type="date"
                    value={student.date_of_birth}
                    onChange={(e) => handleInputChange(index, 'date_of_birth', e.target.value)}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Parent Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-b pb-2">Parent/Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Parent/Guardian Name</Label>
                    <Input
                      value={student.parent_name}
                      onChange={(e) => handleInputChange(index, 'parent_name', e.target.value)}
                      placeholder="Enter parent name"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Parent Email</Label>
                    <Input
                      type="email"
                      value={student.parent_email}
                      onChange={(e) => handleInputChange(index, 'parent_email', e.target.value)}
                      placeholder="Enter parent email"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Parent Phone</Label>
                    <Input
                      value={student.parent_phone}
                      onChange={(e) => handleInputChange(index, 'parent_phone', e.target.value)}
                      placeholder="Enter parent phone"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Emergency Contact</Label>
                    <Input
                      value={student.parent_contact}
                      onChange={(e) => handleInputChange(index, 'parent_contact', e.target.value)}
                      placeholder="Emergency contact details"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Address</Label>
                  <Input
                    value={student.address}
                    onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                    placeholder="Enter student address"
                    className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addStudent}
          className="w-full flex items-center gap-3 py-4 border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50"
        >
          <Plus className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-600">Add Another Student</span>
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
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
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
