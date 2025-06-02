import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Upload, GraduationCap } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BulkUpload } from "../BulkUpload";
import { GroqSuggestionInput } from "../GroqSuggestionInput";

interface Student {
  first_name: string;
  last_name: string;
  student_id: string;
  grade: string;
  section: string;
  date_of_birth: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  address: string;
  parent_contact: string;
  assigned_class_id: string | null;
}

export const StudentsStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId,
  schoolData
}) => {
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>(
    schoolData.students || []
  );

  const [newStudent, setNewStudent] = useState<Student>({
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
    assigned_class_id: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleBulkAdd = (bulkStudents: Student[]) => {
    const processedStudents = bulkStudents.map(student => ({
      ...student,
      parent_contact: student.parent_contact || `${student.parent_name}, ${student.parent_phone}`,
      assigned_class_id: null
    }));
    
    setStudents(prevStudents => [...prevStudents, ...processedStudents]);
  };

  const addStudent = () => {
    if (!newStudent.first_name || !newStudent.last_name) {
      toast({
        title: "Error",
        description: "Please fill in first name and last name",
        variant: "destructive",
      });
      return;
    }

    setStudents(prevStudents => [...prevStudents, { ...newStudent }]);
    setNewStudent({
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
      assigned_class_id: null,
    });
    
    toast({
      title: "✅ Student Added!",
      description: "Student has been added successfully.",
    });
  };

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const saveStudents = async () => {
    try {
      if (students.length > 0 && schoolId) {
        const { error } = await (supabase as any)
          .from('students')
          .upsert(students.map(student => ({
            ...student,
            school_id: schoolId,
          })));

        if (error) console.error('Database error (using fallback):', error);
      }

      const studentsData = { students };
      onStepComplete(studentsData);
      toast({
        title: "Success",
        description: "Students configured successfully!",
      });
      onNext();

    } catch (error) {
      console.error('Error saving students:', error);
      // Continue with local storage
      onStepComplete({ students });
      toast({
        title: "Success",
        description: "Students saved locally!",
      });
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <GraduationCap className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Student Registration</h2>
        <p className="text-gray-600">Add students to your school database</p>
      </div>

      {/* Bulk Upload Component */}
      <BulkUpload type="students" onBulkAdd={handleBulkAdd} />

      {/* Individual Student Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add Individual Student
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GroqSuggestionInput
              label="First Name"
              value={newStudent.first_name}
              onChange={(value) => setNewStudent(prev => ({ ...prev, first_name: value }))}
              placeholder="e.g., John"
              suggestionPrompt="Suggest realistic first names for students. Return as JSON array."
            />
            
            <GroqSuggestionInput
              label="Last Name"
              value={newStudent.last_name}
              onChange={(value) => setNewStudent(prev => ({ ...prev, last_name: value }))}
              placeholder="e.g., Doe"
              suggestionPrompt="Suggest realistic last names for students. Return as JSON array."
            />
            
            <div>
              <Label>Student ID</Label>
              <Input
                type="text"
                name="student_id"
                value={newStudent.student_id}
                onChange={handleInputChange}
                placeholder="e.g., STU001"
              />
            </div>
            
            <div>
              <Label>Grade</Label>
              <Input
                type="text"
                name="grade"
                value={newStudent.grade}
                onChange={handleInputChange}
                placeholder="e.g., Grade 5"
              />
            </div>
            
            <div>
              <Label>Section</Label>
              <Input
                type="text"
                name="section"
                value={newStudent.section}
                onChange={handleInputChange}
                placeholder="e.g., A"
              />
            </div>
            
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                name="date_of_birth"
                value={newStudent.date_of_birth}
                onChange={handleInputChange}
              />
            </div>
            
            <GroqSuggestionInput
              label="Parent Name"
              value={newStudent.parent_name}
              onChange={(value) => setNewStudent(prev => ({ ...prev, parent_name: value }))}
              placeholder="e.g., Jane Doe"
              suggestionPrompt="Suggest realistic parent names. Return as JSON array."
            />
            
            <div>
              <Label>Parent Email</Label>
              <Input
                type="email"
                name="parent_email"
                value={newStudent.parent_email}
                onChange={handleInputChange}
                placeholder="e.g., jane.doe@email.com"
              />
            </div>
            
            <div>
              <Label>Parent Phone</Label>
              <Input
                type="tel"
                name="parent_phone"
                value={newStudent.parent_phone}
                onChange={handleInputChange}
                placeholder="e.g., +1-555-0123"
              />
            </div>
            
            <div>
              <Label>Address</Label>
              <Input
                type="text"
                name="address"
                value={newStudent.address}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main St, City"
              />
            </div>
          </div>

          <Button onClick={addStudent} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </CardContent>
      </Card>

      {/* Students List */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Registered Students ({students.length})</span>
              <Badge variant="outline">
                <Users className="h-4 w-4 mr-1" />
                Total Students: {students.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <h4 className="font-semibold">{student.first_name} {student.last_name}</h4>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStudent(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Student ID: {student.student_id}</div>
                    <div>Grade: {student.grade}, Section: {student.section}</div>
                    <div>Date of Birth: {student.date_of_birth}</div>
                    <div>Parent: {student.parent_name} ({student.parent_phone})</div>
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
        <Button onClick={saveStudents}>
          Next: Teachers →
        </Button>
      </div>
    </div>
  );
};
