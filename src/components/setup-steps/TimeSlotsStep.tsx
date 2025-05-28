
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Plus, Trash2 } from "lucide-react";
import { BaseStepProps } from '@/types/setup';

const SAMPLE_TIME_SLOTS = [
  { name: "Period 1", start_time: "08:00", end_time: "08:45", type: "regular", slot_type: "regular", is_break: false },
  { name: "Period 2", start_time: "08:45", end_time: "09:30", type: "regular", slot_type: "regular", is_break: false },
  { name: "Break", start_time: "09:30", end_time: "09:45", type: "break", slot_type: "break", is_break: true },
  { name: "Period 3", start_time: "09:45", end_time: "10:30", type: "regular", slot_type: "regular", is_break: false },
  { name: "Period 4", start_time: "10:30", end_time: "11:15", type: "regular", slot_type: "regular", is_break: false },
  { name: "Period 5", start_time: "11:15", end_time: "12:00", type: "regular", slot_type: "regular", is_break: false },
  { name: "Lunch Break", start_time: "12:00", end_time: "12:45", type: "lunch", slot_type: "lunch", is_break: true },
  { name: "Period 6", start_time: "12:45", end_time: "13:30", type: "regular", slot_type: "regular", is_break: false },
  { name: "Period 7", start_time: "13:30", end_time: "14:15", type: "regular", slot_type: "regular", is_break: false }
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
    type: 'regular',
    slot_type: 'regular',
    is_break: false
  }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (index: number, field: string, value: string | boolean) => {
    const updatedTimeSlots = [...timeSlots];
    updatedTimeSlots[index] = { ...updatedTimeSlots[index], [field]: value };
    
    // Auto-sync type and slot_type, and set is_break appropriately
    if (field === 'type') {
      updatedTimeSlots[index].slot_type = value as string;
      updatedTimeSlots[index].is_break = value === 'break' || value === 'lunch';
    }
    
    setTimeSlots(updatedTimeSlots);
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, {
      name: '',
      start_time: '',
      end_time: '',
      type: 'regular',
      slot_type: 'regular',
      is_break: false
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
      title: "✨ Auto-filled successfully!",
      description: "Time slot data has been auto-filled with sample data.",
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const handleSubmit = async () => {
    if (!schoolId) {
      toast({
        title: "❌ Missing Information",
        description: "School ID is required. Please complete the school information step first.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting time slot data submission:', timeSlots);
    setLoading(true);
    
    try {
      const validTimeSlots = timeSlots.filter(slot => 
        slot.name.trim() && slot.start_time && slot.end_time
      );

      if (validTimeSlots.length === 0) {
        toast({
          title: "❌ Validation Error",
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
        name: slot.name.trim(),
        start_time: slot.start_time,
        end_time: slot.end_time,
        type: slot.type,
        slot_type: slot.slot_type,
        is_break: slot.is_break,
        school_id: schoolId
      }));

      console.log('Inserting time slots:', timeSlotsWithSchoolId);

      const { error: insertError } = await supabase
        .from('time_slots')
        .insert(timeSlotsWithSchoolId);

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Failed to save time slots: ${insertError.message}`);
      }

      toast({
        title: "✅ Success!",
        description: `${validTimeSlots.length} time slots added successfully!`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      onStepComplete({ timeSlots: validTimeSlots });
      onNext();

    } catch (error) {
      console.error('Error saving time slots:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save time slots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Add Time Slots</h2>
          <p className="text-gray-600">Configure daily schedule periods and break times</p>
        </div>
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
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Is Break</Label>
                <div className="flex items-center h-10">
                  <Checkbox
                    id={`is-break-${index}`}
                    checked={slot.is_break}
                    onCheckedChange={(checked) => handleInputChange(index, 'is_break', checked as boolean)}
                  />
                  <Label htmlFor={`is-break-${index}`} className="ml-2 text-sm">
                    Break Time
                  </Label>
                </div>
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
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            'Next Step →'
          )}
        </Button>
      </div>
    </div>
  );
};
