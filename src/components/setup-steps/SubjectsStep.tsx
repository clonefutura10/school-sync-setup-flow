
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2 } from "lucide-react";

interface SubjectsStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onStepComplete: (data: any) => void;
  schoolId: string | null;
}

const SAMPLE_SUBJECTS = [
  { name: "Mathematics", code: "MATH", department: "Science", description: "Algebra, Calculus, Statistics" },
  { name: "Physics", code: "PHYS", department: "Science", description: "Mechanics, Thermodynamics, Electromagnetism" },
  { name: "Chemistry", code: "CHEM", department: "Science", description: "Organic, Inorganic, Physical Chemistry" },
  { name: "English Literature", code: "ENG", department: "Languages", description: "Poetry, Prose, Drama" },
  { name: "History", code: "HIST", department: "Social Studies", description: "World History, Ancient Civilizations" },
  { name: "Physical Education", code: "PE", department: "Physical Education", description: "Sports, Fitness, Health" }
];

export const SubjectsStep: React.FC<SubjectsStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [subjects, setSubjects] = useState([{
    name: '',
    code: '',
    department: '',
    description: ''
  }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setSubjects(updatedSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, {
      name: '',
      code: '',
      department: '',
      description: ''
    }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const handleAutoFill = () => {
    setSubjects(SAMPLE_SUBJECTS);
    toast({
      title: "Auto-filled",
      description: "Subject data has been auto-filled with sample data.",
    });
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
      const validSubjects = subjects.filter(subject => 
        subject.name && subject.code
      );

      if (validSubjects.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one subject with name and code.",
          variant: "destructive",
        });
        return;
      }

      const subjectsWithSchoolId = validSubjects.map(subject => ({
        ...subject,
        school_id: schoolId
      }));

      const { error } = await supabase
        .from('subjects')
        .insert(subjectsWithSchoolId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${validSubjects.length} subjects added successfully!`,
      });

      onStepComplete({ subjects: validSubjects });
      onNext();
    } catch (error) {
      console.error('Error saving subjects:', error);
      toast({
        title: "Error",
        description: "Failed to save subjects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add Subjects</h2>
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

      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Subject {index + 1}</CardTitle>
              {subjects.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubject(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject Name *</Label>
                <Input
                  value={subject.name}
                  onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  placeholder="Mathematics"
                />
              </div>
              <div className="space-y-2">
                <Label>Subject Code *</Label>
                <Input
                  value={subject.code}
                  onChange={(e) => handleInputChange(index, 'code', e.target.value)}
                  placeholder="MATH"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={subject.department}
                  onChange={(e) => handleInputChange(index, 'department', e.target.value)}
                  placeholder="Science"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={subject.description}
                  onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                  placeholder="Algebra, Calculus, Statistics"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addSubject}
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Another Subject
        </Button>
      </div>

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
