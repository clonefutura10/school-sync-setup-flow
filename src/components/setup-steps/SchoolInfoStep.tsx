import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BaseStepProps } from '@/types/setup';
import { GraduationCap, School, User, Mail, Phone, MapPin, Calendar, Users, Target, Clock } from "lucide-react";

export const SchoolInfoStep: React.FC<BaseStepProps> = ({
  onNext,
  onStepComplete,
  schoolData: existingSchoolData
}) => {
  const [formData, setFormData] = useState({
    name: existingSchoolData?.name || '',
    address: existingSchoolData?.address || '',
    phone: existingSchoolData?.phone || '',
    email: existingSchoolData?.email || '',
    principal_name: existingSchoolData?.principal_name || '',
    school_type: existingSchoolData?.school_type || 'Public',
    academic_year: existingSchoolData?.academic_year || '',
    academic_year_start: existingSchoolData?.academic_year_start || '',
    academic_year_end: existingSchoolData?.academic_year_end || '',
    number_of_terms: existingSchoolData?.number_of_terms || 3,
    working_days: existingSchoolData?.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    school_vision: existingSchoolData?.school_vision || '',
    timezone: existingSchoolData?.timezone || 'UTC'
  });
  
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkingDaysChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      working_days: checked 
        ? [...prev.working_days, day]
        : prev.working_days.filter(d => d !== day)
    }));
  };

  const validateAndSave = async () => {
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate submission');
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "❌ Validation Error",
        description: "School name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    
    try {
      console.log('Creating school with data:', formData);
      
      // Insert school data and let Supabase generate the UUID
      const { data: schoolData, error } = await supabase
        .from('schools')
        .insert([{
          name: formData.name.trim(),
          address: formData.address.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          principal_name: formData.principal_name.trim() || null,
          school_type: formData.school_type,
          academic_year: formData.academic_year.trim() || null,
          academic_year_start: formData.academic_year_start || null,
          academic_year_end: formData.academic_year_end || null,
          number_of_terms: formData.number_of_terms,
          working_days: formData.working_days,
          school_vision: formData.school_vision.trim() || null,
          timezone: formData.timezone
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to create school: ${error.message}`);
      }

      const schoolId = schoolData.id;
      console.log('School created successfully with ID:', schoolId);

      toast({
        title: "✅ School Information Saved!",
        description: `${formData.name} has been successfully registered.`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      // Pass the data to parent component
      onStepComplete({ 
        schoolId: schoolId,
        ...formData 
      });
      
      // Move to next step
      onNext();

    } catch (error) {
      console.error('Error saving school:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save school information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <GraduationCap className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-800">School Information</h2>
        <p className="text-gray-600">Let's start by setting up your school's basic information</p>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-800">School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <School className="h-4 w-4" />
                School Name *
              </Label>
              <Input
                value={formData.name}
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
                value={formData.principal_name}
                onChange={(e) => handleInputChange('principal_name', e.target.value)}
                placeholder="Enter principal's name"
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="school@example.com"
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter school address"
              className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <School className="h-4 w-4" />
              School Type
            </Label>
            <select
              value={formData.school_type}
              onChange={(e) => handleInputChange('school_type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-red-500"
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Charter">Charter</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Academic Year
              </Label>
              <Input
                value={formData.academic_year}
                onChange={(e) => handleInputChange('academic_year', e.target.value)}
                placeholder="e.g., 2023-2024"
                className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Academic Year Start
              </Label>
              <Input
                type="date"
                value={formData.academic_year_start}
                onChange={(e) => handleInputChange('academic_year_start', e.target.value)}
                className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Academic Year End
              </Label>
              <Input
                type="date"
                value={formData.academic_year_end}
                onChange={(e) => handleInputChange('academic_year_end', e.target.value)}
                className="border-gray-300 focus:border-rose-500 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Terms
              </Label>
              <Input
                type="number"
                value={formData.number_of_terms}
                onChange={(e) => handleInputChange('number_of_terms', parseInt(e.target.value))}
                placeholder="Enter number of terms"
                className="border-gray-300 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Working Days
            </Label>
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    id={day}
                    checked={formData.working_days.includes(day)}
                    onChange={(e) => handleWorkingDaysChange(day, e.target.checked)}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <Label htmlFor={day} className="text-gray-600">{day}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              School Vision
            </Label>
            <Input
              value={formData.school_vision}
              onChange={(e) => handleInputChange('school_vision', e.target.value)}
              placeholder="Enter school vision"
              className="border-gray-300 focus:border-lime-500 focus:ring-lime-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timezone
            </Label>
            <Input
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              placeholder="Enter timezone"
              className="border-gray-300 focus:border-zinc-500 focus:ring-zinc-500"
            />
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button 
              onClick={validateAndSave}
              disabled={loading || isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting up school...
                </div>
              ) : (
                'Sign Up & Continue →'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
