
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, Trash2, Wand2 } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIInput } from "@/components/ui/ai-input";
import { useGroqSuggestions } from "@/hooks/useGroqSuggestions";

interface AcademicEvent {
  event_name: string;
  event_type: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface TermBreak {
  name: string;
  start_date: string;
  end_date: string;
}

export const AcademicCalendarStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId,
  schoolData
}) => {
  const { toast } = useToast();
  const { getSuggestions } = useGroqSuggestions();
  
  const [academicYear, setAcademicYear] = useState(schoolData?.academic_year || '2024-2025');
  const [academicStartDate, setAcademicStartDate] = useState(schoolData?.academic_year_start || '');
  const [academicEndDate, setAcademicEndDate] = useState(schoolData?.academic_year_end || '');
  const [numberOfTerms, setNumberOfTerms] = useState(schoolData?.number_of_terms || 3);
  
  const [termBreaks, setTermBreaks] = useState<TermBreak[]>(
    schoolData?.termBreaks || []
  );
  const [newTermBreak, setNewTermBreak] = useState<TermBreak>({
    name: '',
    start_date: '',
    end_date: ''
  });

  const [events, setEvents] = useState<AcademicEvent[]>(
    schoolData?.academicCalendar || []
  );
  const [newEvent, setNewEvent] = useState<AcademicEvent>({
    event_name: '',
    event_type: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  // Fixed event type change handler to prevent React error
  const handleEventTypeChange = async (eventType: string) => {
    // Update state safely
    setNewEvent(prev => ({ 
      ...prev, 
      event_type: eventType,
      description: prev.description // Keep existing description initially
    }));
    
    // Generate AI description when event type is selected (async operation)
    if (eventType && eventType.trim() !== '') {
      try {
        const prompt = `Generate a brief description for a school academic calendar event of type "${eventType}". Keep it under 50 words and make it relevant for school calendar planning.`;
        const suggestions = await getSuggestions(prompt, { eventType }, 'academic_events');
        
        if (suggestions && suggestions.length > 0) {
          setNewEvent(prev => ({ ...prev, description: suggestions[0] }));
        }
      } catch (error) {
        console.log('Failed to generate description:', error);
      }
    }
  };

  const addTermBreak = () => {
    if (!newTermBreak.name || !newTermBreak.start_date || !newTermBreak.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all term break fields",
        variant: "destructive",
      });
      return;
    }

    setTermBreaks([...termBreaks, { ...newTermBreak }]);
    setNewTermBreak({ name: '', start_date: '', end_date: '' });
  };

  const removeTermBreak = (index: number) => {
    setTermBreaks(termBreaks.filter((_, i) => i !== index));
  };

  const addEvent = () => {
    if (!newEvent.event_name || !newEvent.event_type || !newEvent.start_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in event name, type, and start date",
        variant: "destructive",
      });
      return;
    }

    setEvents([...events, { ...newEvent }]);
    setNewEvent({
      event_name: '',
      event_type: '',
      description: '',
      start_date: '',
      end_date: ''
    });
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const saveAcademicCalendar = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is required. Please complete Step 1 first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save events to academic_calendar table
      if (events.length > 0) {
        const { error: eventsError } = await supabase
          .from('academic_calendar')
          .upsert(events.map(event => ({
            ...event,
            school_id: schoolId,
          })));

        if (eventsError) throw eventsError;
      }

      const calendarData = {
        academicYear,
        academicStartDate,
        academicEndDate,
        numberOfTerms,
        termBreaks,
        academicCalendar: events
      };

      onStepComplete({ 
        academicCalendar: events,
        termBreaks,
        academic_year: academicYear,
        academic_year_start: academicStartDate,
        academic_year_end: academicEndDate,
        number_of_terms: numberOfTerms
      });

      toast({
        title: "Success",
        description: "Academic calendar configured successfully!",
      });
      
      onNext();

    } catch (error) {
      console.error('Error saving academic calendar:', error);
      toast({
        title: "Error",
        description: "Failed to save academic calendar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <CalendarDays className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Academic Calendar Setup</h2>
        <p className="text-gray-600">Configure your school's academic year and important events</p>
      </div>

      {/* Basic Academic Year Info */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Year Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Academic Year</Label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2024-2025"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={academicStartDate}
                onChange={(e) => setAcademicStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={academicEndDate}
                onChange={(e) => setAcademicEndDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Number of Terms</Label>
            <Input
              type="number"
              min="2"
              max="4"
              value={numberOfTerms}
              onChange={(e) => setNumberOfTerms(parseInt(e.target.value) || 3)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Term Break Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Term Break Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Break Name</Label>
              <AIInput
                value={newTermBreak.name}
                onChange={(value) => setNewTermBreak(prev => ({ ...prev, name: value }))}
                placeholder="e.g., Summer Break"
                suggestionType="academic_events"
                context={{ type: 'term_break' }}
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newTermBreak.start_date}
                onChange={(e) => setNewTermBreak(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={newTermBreak.end_date}
                onChange={(e) => setNewTermBreak(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={addTermBreak} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Term Break
          </Button>

          {termBreaks.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Configured Term Breaks:</h4>
              {termBreaks.map((termBreak, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{termBreak.name}</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {termBreak.start_date} to {termBreak.end_date}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTermBreak(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Events */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Event Name</Label>
              <AIInput
                value={newEvent.event_name}
                onChange={(value) => setNewEvent(prev => ({ ...prev, event_name: value }))}
                placeholder="e.g., Annual Sports Day"
                suggestionType="academic_events"
                context={{ type: 'school_event' }}
              />
            </div>
            <div>
              <Label>Event Type</Label>
              <AIInput
                value={newEvent.event_type}
                onChange={handleEventTypeChange}
                placeholder="e.g., Sports, Cultural, Academic"
                suggestionType="academic_events"
                context={{ type: 'event_type' }}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description (auto-generated based on type)"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newEvent.start_date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>End Date (Optional)</Label>
              <Input
                type="date"
                value={newEvent.end_date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={addEvent} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>

          {events.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Configured Events:</h4>
              {events.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.event_name}</span>
                      <Badge variant="outline">{event.event_type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {event.start_date} {event.end_date && `to ${event.end_date}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeEvent(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          ← Previous
        </Button>
        <Button onClick={saveAcademicCalendar}>
          Next: Infrastructure →
        </Button>
      </div>
    </div>
  );
};
