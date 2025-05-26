import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2 } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_CLASSES = [
  { name: "Grade 9 Section A", grade: "9", section: "A", room_number: "101", capacity: 30 },
  { name: "Grade 9 Section B", grade: "9", section: "B", room_number: "102", capacity: 30 },
  { name: "Grade 10 Section A", grade: "10", section: "A", room_number: "201", capacity: 28 },
  { name: "Grade 10 Section B", grade: "10", section: "B", room_number: "202", capacity: 28 },
  { name: "Grade 11 Science", grade: "11", section: "Science", room_number: "301", capacity: 25 },
  { name: "Grade 12 Science", grade: "12", section: "Science", room_number: "302", capacity: 25 }
];

export const ClassesStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [classes, setClasses] = useState([{
    name: '',
    grade: '',
    section: '',
    room_number: '',
    capacity: 30
  }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string | number) => {
    const updatedClasses = [...classes];
    updatedClasses[index] = { ...updatedClasses[index], [field]: value };
    setClasses(updatedClasses);
  };

  const addClass = () => {
    setClasses([...classes, {
      name: '',
      grade: '',
      section: '',
      room_number: '',
      capacity: 30
    }]);
  };

  const removeClass = (index: number) => {
    if (classes.length > 1) {
      setClasses(classes.filter((_, i) => i !== index));
    }
  };

  const handleAutoFill = () => {
    setClasses(SAMPLE_CLASSES);
    toast({
      title: "Auto-filled",
      description: "Class data has been auto-filled with sample data.",
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
      const validClasses = classes.filter(cls => 
        cls.name && cls.grade
      );

      if (validClasses.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one class with name and grade.",
          variant: "destructive",
        });
        return;
      }

      const classesWithSchoolId = validClasses.map(cls => ({
        ...cls,
        school_id: schoolId
      }));

      const { error } = await supabase
        .from('classes')
        .insert(classesWithSchoolId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${validClasses.length} classes added successfully!`,
      });

      onStepComplete({ classes: validClasses });
      onNext();
    } catch (error) {
      console.error('Error saving classes:', error);
      toast({
        title: "Error",
        description: "Failed to save classes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add Classes</h2>
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
        {classes.map((cls, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Class {index + 1}</CardTitle>
              {classes.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeClass(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Class Name *</Label>
                <Input
                  value={cls.name}
                  onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  placeholder="Grade 9 Section A"
                />
              </div>
              <div className="space-y-2">
                <Label>Grade *</Label>
                <Input
                  value={cls.grade}
                  onChange={(e) => handleInputChange(index, 'grade', e.target.value)}
                  placeholder="9"
                />
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Input
                  value={cls.section}
                  onChange={(e) => handleInputChange(index, 'section', e.target.value)}
                  placeholder="A"
                />
              </div>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  value={cls.room_number}
                  onChange={(e) => handleInputChange(index, 'room_number', e.target.value)}
                  placeholder="101"
                />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={cls.capacity}
                  onChange={(e) => handleInputChange(index, 'capacity', parseInt(e.target.value) || 30)}
                  placeholder="30"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addClass}
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Another Class
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
