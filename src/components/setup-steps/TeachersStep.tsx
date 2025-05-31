
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, Trash2, Upload } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIInput } from "@/components/ui/ai-input";
import { BulkAddTeachers } from "@/components/BulkAddTeachers";

interface TeacherData {
  first_name: string;
  last_name: string;
  teacher_id: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  experience_years: number;
  subjects: string[];
  max_periods_per_day: number;
  is_class_teacher: boolean;
}

export const TeachersStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId,
  schoolData
}) => {
  const [teachers, setTeachers] = useState<TeacherData[]>(
    schoolData?.teachers || []
  );
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [newTeacher, setNewTeacher] = useState<TeacherData>({
    first_name: '',
    last_name: '',
    teacher_id: '',
    email: '',
    phone: '',
    department: '',
    qualification: '',
    experience_years: 0,
    subjects: [],
    max_periods_per_day: 6,
    is_class_teacher: false,
  });
  const [newSubject, setNewSubject] = useState('');
  const { toast } = useToast();

  const addSubject = () => {
    if (newSubject && !newTeacher.subjects.includes(newSubject)) {
      setNewTeacher(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setNewTeacher(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const addTeacher = () => {
    if (!newTeacher.first_name || !newTeacher.last_name || !newTeacher.teacher_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in first name, last name, and teacher ID",
        variant: "destructive",
      });
      return;
    }

    setTeachers([...teachers, { ...newTeacher }]);
    setNewTeacher({
      first_name: '',
      last_name: '',
      teacher_id: '',
      email: '',
      phone: '',
      department: '',
      qualification: '',
      experience_years: 0,
      subjects: [],
      max_periods_per_day: 6,
      is_class_teacher: false,
    });
  };

  const removeTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const handleBulkAdd = (bulkTeachers: TeacherData[]) => {
    setTeachers([...teachers, ...bulkTeachers]);
    setShowBulkAdd(false);
  };

  const saveTeachers = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (teachers.length > 0) {
        const { error } = await supabase
          .from('teachers')
          .upsert(teachers.map(teacher => ({
            ...teacher,
            school_id: schoolId,
          })));

        if (error) throw error;
      }

      onStepComplete({ teachers });
      toast({
        title: "Success",
        description: `${teachers.length} teachers saved successfully!`,
      });
      onNext();

    } catch (error) {
      console.error('Error saving teachers:', error);
      toast({
        title: "Error",
        description: "Failed to save teachers",
        variant: "destructive",
      });
    }
  };

  if (showBulkAdd) {
    return (
      <BulkAddTeachers
        onBulkAdd={handleBulkAdd}
        onClose={() => setShowBulkAdd(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <UserCheck className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Teacher Information</h2>
        <p className="text-gray-600">Add teacher details, qualifications, and subject expertise</p>
      </div>

      {/* Bulk Add Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowBulkAdd(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Bulk Add Teachers
        </Button>
      </div>

      {/* Add Individual Teacher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add Teacher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>First Name *</Label>
              <AIInput
                value={newTeacher.first_name}
                onChange={(value) => setNewTeacher(prev => ({ ...prev, first_name: value }))}
                placeholder="Enter first name"
                suggestionType="teacher_data"
                context={{ field: 'first_name' }}
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <AIInput
                value={newTeacher.last_name}
                onChange={(value) => setNewTeacher(prev => ({ ...prev, last_name: value }))}
                placeholder="Enter last name"
                suggestionType="teacher_data"
                context={{ field: 'last_name' }}
              />
            </div>
            <div>
              <Label>Teacher ID *</Label>
              <Input
                value={newTeacher.teacher_id}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, teacher_id: e.target.value }))}
                placeholder="e.g., TCH001"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                placeholder="teacher@school.edu"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label>Department</Label>
              <AIInput
                value={newTeacher.department}
                onChange={(value) => setNewTeacher(prev => ({ ...prev, department: value }))}
                placeholder="e.g., Science"
                suggestionType="teacher_data"
                context={{ field: 'department' }}
              />
            </div>
            <div>
              <Label>Qualification</Label>
              <AIInput
                value={newTeacher.qualification}
                onChange={(value) => setNewTeacher(prev => ({ ...prev, qualification: value }))}
                placeholder="e.g., M.Sc. Physics"
                suggestionType="teacher_data"
                context={{ field: 'qualification' }}
              />
            </div>
            <div>
              <Label>Experience (Years)</Label>
              <Input
                type="number"
                min="0"
                value={newTeacher.experience_years}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label>Max Periods/Day</Label>
              <Input
                type="number"
                min="1"
                max="8"
                value={newTeacher.max_periods_per_day}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, max_periods_per_day: parseInt(e.target.value) || 6 }))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Subjects</Label>
            <div className="flex gap-2">
              <AIInput
                value={newSubject}
                onChange={(value) => setNewSubject(value)}
                placeholder="Add subject"
                suggestionType="teacher_data"
                context={{ field: 'subjects' }}
                className="flex-1"
              />
              <Button type="button" onClick={addSubject} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {newTeacher.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newTeacher.subjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeSubject(subject)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="classTeacher"
              checked={newTeacher.is_class_teacher}
              onChange={(e) => setNewTeacher(prev => ({ ...prev, is_class_teacher: e.target.checked }))}
            />
            <Label htmlFor="classTeacher">Class Teacher</Label>
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
            <CardTitle>Added Teachers ({teachers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map((teacher, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{teacher.first_name} {teacher.last_name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTeacher(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{teacher.teacher_id}</Badge>
                    {teacher.department && <Badge>{teacher.department}</Badge>}
                    {teacher.is_class_teacher && <Badge variant="secondary">Class Teacher</Badge>}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Qualification: {teacher.qualification}</div>
                    <div>Experience: {teacher.experience_years} years</div>
                    <div>Max Periods: {teacher.max_periods_per_day}/day</div>
                  </div>

                  {teacher.subjects.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-700">Subjects:</div>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject, subIndex) => (
                          <Badge key={subIndex} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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
