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
import { BaseStepProps } from '@/types/setup';

const SAMPLE_TEACHERS = [
  {
    teacher_id: "TCH001",
    first_name: "Dr. Maria",
    last_name: "Rodriguez",
    email: "maria.rodriguez@school.edu",
    phone: "(555) 222-0001",
    department: "Mathematics",
    subjects: ["Algebra", "Calculus", "Statistics"],
    qualification: "PhD in Mathematics",
    experience_years: 15
  },
  {
    teacher_id: "TCH002",
    first_name: "Mr. James",
    last_name: "Wilson",
    email: "james.wilson@school.edu",
    phone: "(555) 222-0002",
    department: "Science",
    subjects: ["Physics", "Chemistry"],
    qualification: "M.Sc in Physics",
    experience_years: 8
  },
  {
    teacher_id: "TCH003",
    first_name: "Ms. Sarah",
    last_name: "Thompson",
    email: "sarah.thompson@school.edu",
    phone: "(555) 222-0003",
    department: "English",
    subjects: ["English Literature", "Creative Writing"],
    qualification: "M.A in English Literature",
    experience_years: 12
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
    subjects: [] as string[],
    qualification: '',
    experience_years: 0
  }]);
  const [bulkData, setBulkData] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string | number | string[]) => {
    const updatedTeachers = [...teachers];
    updatedTeachers[index] = { ...updatedTeachers[index], [field]: value };
    setTeachers(updatedTeachers);
  };

  const handleSubjectsChange = (index: number, subjects: string) => {
    const subjectsArray = subjects.split(',').map(s => s.trim()).filter(s => s);
    handleInputChange(index, 'subjects', subjectsArray);
  };

  const addTeacher = () => {
    setTeachers([...teachers, {
      teacher_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      subjects: [],
      qualification: '',
      experience_years: 0
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
      title: "Auto-filled",
      description: "Teacher data has been auto-filled with sample data.",
    });
  };

  const processBulkData = () => {
    try {
      const lines = bulkData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const teacherData = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const teacher: any = {};
        
        headers.forEach((header, index) => {
          const key = header.toLowerCase().replace(/\s+/g, '_');
          if (key === 'subjects') {
            teacher[key] = values[index] ? values[index].split(';').map(s => s.trim()) : [];
          } else if (key === 'experience_years') {
            teacher[key] = parseInt(values[index]) || 0;
          } else {
            teacher[key] = values[index] || '';
          }
        });
        
        teacherData.push(teacher);
      }

      setTeachers(teacherData);
      setBulkData('');
      toast({
        title: "Success",
        description: `Imported ${teacherData.length} teachers from CSV data.`,
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
      const validTeachers = teachers.filter(teacher => 
        teacher.teacher_id && teacher.first_name && teacher.last_name
      );

      if (validTeachers.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one teacher with ID, first name, and last name.",
          variant: "destructive",
        });
        return;
      }

      const teachersWithSchoolId = validTeachers.map(teacher => ({
        ...teacher,
        school_id: schoolId
      }));

      const { error } = await supabase
        .from('teachers')
        .insert(teachersWithSchoolId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${validTeachers.length} teachers added successfully!`,
      });

      onStepComplete({ teachers: validTeachers });
      onNext();
    } catch (error) {
      console.error('Error saving teachers:', error);
      toast({
        title: "Error",
        description: "Failed to save teachers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add Teachers</h2>
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
          {teachers.map((teacher, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Teacher {index + 1}</CardTitle>
                {teachers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeacher(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Teacher ID *</Label>
                  <Input
                    value={teacher.teacher_id}
                    onChange={(e) => handleInputChange(index, 'teacher_id', e.target.value)}
                    placeholder="TCH001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={teacher.first_name}
                    onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={teacher.last_name}
                    onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={teacher.email}
                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    placeholder="john.doe@school.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={teacher.department}
                    onChange={(e) => handleInputChange(index, 'department', e.target.value)}
                    placeholder="Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Experience (Years)</Label>
                  <Input
                    type="number"
                    value={teacher.experience_years}
                    onChange={(e) => handleInputChange(index, 'experience_years', parseInt(e.target.value) || 0)}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Subjects (comma-separated)</Label>
                  <Input
                    value={teacher.subjects.join(', ')}
                    onChange={(e) => handleSubjectsChange(index, e.target.value)}
                    placeholder="Mathematics, Algebra, Calculus"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input
                    value={teacher.qualification}
                    onChange={(e) => handleInputChange(index, 'qualification', e.target.value)}
                    placeholder="M.Sc in Mathematics"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addTeacher}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Teacher
          </Button>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Teachers</CardTitle>
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
                <p>CSV format: teacher_id, first_name, last_name, email, phone, department, subjects, qualification, experience_years</p>
                <p>Note: Separate multiple subjects with semicolons (;)</p>
              </div>

              <div>
                <Label htmlFor="bulk-data">Or paste CSV data directly:</Label>
                <Textarea
                  id="bulk-data"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder="teacher_id,first_name,last_name,email,department,subjects,qualification,experience_years
TCH001,John,Doe,john@school.edu,Mathematics,Algebra;Calculus,M.Sc in Mathematics,5
TCH002,Jane,Smith,jane@school.edu,Science,Physics;Chemistry,PhD in Physics,8"
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
