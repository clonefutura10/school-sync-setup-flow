
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Users, FileText, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BulkUploadProps {
  type: 'students' | 'teachers';
  onBulkAdd: (items: any[]) => void;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({ type, onBulkAdd }) => {
  const [bulkData, setBulkData] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateBulkData = async () => {
    setLoading(true);
    try {
      const prompt = type === 'students' 
        ? "Generate 10 sample students with realistic names, grades, sections, dates of birth, and parent information. Return as JSON array with properties: first_name, last_name, student_id, grade, section, date_of_birth, parent_name, parent_email, parent_phone, address."
        : "Generate 10 sample teachers with realistic names, departments, subjects, qualifications, and experience. Return as JSON array with properties: first_name, last_name, teacher_id, email, phone, department, subjects (array), qualification, experience_years, max_hours_per_day, max_periods_per_day.";

      const { data, error } = await supabase.functions.invoke('groq-suggestions', {
        body: {
          prompt,
          type: `bulk_${type}`
        }
      });

      if (error) throw error;
      
      const formattedData = Array.isArray(data.suggestions) 
        ? JSON.stringify(data.suggestions, null, 2)
        : data.suggestions;
      
      setBulkData(formattedData);
      toast({
        title: "✨ AI Generated Data!",
        description: `Sample ${type} data has been generated. Review and modify as needed.`,
      });
    } catch (error) {
      console.error('Error generating bulk data:', error);
      toast({
        title: "Error",
        description: `Failed to generate ${type} data`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processBulkData = () => {
    try {
      const items = JSON.parse(bulkData);
      if (Array.isArray(items)) {
        onBulkAdd(items);
        setBulkData('');
        toast({
          title: "✅ Success!",
          description: `${items.length} ${type} added successfully!`,
        });
      } else {
        throw new Error('Data must be an array');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format. Please check your data.",
        variant: "destructive",
      });
    }
  };

  const sampleFormat = type === 'students' ? `[
  {
    "first_name": "John",
    "last_name": "Doe",
    "student_id": "STU001",
    "grade": "Grade 5",
    "section": "A",
    "date_of_birth": "2014-05-15",
    "parent_name": "Jane Doe",
    "parent_email": "jane.doe@email.com",
    "parent_phone": "+1-555-0123",
    "address": "123 Main St, City"
  }
]` : `[
  {
    "first_name": "Jane",
    "last_name": "Smith",
    "teacher_id": "T001",
    "email": "jane.smith@school.edu",
    "phone": "+1-555-0124",
    "department": "Mathematics",
    "subjects": ["Math", "Statistics"],
    "qualification": "M.Ed in Mathematics",
    "experience_years": 5,
    "max_hours_per_day": 6,
    "max_periods_per_day": 7
  }
]`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Bulk Add {type.charAt(0).toUpperCase() + type.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={generateBulkData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            {loading ? 'Generating...' : 'AI Generate Sample Data'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setBulkData(sampleFormat)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Show Format
          </Button>
        </div>
        
        <div>
          <Label>JSON Data (paste or generate)</Label>
          <Textarea
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            placeholder={`Paste JSON array of ${type} or click "AI Generate Sample Data"`}
            className="min-h-32 font-mono text-sm"
          />
        </div>
        
        <Button 
          onClick={processBulkData} 
          disabled={!bulkData.trim()}
          className="w-full"
        >
          <Users className="h-4 w-4 mr-2" />
          Add {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </CardContent>
    </Card>
  );
};
