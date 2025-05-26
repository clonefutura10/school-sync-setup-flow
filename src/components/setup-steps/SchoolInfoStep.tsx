
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2 } from "lucide-react";
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
    toast({
      title: "Auto-filled",
      description: "School information has been auto-filled with sample data.",
    });
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">School Information</h2>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Auto Fill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">School Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter school name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="principal_name">Principal Name</Label>
          <Input
            id="principal_name"
            name="principal_name"
            value={formData.principal_name}
            onChange={handleInputChange}
            placeholder="Enter principal name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="school@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="academic_year">Academic Year</Label>
          <Input
            id="academic_year"
            name="academic_year"
            value={formData.academic_year}
            onChange={handleInputChange}
            placeholder="2024-2025"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            placeholder="UTC"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter school address"
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Next Step'}
        </Button>
      </div>
    </form>
  );
};
