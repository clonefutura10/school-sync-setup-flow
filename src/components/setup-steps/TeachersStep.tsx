import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck, Plus, Trash2, Upload, Users } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BulkUpload } from "../BulkUpload";
import { GroqSuggestionInput } from "../GroqSuggestionInput";

interface Teacher {
  first_name: string;
  last_name: string;
  teacher_id: string;
  email: string;
  phone: string;
  department: string;
  subjects: string[];
  qualification: string;
  qualification_details: string;
  experience_years: number;
  max_hours_per_day: number;
  max_periods_per_day: number;
  is_class_teacher: boolean;
  preferences: string;
  availability_notes: string;
}

export const TeachersStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId,
  schoolData
}) => {
  const { toast } = useToast();
  
  const [teachers, setTeachers] = useState<Teacher[]>(
    schoolData.teachers || []
  );

  const [newTeacher, setNewTeacher] = useState<Teacher>({
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
    max_hours_per_day: 8,
    max_periods_per_day: 8,
    is_class_teacher: false,
    preferences: '',
    availability_notes: '',
  });

  const handleBulkAdd = (bulkTeachers: Teacher[]) => {
    setTeachers(prevTeachers => [...prevTeachers, ...bulkTeachers]);
  };

  const addTeacher = () => {
    if (!newTeacher.first_name || !newTeacher.last_name || !newTeacher.teacher_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setTeachers(prevTeachers => [...prevTeachers, newTeacher]);
    setNewTeacher({
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
      max_hours_per_day: 8,
      max_periods_per_day: 8,
      is_class_teacher: false,
      preferences: '',
      availability_notes: '',
    });
    
    toast({
      title: "✅ Teacher Added!",
      description: "Teacher has been added successfully.",
    });
  };

  const removeTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const saveTeachers = async () => {
    try {
      if (teachers.length > 0 && schoolId) {
        const { error } = await (supabase as any)
          .from('teachers')
          .upsert(teachers.map(teacher => ({
            ...teacher,
            school_id: schoolId,
          })));

        if (error) console.error('Database error (using fallback):', error);
      }

      const teacherData = { teachers: teachers };
      onStepComplete(teacherData);
      toast({
        title: "Success",
        description: "Teachers configured successfully!",
      });
      onNext();

    } catch (error) {
      console.error('Error saving teachers:', error);
      // Continue with local storage
      onStepComplete({ teachers: teachers });
      toast({
        title: "Success",
        description: "Teachers saved locally!",
      });
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <UserCheck className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Teacher Registration</h2>
        <p className="text-gray-600">Add teaching staff to your school</p>
      </div>

      {/* Bulk Upload Component */}
      <BulkUpload type="teachers" onBulkAdd={handleBulkAdd} />

      {/* Individual Teacher Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add Individual Teacher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GroqSuggestionInput
              label="First Name"
              value={newTeacher.first_name}
              onChange={(value) => setNewTeacher(prev => ({ ...prev, first_name: value }))}
              placeholder="e.g., John"
              suggestionPrompt="Suggest realistic first names for teachers. Return as JSON array."
            />
            
            <GroqSuggestionInput
              label="Last Name"
              value={newTeacher.last_name}
              onChange={(value) => setNewTeacher(prev => ({ ...prev, last_name: value }))}
              placeholder="e.g., Doe"
              suggestionPrompt="Suggest realistic last names for teachers. Return as JSON array."
            />
            
            <div>
              <Label>Teacher ID</Label>
              <Input
                type="text"
                value={newTeacher.teacher_id}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, teacher_id: e.target.value }))}
                placeholder="e.g., T101"
              />
            </div>
            
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g., john.doe@example.com"
              />
            </div>
            
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g., +1-555-123-4567"
              />
            </div>
            
            <div>
              <Label>Department</Label>
              <Input
                type="text"
                value={newTeacher.department}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Science"
              />
            </div>
            
            <div>
              <Label>Subjects (comma-separated)</Label>
              <Input
                type="text"
                value={newTeacher.subjects.join(', ')}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, subjects: e.target.value.split(',').map(s => s.trim()) }))}
                placeholder="e.g., Math, Physics"
              />
            </div>
            
            <div>
              <Label>Qualification</Label>
              <Input
                type="text"
                value={newTeacher.qualification}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, qualification: e.target.value }))}
                placeholder="e.g., PhD"
              />
            </div>
            
            <div>
              <Label>Experience (Years)</Label>
              <Input
                type="number"
                value={newTeacher.experience_years}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 5"
              />
            </div>
            
            <div>
              <Label>Max Hours/Day</Label>
              <Input
                type="number"
                value={newTeacher.max_hours_per_day}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, max_hours_per_day: parseInt(e.target.value) || 8 }))}
                placeholder="e.g., 6"
              />
            </div>
            
            <div>
              <Label>Max Periods/Day</Label>
              <Input
                type="number"
                value={newTeacher.max_periods_per_day}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, max_periods_per_day: parseInt(e.target.value) || 8 }))}
                placeholder="e.g., 7"
              />
            </div>
            
            <div>
              <Label>Is Class Teacher</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={newTeacher.is_class_teacher ? 'true' : 'false'}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, is_class_teacher: e.target.value === 'true' }))}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Qualification Details</Label>
              <Textarea
                value={newTeacher.qualification_details}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, qualification_details: e.target.value }))}
                placeholder="e.g., Masters in Physics"
                className="min-h-16"
              />
            </div>
            
            <div>
              <Label>Preferences</Label>
              <Textarea
                value={newTeacher.preferences}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, preferences: e.target.value }))}
                placeholder="e.g., Prefers morning classes"
                className="min-h-16"
              />
            </div>
          </div>

          <div>
            <Label>Availability Notes</Label>
            <Textarea
              value={newTeacher.availability_notes}
              onChange={(e) => setNewTeacher(prev => ({ ...prev, availability_notes: e.target.value }))}
              placeholder="e.g., Available Mon-Fri"
              className="min-h-16"
            />
          </div>

          <Button onClick={addTeacher} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </CardContent>
      </Card>

      {/* Teachers List */}
      {teachers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Registered Teachers ({teachers.length})</span>
              <Badge variant="outline">
                <Users className="h-4 w-4 mr-1" />
                Total Teachers: {teachers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map((teacher, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      <h4 className="font-semibold">{teacher.first_name} {teacher.last_name}</h4>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTeacher(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Badge className="bg-blue-100 text-blue-800">
                    {teacher.department}
                  </Badge>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Email: {teacher.email}</div>
                    <div>Phone: {teacher.phone}</div>
                    <div>Subjects: {teacher.subjects.join(', ')}</div>
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
        <Button onClick={saveTeachers}>
          Next: Subjects →
        </Button>
      </div>
    </div>
  );
};
