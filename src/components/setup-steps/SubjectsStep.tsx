
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2, BookOpen, Award, Clock, FlaskConical } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_SUBJECTS = [
  { 
    name: "Mathematics", 
    code: "MATH", 
    department: "Science", 
    description: "Algebra, Calculus, Statistics",
    credits: 4,
    lab_required: false,
    periods_per_week: 6
  },
  { 
    name: "Physics", 
    code: "PHYS", 
    department: "Science", 
    description: "Mechanics, Thermodynamics, Electromagnetism",
    credits: 4,
    lab_required: true,
    periods_per_week: 5
  },
  { 
    name: "Chemistry", 
    code: "CHEM", 
    department: "Science", 
    description: "Organic, Inorganic, Physical Chemistry",
    credits: 4,
    lab_required: true,
    periods_per_week: 5
  },
  { 
    name: "English Literature", 
    code: "ENG", 
    department: "Languages", 
    description: "Poetry, Prose, Drama, Grammar",
    credits: 3,
    lab_required: false,
    periods_per_week: 5
  },
  { 
    name: "History", 
    code: "HIST", 
    department: "Social Studies", 
    description: "World History, Ancient Civilizations",
    credits: 3,
    lab_required: false,
    periods_per_week: 4
  },
  { 
    name: "Computer Science", 
    code: "CS", 
    department: "Technology", 
    description: "Programming, Data Structures, Algorithms",
    credits: 4,
    lab_required: true,
    periods_per_week: 5
  },
  { 
    name: "Physical Education", 
    code: "PE", 
    department: "Physical Education", 
    description: "Sports, Fitness, Health Education",
    credits: 2,
    lab_required: false,
    periods_per_week: 3
  }
];

export const SubjectsStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [subjects, setSubjects] = useState([{
    name: '',
    code: '',
    department: '',
    description: '',
    credits: 1,
    lab_required: false,
    periods_per_week: 5
  }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string | number | boolean) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setSubjects(updatedSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, {
      name: '',
      code: '',
      department: '',
      description: '',
      credits: 1,
      lab_required: false,
      periods_per_week: 5
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
      title: "✨ Auto-filled successfully!",
      description: "Sample subject data has been loaded into the form.",
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const handleSubmit = async () => {
    if (!schoolId) {
      toast({
        title: "❌ Missing Information",
        description: "School ID is required. Please complete the school information step first.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-96",
      });
      return;
    }

    setLoading(true);
    try {
      const validSubjects = subjects.filter(subject => 
        subject.name.trim() && subject.code.trim()
      );

      if (validSubjects.length === 0) {
        toast({
          title: "❌ Validation Error",
          description: "Please add at least one subject with name and code.",
          variant: "destructive",
          className: "fixed top-4 right-4 w-96",
        });
        setLoading(false);
        return;
      }

      // First, delete existing subjects for this school to prevent duplicates
      const { error: deleteError } = await supabase
        .from('subjects')
        .delete()
        .eq('school_id', schoolId);

      if (deleteError) {
        console.error('Error deleting existing subjects:', deleteError);
      }

      const subjectsWithSchoolId = validSubjects.map(subject => ({
        ...subject,
        name: subject.name.trim(),
        code: subject.code.trim(),
        department: subject.department.trim() || null,
        description: subject.description.trim() || null,
        school_id: schoolId
      }));

      const { error: insertError } = await supabase
        .from('subjects')
        .insert(subjectsWithSchoolId);

      if (insertError) {
        console.error('Detailed insert error:', insertError);
        throw new Error(`Failed to save subjects: ${insertError.message}`);
      }

      toast({
        title: "✅ Success!",
        description: `${validSubjects.length} subjects added successfully!`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      onStepComplete({ subjects: validSubjects });
      onNext();
    } catch (error) {
      console.error('Error saving subjects:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save subjects. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-96",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Add Subjects</h2>
          <p className="text-gray-600">Configure subjects with academic details and requirements</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100 transition-all duration-300"
        >
          <Wand2 className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-700">Auto Fill Sample Data</span>
        </Button>
      </div>

      <div className="space-y-6">
        {subjects.map((subject, index) => (
          <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Subject {index + 1}
              </CardTitle>
              {subjects.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubject(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Subject Name *</Label>
                  <Input
                    value={subject.name}
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    placeholder="e.g., Mathematics"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Subject Code *</Label>
                  <Input
                    value={subject.code}
                    onChange={(e) => handleInputChange(index, 'code', e.target.value)}
                    placeholder="e.g., MATH"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Department</Label>
                  <Input
                    value={subject.department}
                    onChange={(e) => handleInputChange(index, 'department', e.target.value)}
                    placeholder="e.g., Science"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Description</Label>
                  <Input
                    value={subject.description}
                    onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                    placeholder="e.g., Algebra, Calculus, Statistics"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                  />
                </div>
              </div>

              {/* Academic Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Credits
                  </Label>
                  <Input
                    type="number"
                    value={subject.credits}
                    onChange={(e) => handleInputChange(index, 'credits', parseInt(e.target.value) || 1)}
                    placeholder="4"
                    min="1"
                    max="10"
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500">Academic weight/marks</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Periods Per Week
                  </Label>
                  <Input
                    type="number"
                    value={subject.periods_per_week}
                    onChange={(e) => handleInputChange(index, 'periods_per_week', parseInt(e.target.value) || 5)}
                    placeholder="5"
                    min="1"
                    max="15"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500">Classes per week</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <FlaskConical className="h-4 w-4" />
                    Laboratory Requirement
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`lab-required-${index}`}
                      checked={subject.lab_required}
                      onCheckedChange={(checked) => handleInputChange(index, 'lab_required', checked)}
                    />
                    <Label htmlFor={`lab-required-${index}`} className="text-sm">
                      Lab sessions required
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">Needs laboratory/practical sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addSubject}
          className="w-full flex items-center gap-3 py-4 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
        >
          <Plus className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-600">Add Another Subject</span>
        </Button>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="px-8 py-3 border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ← Previous
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 disabled:opacity-50"
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
