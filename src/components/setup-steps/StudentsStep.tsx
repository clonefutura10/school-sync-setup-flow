
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Wand2, Plus, Trash2 } from "lucide-react";

interface StudentsStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onStepComplete: (data: any) => void;
  schoolId: string | null;
}

const SAMPLE_STUDENTS = [
  {
    student_id: "STU001",
    first_name: "Alice",
    last_name: "Johnson",
    email: "alice.johnson@email.com",
    phone: "(555) 111-0001",
    grade: "10",
    section: "A",
    date_of_birth: "2008-05-15",
    parent_name: "Robert Johnson",
    parent_email: "robert.johnson@email.com",
    parent_phone: "(555) 111-0002",
    address: "123 Oak Street, Springfield"
  },
  {
    student_id: "STU002",
    first_name: "Bob",
    last_name: "Smith",
    email: "bob.smith@email.com",
    phone: "(555) 111-0003",
    grade: "10",
    section: "A",
    date_of_birth: "2008-03-22",
    parent_name: "Mary Smith",
    parent_email: "mary.smith@email.com",
    parent_phone: "(555) 111-0004",
    address: "456 Pine Avenue, Springfield"
  },
  {
    student_id: "STU003",
    first_name: "Carol",
    last_name: "Davis",
    email: "carol.davis@email.com",
    phone: "(555) 111-0005",
    grade: "9",
    section: "B",
    date_of_birth: "2009-01-10",
    parent_name: "David Davis",
    parent_email: "david.davis@email.com",
    parent_phone: "(555) 111-0006",
    address: "789 Elm Road, Springfield"
  }
];

export const StudentsStep: React.FC<StudentsStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [students, setStudents] = useState([{
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    grade: '',
    section: '',
    date_of_birth: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    address: ''
  }]);
  const [bulkData, setBulkData] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedStudents = [...students];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    setStudents(updatedStudents);
  };

  const addStudent = () => {
    setStudents([...students, {
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      grade: '',
      section: '',
      date_of_birth: '',
      parent_name: '',
      parent_email: '',
      parent_phone: '',
      address: ''
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
      title: "Auto-filled",
      description: "Student data has been auto-filled with sample data.",
    });
  };

  const processBulkData = () => {
    try {
      const lines = bulkData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const studentData = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const student: any = {};
        
        headers.forEach((header, index) => {
          const key = header.toLowerCase().replace(/\s+/g, '_');
          student[key] = values[index] || '';
        });
        
        studentData.push(student);
      }

      setStudents(studentData);
      setBulkData('');
      toast({
        title: "Success",
        description: `Imported ${studentData.length} students from CSV data.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setBulkData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is required. Please complete the school information step first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const validStudents = students.filter(student => 
        student.student_id && student.first_name && student.last_name
      );

      if (validStudents.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one student with ID, first name, and last name.",
          variant: "destructive",
        });
        return;
      }

      const studentsWithSchoolId = validStudents.map(student => ({
        ...student,
        school_id: schoolId
      }));

      const { error } = await supabase
        .from('students')
        .insert(studentsWithSchoolId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${validStudents.length} students added successfully!`,
      });

      onStepComplete({ students: validStudents });
      onNext();
    } catch (error) {
      console.error('Error saving students:', error);
      toast({
        title: "Error",
        description: "Failed to save students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add Students</h2>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Auto Fill Sample Data
        </Button>
      </div>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          {students.map((student, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Student {index + 1}</CardTitle>
                {students.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStudent(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Student ID *</Label>
                  <Input
                    value={student.student_id}
                    onChange={(e) => handleInputChange(index, 'student_id', e.target.value)}
                    placeholder="STU001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={student.first_name}
                    onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={student.last_name}
                    onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={student.email}
                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    placeholder="john.doe@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Input
                    value={student.grade}
                    onChange={(e) => handleInputChange(index, 'grade', e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Input
                    value={student.section}
                    onChange={(e) => handleInputChange(index, 'section', e.target.value)}
                    placeholder="A"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addStudent}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Student
          </Button>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Upload CSV File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>CSV format: student_id, first_name, last_name, email, phone, grade, section, date_of_birth, parent_name, parent_email, parent_phone, address</p>
              </div>

              <div>
                <Label htmlFor="bulk-data">Or paste CSV data directly:</Label>
                <Textarea
                  id="bulk-data"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder="student_id,first_name,last_name,email,grade,section
STU001,John,Doe,john@email.com,10,A
STU002,Jane,Smith,jane@email.com,10,B"
                  rows={10}
                  className="mt-2"
                />
              </div>

              <Button onClick={processBulkData} disabled={!bulkData}>
                Process CSV Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
};
