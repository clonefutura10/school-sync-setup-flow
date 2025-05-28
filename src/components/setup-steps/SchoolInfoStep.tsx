
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, GraduationCap, User, Phone, Mail, Calendar, Globe, BookOpen, Building } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_SCHOOLS = [
  {
    name: "Greenfield Elementary School",
    address: "123 Education Lane, Springfield, IL 62701",
    phone: "(555) 123-4567",
    email: "info@greenfield.edu",
    principal_name: "Dr. Sarah Johnson",
    academic_year: "2024-25",
    timezone: "America/Chicago",
    number_of_terms: 2,
    working_days: 180,
    school_vision: "Nurturing young minds to become confident, creative, and caring global citizens",
    school_type: "Primary"
  },
  {
    name: "Riverside High School",
    address: "456 Learning Boulevard, Austin, TX 78701",
    phone: "(555) 987-6543",
    email: "admin@riverside.edu",
    principal_name: "Mr. Michael Davis",
    academic_year: "2024-25",
    timezone: "America/Chicago",
    number_of_terms: 3,
    working_days: 220,
    school_vision: "Empowering students to excel academically, socially, and personally in a dynamic world",
    school_type: "Secondary"
  },
  {
    name: "Oakwood International School",
    address: "789 Knowledge Street, Seattle, WA 98101",
    phone: "(555) 456-7890",
    email: "contact@oakwood.edu",
    principal_name: "Ms. Emily Chen",
    academic_year: "2024-25",
    timezone: "America/Los_Angeles",
    number_of_terms: 2,
    working_days: 200,
    school_vision: "Creating innovative learners and leaders for tomorrow's challenges",
    school_type: "Higher Secondary"
  }
];

const ACADEMIC_YEARS = ["2024-25", "2025-26", "2026-27", "2027-28"];
const SCHOOL_TYPES = ["Primary", "Secondary", "Higher Secondary", "All"];

export const SchoolInfoStep: React.FC<BaseStepProps> = ({
  onNext,
  onStepComplete,
  schoolId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    principal_name: '',
    academic_year: '2024-25',
    timezone: 'UTC',
    number_of_terms: 2,
    working_days: 220,
    school_vision: '',
    school_type: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'number_of_terms' || name === 'working_days' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTermsChange = (value: string) => {
    setFormData(prev => ({ ...prev, number_of_terms: parseInt(value) }));
  };

  const handleAutoFill = () => {
    const randomSchool = SAMPLE_SCHOOLS[Math.floor(Math.random() * SAMPLE_SCHOOLS.length)];
    setFormData(randomSchool);
    
    toast({
      title: "✨ Auto-filled successfully!",
      description: "Sample school data has been loaded into the form.",
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "School name is required.",
        variant: "destructive",
      });
      return false;
    }
    if (formData.working_days < 150 || formData.working_days > 250) {
      toast({
        title: "Validation Error",
        description: "Working days should be between 150 and 250.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (schoolId) {
        // Update existing school
        const { error } = await supabase
          .from('schools')
          .update(formData)
          .eq('id', schoolId);

        if (error) throw error;
        toast({
          title: "Success",
          description: "School information updated successfully!",
        });
        onStepComplete({ ...formData, schoolId });
      } else {
        // Create new school
        const { data, error } = await supabase
          .from('schools')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "School created successfully!",
        });
        onStepComplete({ ...formData, schoolId: data.id });
      }

      onNext();
    } catch (error) {
      console.error('Error saving school:', error);
      toast({
        title: "Error",
        description: "Failed to save school information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">School Information</h2>
            <p className="text-gray-600">Set up your school's comprehensive details</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 border-0"
        >
          <Wand2 className="h-4 w-4" />
          Auto Fill Sample Data
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 font-medium">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                School Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter school name"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="principal_name" className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-purple-600" />
                Principal Name
              </Label>
              <Input
                id="principal_name"
                name="principal_name"
                value={formData.principal_name}
                onChange={handleInputChange}
                placeholder="Enter principal name"
                className="border-purple-200 focus:border-purple-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium">
                <Building className="h-4 w-4 text-green-600" />
                School Type
              </Label>
              <Select value={formData.school_type} onValueChange={(value) => handleSelectChange('school_type', value)}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select school type" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="flex items-center gap-2 font-medium">
                <Globe className="h-4 w-4 text-indigo-600" />
                Timezone
              </Label>
              <Input
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                placeholder="UTC"
                className="border-indigo-200 focus:border-indigo-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Configuration Card */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              Academic Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-green-600" />
                Academic Year
              </Label>
              <Select value={formData.academic_year} onValueChange={(value) => handleSelectChange('academic_year', value)}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="working_days" className="flex items-center gap-2 font-medium">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Working Days (per year)
              </Label>
              <Input
                id="working_days"
                name="working_days"
                type="number"
                value={formData.working_days}
                onChange={handleInputChange}
                min="150"
                max="250"
                placeholder="220"
                className="border-blue-200 focus:border-blue-400"
              />
              <p className="text-xs text-gray-500">Typically 180-220 days</p>
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-green-600" />
                Number of Terms
              </Label>
              <RadioGroup 
                value={formData.number_of_terms.toString()} 
                onValueChange={handleTermsChange}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="terms-2" />
                  <Label htmlFor="terms-2">2 Terms (Semester System)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="terms-3" />
                  <Label htmlFor="terms-3">3 Terms (Trimester System)</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-orange-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 font-medium">
                <Phone className="h-4 w-4 text-green-600" />
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="border-green-200 focus:border-green-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4 text-blue-600" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="school@example.com"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="font-medium">School Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete school address"
                rows={3}
                className="border-orange-200 focus:border-orange-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vision & Mission Card */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
              School Vision & Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="school_vision" className="font-medium">School Vision/Mission Statement</Label>
              <Textarea
                id="school_vision"
                name="school_vision"
                value={formData.school_vision}
                onChange={handleInputChange}
                placeholder="Describe your school's vision, mission, and core values..."
                rows={4}
                className="border-purple-200 focus:border-purple-400"
              />
              <p className="text-xs text-gray-500">This will help define your school's educational philosophy and goals</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg"
          >
            {loading ? 'Saving...' : 'Continue to Next Step'}
          </Button>
        </div>
      </form>
    </div>
  );
};
