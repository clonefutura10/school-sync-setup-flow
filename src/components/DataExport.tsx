
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, ExternalLink } from "lucide-react";

interface DataExportProps {
  schoolId: string;
}

export const DataExport: React.FC<DataExportProps> = ({ schoolId }) => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportSchoolData = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school ID found. Please complete the setup first.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      // Fetch all school data
      const [schoolResult, studentsResult, teachersResult, subjectsResult, classesResult, timeSlotsResult] = await Promise.all([
        supabase.from('schools').select('*').eq('id', schoolId).single(),
        supabase.from('students').select('*').eq('school_id', schoolId),
        supabase.from('teachers').select('*').eq('school_id', schoolId),
        supabase.from('subjects').select('*').eq('school_id', schoolId),
        supabase.from('classes').select('*').eq('school_id', schoolId),
        supabase.from('time_slots').select('*').eq('school_id', schoolId),
      ]);

      const schoolData = {
        school: schoolResult.data,
        students: studentsResult.data || [],
        teachers: teachersResult.data || [],
        subjects: subjectsResult.data || [],
        classes: classesResult.data || [],
        timeSlots: timeSlotsResult.data || [],
      };

      // Create download
      const dataStr = JSON.stringify(schoolData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `school-data-${schoolData.school?.name?.replace(/\s+/g, '-').toLowerCase() || 'export'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "School data has been exported successfully!",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export school data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const openScheduler = () => {
    // Store school ID for the scheduler app
    localStorage.setItem('setupSchoolId', schoolId);
    window.open('https://chrono-school-scheduler-plus.lovable.app/', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Your school setup is complete! You can now export the data or proceed directly to the scheduler.
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={exportSchoolData}
            disabled={exporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
          
          <Button 
            onClick={openScheduler}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            Open Scheduler
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          Note: The scheduler will automatically load your setup data when you open it.
        </div>
      </CardContent>
    </Card>
  );
};
