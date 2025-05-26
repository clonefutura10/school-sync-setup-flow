
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, GraduationCap, User, Phone, Mail, Calendar, Globe } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_SCHOOLS = [
  {
    name: "Greenfield Elementary School",
    address: "123 Education Lane, Springfield, IL 62701",
    phone: "(555) 123-4567",
    email: "info@greenfield.edu",
    principal_name: "Dr. Sarah Johnson",
    academic_year: "2024-2025",
    timezone: "America/Chicago"
  },
  {
    name: "Riverside High School",
    address: "456 Learning Boulevard, Austin, TX 78701",
    phone: "(555) 987-6543",
    email: "admin@riverside.edu",
    principal_name: "Mr. Michael Davis",
    academic_year: "2024-2025",
    timezone: "America/Chicago"
  },
  {
    name: "Oakwood International School",
    address: "789 Knowledge Street, Seattle, WA 98101",
    phone: "(555) 456-7890",
    email: "contact@oakwood.edu",
    principal_name: "Ms. Emily Chen",
    academic_year: "2024-2025",
    timezone: "America/Los_Angeles"
  }
];

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
    academic_year: '2024-2025',
    timezone: 'UTC'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAutoFill = () => {
    const randomSchool = SAMPLE_SCHOOLS[Math.floor(Math.random() * SAMPLE_SCHOOLS.length)];
    setFormData(randomSchool);
    
    // Create a custom toast that appears at top-right
    const toastElement = document.createElement('div');
    toastElement.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2';
    toastElement.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        Auto-filled with sample data!
      </div>
    `;
    
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.remove();
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            <p className="text-gray-600">Set up your school's basic details</p>
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
              <Label htmlFor="academic_year" className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-green-600" />
                Academic Year
              </Label>
              <Input
                id="academic_year"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleInputChange}
                placeholder="2024-2025"
                className="border-green-200 focus:border-green-400"
              />
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

        {/* Contact Information Card */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-green-600" />
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
          </CardContent>
        </Card>

        {/* Address Card */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-orange-600" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
