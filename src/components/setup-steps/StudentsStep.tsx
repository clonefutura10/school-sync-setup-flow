
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Upload, Wand2 } from "lucide-react";
import { BaseStepProps, StudentData } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIInput } from "@/components/ui/ai-input";
import { BulkAddStudents } from "@/components/BulkAddStudents";

export const StudentsStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId,
  schoolData
}) => {
  const [students, setStudents] = useState<StudentData[]>(
    schoolData?.students || []
  );
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [newStudent, setNewStudent] = useState<StudentData>({
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
  const { toast } = useToast();

  const addStudent = () => {
    if (!newStudent.first_name || !newStudent.last_name || !newStudent.student_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in first name, last name, and student ID",
        variant: "destructive",
      });
      return;
    }

    setStudents([...students, { ...newStudent }]);
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
  };

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleBulkAdd = (bulkStudents: StudentData[]) => {
    setStudents([...students, ...bulkStudents]);
    setShowBulkAdd(false);
  };

  const saveStudents = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (students.length > 0) {
        const { error } = await supabase
          .from('students')
          .upsert(students.map(student => ({
            ...student,
            school_id: schoolId,
          })));

        if (error) throw error;
      }

      onStepComplete({ students });
      toast({
        title: "Success",
        description: `${students.length} students saved successfully!`,
      });
      onNext();

    } catch (error) {
      console.error('Error saving students:', error);
      toast({
        title: "Error",
        description: "Failed to save students",
        variant: "destructive",
      });
    }
  };

  if (showBulkAdd) {
    return (
      <BulkAddStudents
        onBulkAdd={handleBulkAdd}
        onClose={() => setShowBulkAdd(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Users className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Student Information</h2>
        <p className="text-gray-600">Add student details and contact information</p>
      </div>

      {/* Bulk Add Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowBulkAdd(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Bulk Add Students
        </Button>
      </div>

      {/* Add Individual Student */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add Student
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>First Name *</Label>
              <AIInput
                value={newStudent.first_name}
                onChange={(value) => setNewStudent(prev => ({ ...prev, first_name: value }))}
                placeholder="Enter first name"
                suggestionType="student_data"
                context={{ field: 'first_name' }}
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <AIInput
                value={newStudent.last_name}
                onChange={(value) => setNewStudent(prev => ({ ...prev, last_name: value }))}
                placeholder="Enter last name"
                suggestionType="student_data"
                context={{ field: 'last_name' }}
              />
            </div>
            <div>
              <Label>Student ID *</Label>
              <Input
                value={newStudent.student_id}
                onChange={(e) => setNewStudent(prev => ({ ...prev, student_id: e.target.value }))}
                placeholder="e.g., STU001"
              />
            </div>
            <div>
              <Label>Grade</Label>
              <AIInput
                value={newStudent.grade}
                onChange={(value) => setNewStudent(prev => ({ ...prev, grade: value }))}
                placeholder="e.g., 10"
                suggestionType="student_data"
                context={{ field: 'grade' }}
              />
            </div>
            <div>
              <Label>Section</Label>
              <AIInput
                value={newStudent.section}
                onChange={(value) => setNewStudent(prev => ({ ...prev, section: value }))}
                placeholder="e.g., A"
                suggestionType="student_data"
                context={{ field: 'section' }}
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={newStudent.date_of_birth}
                onChange={(e) => setNewStudent(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>
            <div>
              <Label>Parent Name</Label>
              <AIInput
                value={newStudent.parent_name}
                onChange={(value) => setNewStudent(prev => ({ ...prev, parent_name: value }))}
                placeholder="Enter parent name"
                suggestionType="student_data"
                context={{ field: 'parent_name' }}
              />
            </div>
            <div>
              <Label>Parent Email</Label>
              <Input
                type="email"
                value={newStudent.parent_email}
                onChange={(e) => setNewStudent(prev => ({ ...prev, parent_email: e.target.value }))}
                placeholder="parent@email.com"
              />
            </div>
            <div>
              <Label>Parent Phone</Label>
              <Input
                value={newStudent.parent_phone}
                onChange={(e) => setNewStudent(prev => ({ ...prev, parent_phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={newStudent.address}
              onChange={(e) => setNewStudent(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter address"
            />
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
              <span>Added Students ({students.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{student.first_name} {student.last_name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStudent(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{student.student_id}</Badge>
                    {student.grade && <Badge>{student.grade}-{student.section}</Badge>}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Parent: {student.parent_name}</div>
                    {student.parent_phone && <div>Phone: {student.parent_phone}</div>}
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
