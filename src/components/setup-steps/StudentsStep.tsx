
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Wand2, Plus, Trash2, Users, UserCheck, Download, FileText } from "lucide-react";

interface StudentsStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onStepComplete: (data: any) => void;
  schoolId: string | null;
  currentStep: number;
  totalSteps: number;
  schoolData: any;
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
    toast.success("Auto-filled with sample student data!", {
      position: "top-right",
      duration: 3000,
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
      toast.success(`Imported ${studentData.length} students from CSV data.`, {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to parse CSV data. Please check the format.", {
        position: "top-right",
        duration: 3000,
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
      toast.error("School ID is required. Please complete the school information step first.", {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const validStudents = students.filter(student => 
        student.student_id && student.first_name && student.last_name
      );

      if (validStudents.length === 0) {
        toast.error("Please add at least one student with ID, first name, and last name.", {
          position: "top-right",
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      // First, delete existing students for this school to avoid duplicates
      await supabase
        .from('students')
        .delete()
        .eq('school_id', schoolId);

      const studentsWithSchoolId = validStudents.map(student => ({
        ...student,
        school_id: schoolId
      }));

      const { error } = await supabase
        .from('students')
        .insert(studentsWithSchoolId);

      if (error) throw error;

      toast.success(`${validStudents.length} students added successfully!`, {
        position: "top-right",
        duration: 3000,
      });

      onStepComplete({ students: validStudents });
      onNext();
    } catch (error) {
      console.error('Error saving students:', error);
      toast.error("Failed to save students. Please try again.", {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-500 p-3 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
              <p className="text-gray-600">Add your students individually or in bulk</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAutoFill}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Wand2 className="h-5 w-5" />
            Auto Fill Sample Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="manual" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3">
            <UserCheck className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid gap-6">
            {students.map((student, index) => (
              <Card key={index} className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <div className="bg-blue-500 p-2 rounded-full">
                        <Users className="h-4 w-4 text-white" />
                      </div>
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
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Student ID *</Label>
                      <Input
                        value={student.student_id}
                        onChange={(e) => handleInputChange(index, 'student_id', e.target.value)}
                        placeholder="STU001"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">First Name *</Label>
                      <Input
                        value={student.first_name}
                        onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                        placeholder="John"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Last Name *</Label>
                      <Input
                        value={student.last_name}
                        onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                        placeholder="Doe"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        type="email"
                        value={student.email}
                        onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                        placeholder="john.doe@email.com"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Grade</Label>
                      <Input
                        value={student.grade}
                        onChange={(e) => handleInputChange(index, 'grade', e.target.value)}
                        placeholder="10"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Section</Label>
                      <Input
                        value={student.section}
                        onChange={(e) => handleInputChange(index, 'section', e.target.value)}
                        placeholder="A"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addStudent}
                  className="w-full h-16 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="h-6 w-6 mr-2" />
                  Add Another Student
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card className="shadow-lg border-0 bg-white rounded-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <div className="bg-purple-500 p-2 rounded-full">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                Bulk Upload Students
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload" className="text-sm font-medium text-gray-700">Upload CSV File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV Format
                    </h4>
                    <p className="text-sm text-gray-600">
                      student_id, first_name, last_name, email, phone, grade, section, date_of_birth, parent_name, parent_email, parent_phone, address
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="bulk-data" className="text-sm font-medium text-gray-700">Or paste CSV data directly:</Label>
                  <Textarea
                    id="bulk-data"
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    placeholder="student_id,first_name,last_name,email,grade,section
STU001,John,Doe,john@email.com,10,A
STU002,Jane,Smith,jane@email.com,10,B"
                    rows={10}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              <Button 
                onClick={processBulkData} 
                disabled={!bulkData}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Process CSV Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400"
        >
          ← Previous Step
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg shadow-lg"
        >
          {loading ? 'Saving Students...' : 'Continue to Teachers →'}
        </Button>
      </div>
    </div>
  );
};
