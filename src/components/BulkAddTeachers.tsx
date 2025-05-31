
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Upload, FileText, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGroqSuggestions } from "@/hooks/useGroqSuggestions";

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

interface BulkAddTeachersProps {
  onBulkAdd: (teachers: TeacherData[]) => void;
  onClose: () => void;
}

export const BulkAddTeachers: React.FC<BulkAddTeachersProps> = ({ onBulkAdd, onClose }) => {
  const [bulkText, setBulkText] = useState('');
  const [parsedTeachers, setParsedTeachers] = useState<TeacherData[]>([]);
  const { toast } = useToast();
  const { getSuggestions } = useGroqSuggestions();

  const generateSampleData = async () => {
    try {
      const prompt = `Generate 8 sample teacher records for a school. Each line should contain: FirstName LastName, TeacherID, Email, Phone, Department, Qualification, ExperienceYears, Subjects(comma-separated), MaxPeriodsPerDay, IsClassTeacher(true/false). Separate each field with | symbol. Make realistic Indian names and data for different subjects like Math, Science, English, Hindi, Social Studies, etc.`;
      const suggestions = await getSuggestions(prompt, {}, 'teacher_data');
      
      if (suggestions.length > 0) {
        setBulkText(suggestions.join('\n'));
        toast({
          title: "✨ Sample data generated!",
          description: "AI-generated sample teacher data is ready for preview.",
        });
      }
    } catch (error) {
      console.log('Failed to generate sample data:', error);
      // Fallback sample data
      const sampleData = [
        "Priya Sharma | TCH001 | priya.sharma@school.edu | 9876543210 | Science | M.Sc. Physics | 5 | Physics,Chemistry | 6 | true",
        "Rajesh Kumar | TCH002 | rajesh.kumar@school.edu | 9876543211 | Mathematics | M.A. Mathematics | 8 | Mathematics,Statistics | 7 | false",
        "Sunita Patel | TCH003 | sunita.patel@school.edu | 9876543212 | Languages | M.A. English | 6 | English,Hindi | 6 | true"
      ];
      setBulkText(sampleData.join('\n'));
      toast({
        title: "✨ Sample data loaded!",
        description: "Sample teacher data is ready for preview.",
      });
    }
  };

  const parseTeacherData = () => {
    if (!bulkText.trim()) {
      toast({
        title: "❌ No Data",
        description: "Please enter teacher data or generate sample data first.",
        variant: "destructive",
      });
      return;
    }

    const lines = bulkText.trim().split('\n').filter(line => line.trim());
    const teachers: TeacherData[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split('|').map(part => part.trim());
      
      if (parts.length < 10) {
        errors.push(`Line ${index + 1}: Insufficient data (need 10 fields)`);
        return;
      }

      const [fullName, teacherId, email, phone, department, qualification, experienceYears, subjects, maxPeriodsPerDay, isClassTeacher] = parts;
      const [firstName, ...lastNameParts] = fullName.split(' ');
      const lastName = lastNameParts.join(' ') || 'Teacher';

      teachers.push({
        first_name: firstName,
        last_name: lastName,
        teacher_id: teacherId,
        email,
        phone,
        department,
        qualification,
        experience_years: parseInt(experienceYears) || 0,
        subjects: subjects.split(',').map(s => s.trim()).filter(s => s),
        max_periods_per_day: parseInt(maxPeriodsPerDay) || 6,
        is_class_teacher: isClassTeacher.toLowerCase() === 'true',
      });
    });

    if (errors.length > 0) {
      toast({
        title: "⚠️ Parsing Errors",
        description: `${errors.length} errors found. Check console for details.`,
        variant: "destructive",
      });
      console.log('Parsing errors:', errors);
    }

    if (teachers.length > 0) {
      setParsedTeachers(teachers);
      toast({
        title: "✅ Data Parsed",
        description: `Successfully parsed ${teachers.length} teacher records.`,
      });
    }
  };

  const handleBulkAdd = () => {
    if (parsedTeachers.length === 0) {
      toast({
        title: "❌ No Teachers",
        description: "Please parse teacher data first.",
        variant: "destructive",
      });
      return;
    }

    onBulkAdd(parsedTeachers);
    toast({
      title: "✅ Teachers Added",
      description: `${parsedTeachers.length} teachers have been added successfully!`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Bulk Add Teachers</h3>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Input Format
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter teacher data with each teacher on a new line. Format: 
              <strong> FirstName LastName | TeacherID | Email | Phone | Department | Qualification | ExperienceYears | Subjects(comma-separated) | MaxPeriodsPerDay | IsClassTeacher(true/false)</strong>
            </p>
            
            <div className="flex gap-2">
              <Button onClick={generateSampleData} variant="outline" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Generate AI Sample Data
              </Button>
              <Button onClick={parseTeacherData} variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Parse Data
              </Button>
            </div>

            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Paste teacher data here or click 'Generate AI Sample Data' to get started..."
              className="min-h-40"
            />
          </div>
        </CardContent>
      </Card>

      {parsedTeachers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Teachers ({parsedTeachers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {parsedTeachers.map((teacher, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{teacher.department}</Badge>
                    <span className="font-medium">{teacher.first_name} {teacher.last_name}</span>
                    <span className="text-sm text-gray-500">({teacher.teacher_id})</span>
                    {teacher.is_class_teacher && <Badge variant="secondary">Class Teacher</Badge>}
                  </div>
                  <div className="text-xs text-gray-400">
                    {teacher.subjects.slice(0, 2).join(', ')}
                    {teacher.subjects.length > 2 && '...'}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleBulkAdd} className="w-full mt-4">
              Add All {parsedTeachers.length} Teachers
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
