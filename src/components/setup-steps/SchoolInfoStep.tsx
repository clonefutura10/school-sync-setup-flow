import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BaseStepProps } from '@/types/setup';
import { GraduationCap, MapPin, Mail, Phone, User, Calendar, Eye, Wand2 } from "lucide-react";

const SAMPLE_SCHOOL_DATA = {
  name: 'Springfield Elementary School',
  address: '742 Evergreen Terrace, Springfield, IL 62701',
  phone: '+1-555-0100',
  email: 'info@springfield-elementary.edu',
  principal_name: 'Dr. Sarah Johnson',
  academic_year: '2024-2025',
  number_of_terms: 3,
  working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as string[],
  school_vision: 'To provide excellence in education and foster lifelong learning in a nurturing environment that prepares students for success in the 21st century.',
  school_type: 'Public',
  academic_year_start: '2024-08-15',
  academic_year_end: '2025-06-15',
  timezone: 'America/Chicago'
};

export const SchoolInfoStep: React.FC<BaseStepProps> = ({
  onNext,
  onStepComplete
}) => {
  const [schoolData, setSchoolData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    principal_name: '',
    academic_year: '',
    number_of_terms: 3,
    working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as string[],
    school_vision: '',
    school_type: 'Public',
    academic_year_start: '',
    academic_year_end: '',
    timezone: 'UTC'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number | string[]) => {
    console.log(`Updating field ${field} with value:`, value);
    setSchoolData(prev => ({ ...prev, [field]: value }));
  };

  const toggleWorkingDay = (day: string) => {
    setSchoolData(prev => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...prev.working_days, day]
    }));
  };

  const handleAutoFill = () => {
    setSchoolData(SAMPLE_SCHOOL_DATA);
    toast({
      title: "✨ Auto-filled successfully!",
      description: "Sample school data has been loaded into the form.",
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const handleSubmit = async () => {
    console.log('Starting school data submission:', schoolData);
    
    if (!schoolData.name.trim()) {
      toast({
        title: "❌ Validation Error",
        description: "School name is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare school data for database
      const schoolInsertData = {
        name: schoolData.name.trim(),
        address: schoolData.address.trim() || null,
        phone: schoolData.phone.trim() || null,
        email: schoolData.email.trim() || null,
        principal_name: schoolData.principal_name.trim() || null,
        academic_year: schoolData.academic_year.trim() || null,
        number_of_terms: schoolData.number_of_terms,
        working_days: schoolData.working_days,
        school_vision: schoolData.school_vision.trim() || null,
        school_type: schoolData.school_type,
        academic_year_start: schoolData.academic_year_start || null,
        academic_year_end: schoolData.academic_year_end || null,
        timezone: schoolData.timezone
      };

      console.log('Inserting school data:', schoolInsertData);

      const { data: insertedSchool, error: insertError } = await supabase
        .from('schools')
        .insert([schoolInsertData])
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Failed to save school information: ${insertError.message}`);
      }

      if (!insertedSchool) {
        throw new Error('No school data returned after insert');
      }

      console.log('School created successfully:', insertedSchool);

      toast({
        title: "✅ Success!",
        description: "School information saved successfully!",
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      // Pass both school data and ID to next step
      const completeSchoolData = { 
        ...schoolData, 
        schoolId: insertedSchool.id 
      };
      
      onStepComplete(completeSchoolData);
      onNext();

    } catch (error) {
      console.error('Error saving school information:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save school information. Please try again.",
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
          <div className="text-center space-y-2">
            <GraduationCap className="h-12 w-12 text-blue-600 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-800">School Information</h2>
            <p className="text-gray-600">Enter your school's basic details to get started</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
        >
          <Wand2 className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-700">Auto Fill Sample Data</span>
        </Button>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-800">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                School Name *
              </Label>
              <Input
                value={schoolData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter school name"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Principal Name
              </Label>
              <Input
                value={schoolData.principal_name}
                onChange={(e) => handleInputChange('principal_name', e.target.value)}
                placeholder="Enter principal's name"
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Textarea
              value={schoolData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter school address"
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                value={schoolData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                value={schoolData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Academic Year
              </Label>
              <Input
                value={schoolData.academic_year}
                onChange={(e) => handleInputChange('academic_year', e.target.value)}
                placeholder="e.g., 2024-2025"
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Number of Terms</Label>
              <Input
                type="number"
                value={schoolData.number_of_terms}
                onChange={(e) => handleInputChange('number_of_terms', parseInt(e.target.value) || 3)}
                min="2"
                max="4"
                className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">School Type</Label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:border-teal-500 focus:ring-teal-500"
                value={schoolData.school_type}
                onChange={(e) => handleInputChange('school_type', e.target.value)}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Charter">Charter</option>
                <option value="International">International</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              School Vision/Mission
            </Label>
            <Textarea
              value={schoolData.school_vision}
              onChange={(e) => handleInputChange('school_vision', e.target.value)}
              placeholder="Enter your school's vision or mission statement"
              className="border-gray-300 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Working Days</Label>
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <Button
                  key={day}
                  type="button"
                  variant={schoolData.working_days.includes(day) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleWorkingDay(day)}
                  className="transition-all duration-200"
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Academic Year Start</Label>
              <Input
                type="date"
                value={schoolData.academic_year_start}
                onChange={(e) => handleInputChange('academic_year_start', e.target.value)}
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Academic Year End</Label>
              <Input
                type="date"
                value={schoolData.academic_year_end}
                onChange={(e) => handleInputChange('academic_year_end', e.target.value)}
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6 border-t">
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
            'Save & Continue →'
          )}
        </Button>
      </div>
    </div>
  );
};
