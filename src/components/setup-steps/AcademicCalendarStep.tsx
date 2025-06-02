
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BaseStepProps } from '@/types/setup';
import { CalendarDays, Plus, Trash2, Calendar, FileText, Clock, MapPin } from "lucide-react";

interface AcademicEvent {
  id: string;
  event_name: string;
  event_type: string;
  start_date: string;
  end_date: string;
  description: string;
}

const EVENT_TYPES = [
  'Term Start',
  'Term End', 
  'Holiday',
  'Examination',
  'Event',
  'Workshop',
  'Meeting',
  'Other'
];

// UUID validation function
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const AcademicCalendarStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Create a new empty event
  const createNewEvent = (): AcademicEvent => ({
    id: Math.random().toString(36).substr(2, 9),
    event_name: '',
    event_type: 'Event',
    start_date: '',
    end_date: '',
    description: ''
  });

  const addEvent = () => {
    setAcademicEvents(prev => [...prev, createNewEvent()]);
  };

  const updateEvent = (id: string, field: keyof AcademicEvent, value: string) => {
    setAcademicEvents(prev => prev.map(event => 
      event.id === id ? { ...event, [field]: value } : event
    ));
  };

  const removeEvent = (id: string) => {
    setAcademicEvents(prev => prev.filter(event => event.id !== id));
  };

  const validateAndSave = async () => {
    // Validate school ID is a proper UUID
    if (!schoolId || !isValidUUID(schoolId)) {
      toast({
        title: "❌ Invalid School ID", 
        description: "School ID is missing or invalid. Please complete Step 1 first.",
        variant: "destructive",
      });
      return;
    }

    // Filter out events with empty names
    const validEvents = academicEvents.filter(event => event.event_name.trim());
    
    if (validEvents.length === 0) {
      toast({
        title: "⚠️ No Events",
        description: "Please add at least one academic event to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare events for database insertion
      const eventsForDB = validEvents.map(event => ({
        school_id: schoolId, // This is now guaranteed to be a valid UUID
        event_name: event.event_name.trim(),
        event_type: event.event_type,
        start_date: event.start_date,
        end_date: event.end_date || event.start_date,
        description: event.description.trim() || null
      }));

      console.log('Saving academic events with valid UUID school_id:', schoolId, eventsForDB);

      // Insert events into database
      const { error } = await supabase
        .from('academic_calendar')
        .insert(eventsForDB);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to save events: ${error.message}`);
      }

      toast({
        title: "✅ Success!",
        description: `${validEvents.length} academic events saved successfully.`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      // Pass data to next step
      onStepComplete({ academicCalendar: validEvents });
      onNext();

    } catch (error) {
      console.error('Error saving academic calendar:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save academic calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <CalendarDays className="h-12 w-12 text-indigo-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-800">Academic Calendar Setup</h2>
        <p className="text-gray-600">Define your school's academic events, terms, and important dates</p>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Academic Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {academicEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No academic events added yet. Click "Add Event" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {academicEvents.map((event, index) => (
                <Card key={event.id} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Event {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEvent(event.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Event Name *</Label>
                        <Input
                          value={event.event_name}
                          onChange={(e) => updateEvent(event.id, 'event_name', e.target.value)}
                          placeholder="Enter event name"
                          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Event Type *</Label>
                        <select
                          value={event.event_type}
                          onChange={(e) => updateEvent(event.id, 'event_type', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          {EVENT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Start Date *
                        </Label>
                        <Input
                          type="date"
                          value={event.start_date}
                          onChange={(e) => updateEvent(event.id, 'start_date', e.target.value)}
                          className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          End Date
                        </Label>
                        <Input
                          type="date"
                          value={event.end_date}
                          onChange={(e) => updateEvent(event.id, 'end_date', e.target.value)}
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Description
                      </Label>
                      <Input
                        value={event.description}
                        onChange={(e) => updateEvent(event.id, 'description', e.target.value)}
                        placeholder="Enter event description (optional)"
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={addEvent}
            className="w-full flex items-center gap-2 py-3 border-dashed border-2 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
          >
            <Plus className="h-5 w-5" />
            Add Academic Event
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6 border-t">
        <Button 
          onClick={onPrevious}
          variant="outline"
          className="px-6 py-2"
        >
          ← Previous: School Info
        </Button>
        
        <Button 
          onClick={validateAndSave}
          disabled={loading || academicEvents.length === 0}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            'Next: Infrastructure →'
          )}
        </Button>
      </div>
    </div>
  );
};
