
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2 } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_TIME_SLOTS = [
  { name: "Period 1", start_time: "08:00", end_time: "08:45", type: "regular" },
  { name: "Period 2", start_time: "08:45", end_time: "09:30", type: "regular" },
  { name: "Break", start_time: "09:30", end_time: "09:45", type: "break" },
  { name: "Period 3", start_time: "09:45", end_time: "10:30", type: "regular" },
  { name: "Period 4", start_time: "10:30", end_time: "11:15", type: "regular" },
  { name: "Period 5", start_time: "11:15", end_time: "12:00", type: "regular" },
  { name: "Lunch Break", start_time: "12:00", end_time: "12:45", type: "lunch" },
  { name: "Period 6", start_time: "12:45", end_time: "13:30", type: "regular" },
  { name: "Period 7", start_time: "13:30", end_time: "14:15", type: "regular" }
];

export const TimeSlotsStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [timeSlots, setTimeSlots] = useState([{
    name: '',
    start_time: '',
    end_time: '',
    type: 'regular'
  }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedTimeSlots = [...timeSlots];
    updatedTimeSlots[index] = { ...updatedTimeSlots[index], [field]: value };
    setTimeSlots(updatedTimeSlots);
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, {
      name: '',
      start_time: '',
      end_time: '',
      type: 'regular'
    }]);
  };

  const removeTimeSlot = (index: number) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  const handleAutoFill = () => {
    setTimeSlots(SAMPLE_TIME_SLOTS);
    toast({
      title: "Auto-filled",
      description: "Time slot data has been auto-filled with sample data.",
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
      const validTimeSlots = timeSlots.filter(slot => 
        slot.name && slot.start_time && slot.end_time
      );

      if (validTimeSlots.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one time slot with name, start time, and end time.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // First, delete existing time slots for this school to prevent duplicates
      const { error: deleteError } = await supabase
        .from('time_slots')
        .delete()
        .eq('school_id', schoolId);

      if (deleteError) {
        console.error('Error deleting existing time slots:', deleteError);
      }

      const timeSlotsWithSchoolId = validTimeSlots.map(slot => ({
        ...slot,
        school_id: schoolId
      }));

      const { error } = await supabase
        .from('time_slots')
        .insert(timeSlotsWithSchoolId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${validTimeSlots.length} time slots added successfully!`,
      });

      onStepComplete({ timeSlots: validTimeSlots });
      onNext();
    } catch (error) {
      console.error('Error saving time slots:', error);
      toast({
        title: "Error",
        description: "Failed to save time slots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Add Time Slots</h2>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-200"
        >
          <Wand2 className="h-4 w-4 text-indigo-600" />
          Auto Fill Sample Data
        </Button>
      </div>

      <div className="space-y-4">
        {timeSlots.map((slot, index) => (
          <Card key={index} className="shadow-sm border-l-4 border-l-indigo-400 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-indigo-700 font-medium">Time Slot {index + 1}</CardTitle>
              {timeSlots.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTimeSlot(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Name *</Label>
                <Input
                  value={slot.name}
                  onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  placeholder="Period 1"
                  className="border-gray-300 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Start Time *</Label>
                <Input
                  type="time"
                  value={slot.start_time}
                  onChange={(e) => handleInputChange(index, 'start_time', e.target.value)}
                  className="border-gray-300 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">End Time *</Label>
                <Input
                  type="time"
                  value={slot.end_time}
                  onChange={(e) => handleInputChange(index, 'end_time', e.target.value)}
                  className="border-gray-300 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Type</Label>
                <select
                  value={slot.type}
                  onChange={(e) => handleInputChange(index, 'type', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                >
                  <option value="regular">Regular</option>
                  <option value="break">Break</option>
                  <option value="lunch">Lunch</option>
                </select>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addTimeSlot}
          className="w-full flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Another Time Slot
        </Button>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="px-8">
          Previous
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="px-8 bg-indigo-600 hover:bg-indigo-700"
        >
          {loading ? 'Saving...' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
};
