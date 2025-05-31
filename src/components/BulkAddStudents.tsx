
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Upload, FileText, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGroqSuggestions } from "@/hooks/useGroqSuggestions";
import { StudentData } from '@/types/setup';

interface BulkAddStudentsProps {
  onBulkAdd: (students: StudentData[]) => void;
  onClose: () => void;
}

export const BulkAddStudents: React.FC<BulkAddStudentsProps> = ({ onBulkAdd, onClose }) => {
  const [bulkText, setBulkText] = useState('');
  const [parsedStudents, setParsedStudents] = useState<StudentData[]>([]);
  const { toast } = useToast();
  const { getSuggestions } = useGroqSuggestions();

  const generateSampleData = async () => {
    try {
      const prompt = `Generate 10 sample student records for a school. Each line should contain: FirstName LastName, Grade, Section, StudentID, DateOfBirth(YYYY-MM-DD), ParentName, ParentEmail, ParentPhone, Address. Separate each field with commas. Make realistic Indian names and data.`;
      const suggestions = await getSuggestions(prompt, {}, 'student_data');
      
      if (suggestions.length > 0) {
        setBulkText(suggestions.join('\n'));
        toast({
          title: "✨ Sample data generated!",
          description: "AI-generated sample student data is ready for preview.",
        });
      }
    } catch (error) {
      console.log('Failed to generate sample data:', error);
      // Fallback sample data
      const sampleData = [
        "Arjun Sharma, 10, A, STU001, 2008-05-15, Rajesh Sharma, rajesh.sharma@email.com, 9876543210, 123 Main Street Delhi",
        "Priya Patel, 9, B, STU002, 2009-03-22, Amit Patel, amit.patel@email.com, 9876543211, 456 Park Avenue Mumbai",
        "Rohan Kumar, 11, A, STU003, 2007-07-10, Suresh Kumar, suresh.kumar@email.com, 9876543212, 789 Garden Road Bangalore"
      ];
      setBulkText(sampleData.join('\n'));
      toast({
        title: "✨ Sample data loaded!",
        description: "Sample student data is ready for preview.",
      });
    }
  };

  const parseStudentData = () => {
    if (!bulkText.trim()) {
      toast({
        title: "❌ No Data",
        description: "Please enter student data or generate sample data first.",
        variant: "destructive",
      });
      return;
    }

    const lines = bulkText.trim().split('\n').filter(line => line.trim());
    const students: StudentData[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map(part => part.trim());
      
      if (parts.length < 9) {
        errors.push(`Line ${index + 1}: Insufficient data (need 9 fields)`);
        return;
      }

      const [fullName, grade, section, studentId, dateOfBirth, parentName, parentEmail, parentPhone, address] = parts;
      const [firstName, ...lastNameParts] = fullName.split(' ');
      const lastName = lastNameParts.join(' ') || 'Student';

      students.push({
        first_name: firstName,
        last_name: lastName,
        student_id: studentId,
        grade,
        section,
        date_of_birth: dateOfBirth,
        parent_name: parentName,
        parent_email: parentEmail,
        parent_phone: parentPhone,
        address,
        parent_contact: parentPhone,
        assigned_class_id: null,
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

    if (students.length > 0) {
      setParsedStudents(students);
      toast({
        title: "✅ Data Parsed",
        description: `Successfully parsed ${students.length} student records.`,
      });
    }
  };

  const handleBulkAdd = () => {
    if (parsedStudents.length === 0) {
      toast({
        title: "❌ No Students",
        description: "Please parse student data first.",
        variant: "destructive",
      });
      return;
    }

    onBulkAdd(parsedStudents);
    toast({
      title: "✅ Students Added",
      description: `${parsedStudents.length} students have been added successfully!`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Bulk Add Students</h3>
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
              Enter student data with each student on a new line. Format: 
              <strong> FirstName LastName, Grade, Section, StudentID, DateOfBirth(YYYY-MM-DD), ParentName, ParentEmail, ParentPhone, Address</strong>
            </p>
            
            <div className="flex gap-2">
              <Button onClick={generateSampleData} variant="outline" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Generate AI Sample Data
              </Button>
              <Button onClick={parseStudentData} variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Parse Data
              </Button>
            </div>

            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Paste student data here or click 'Generate AI Sample Data' to get started..."
              className="min-h-40"
            />
          </div>
        </CardContent>
      </Card>

      {parsedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Students ({parsedStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {parsedStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{student.grade}-{student.section}</Badge>
                    <span className="font-medium">{student.first_name} {student.last_name}</span>
                    <span className="text-sm text-gray-500">({student.student_id})</span>
                  </div>
                  <span className="text-xs text-gray-400">{student.parent_name}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleBulkAdd} className="w-full mt-4">
              Add All {parsedStudents.length} Students
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
