
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Trash2, CalendarDays, GraduationCap, Wand2 } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIInput } from "@/components/ui/ai-input";
import { useGroqSuggestions } from "@/hooks/useGroqSuggestions";

interface AcademicEvent {
  id?: string;
  event_name: string;
  event_type: 'holiday' | 'exam' | 'event' | 'break';
  start_date: string;
  end_date: string;
  description: string;
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
  
  // Initialize with existing data or defaults
  const [academicYear, setAcademicYear] = useState({
    start_date: schoolData.academic_year_start || '',
    end_date: schoolData.academic_year_end || '',
  });

  const [termBreaks, setTermBreaks] = useState([
    { name: 'Term 1', start_date: '', end_date: '' },
    { name: 'Term 2', start_date: '', end_date: '' },
    { name: 'Term 3', start_date: '', end_date: '' },
  ]);

  const [events, setEvents] = useState<AcademicEvent[]>(
    schoolData.academicCalendar || []
  );

  const [newEvent, setNewEvent] = useState<AcademicEvent>({
    event_name: '',
    event_type: 'holiday',
    start_date: '',
    end_date: '',
    description: '',
  });

  const eventTypeColors = {
    holiday: 'bg-red-100 text-red-800',
    exam: 'bg-blue-100 text-blue-800',
    event: 'bg-green-100 text-green-800',
    break: 'bg-yellow-100 text-yellow-800',
  };

  const generateEventDescription = async (eventName: string, eventType: string) => {
    if (!eventName) return;
    
    try {
      const prompt = `Generate a brief, professional description for this academic event: "${eventName}" of type "${eventType}". Keep it under 50 words and make it relevant for a school calendar.`;
      const suggestions = await getSuggestions(prompt, { eventName, eventType }, 'event_description');
      if (suggestions.length > 0) {
        setNewEvent(prev => ({ ...prev, description: suggestions[0] }));
      }
    } catch (error) {
      console.log('Failed to generate description:', error);
    }
  };

  const addEvent = () => {
    if (!newEvent.event_name.trim() || !newEvent.start_date || !newEvent.end_date) {
      toast({
        title: "Error",
        description: "Please fill in event name, start date, and end date",
        variant: "destructive",
      });
      return;
    }

    setEvents([...events, { ...newEvent, id: Date.now().toString() }]);
    setNewEvent({
      event_name: '',
      event_type: 'holiday',
      start_date: '',
      end_date: '',
      description: '',
    });
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleAutoFill = async () => {
    try {
      const prompt = `Generate 8-10 common academic calendar events for a school year including holidays, exams, cultural events, sports day etc. Format as JSON array with fields: event_name, event_type (holiday/exam/event/break), description`;
      const suggestions = await getSuggestions(prompt, {}, 'events');
      
      if (suggestions.length > 0) {
        const generatedEvents = suggestions.map((eventName: string, index: number) => ({
          id: `generated-${index}`,
          event_name: eventName,
          event_type: 'event' as const,
          start_date: '',
          end_date: '',
          description: `School ${eventName} - please set dates`,
        }));
        setEvents([...events, ...generatedEvents]);
        
        toast({
          title: "✨ Auto-filled successfully!",
          description: `Added ${suggestions.length} AI-generated events. Please set the dates.`,
          className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
        });
      }
    } catch (error) {
      console.log('Auto-fill failed:', error);
    }
  };

  const saveAcademicCalendar = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare all events including term breaks
      const allEvents = [
        ...events,
        ...termBreaks
          .filter(term => term.start_date && term.end_date)
          .map(term => ({
            event_name: `${term.name} Break`,
            event_type: 'break' as const,
            start_date: term.start_date,
            end_date: term.end_date,
            description: `Academic ${term.name} break period`,
            school_id: schoolId,
          }))
      ];

      if (allEvents.length > 0) {
        const { error } = await (supabase as any)
          .from('academic_calendar')
          .upsert(allEvents.map(event => ({
            ...event,
            school_id: schoolId,
          })));

        if (error) throw error;
      }

      const calendarData = {
        academicCalendar: events,
        academic_year_start: academicYear.start_date,
        academic_year_end: academicYear.end_date,
        term_breaks: termBreaks,
      };

      onStepComplete(calendarData);
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
        <p className="text-gray-600">Configure your school's academic year, terms, and important events</p>
      </div>

      {/* Academic Year */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Academic Year Period
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Academic Year Start</Label>
            <Input
              id="start_date"
              type="date"
              value={academicYear.start_date}
              onChange={(e) => setAcademicYear(prev => ({ ...prev, start_date: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="end_date">Academic Year End</Label>
            <Input
              id="end_date"
              type="date"
              value={academicYear.end_date}
              onChange={(e) => setAcademicYear(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Term Breaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Term Break Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {termBreaks.map((term, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-700">{term.name}</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm text-gray-600">Start</Label>
                    <Input
                      type="date"
                      value={term.start_date}
                      onChange={(e) => {
                        const updated = [...termBreaks];
                        updated[index].start_date = e.target.value;
                        setTermBreaks(updated);
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">End</Label>
                    <Input
                      type="date"
                      value={term.end_date}
                      onChange={(e) => {
                        const updated = [...termBreaks];
                        updated[index].end_date = e.target.value;
                        setTermBreaks(updated);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Event */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Add Academic Events
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={handleAutoFill}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-200"
            >
              <Wand2 className="h-4 w-4 text-indigo-600" />
              AI Autofill Events
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Event Name</Label>
              <AIInput
                value={newEvent.event_name}
                onChange={(value) => {
                  setNewEvent(prev => ({ ...prev, event_name: value }));
                  if (value) {
                    generateEventDescription(value, newEvent.event_type);
                  }
                }}
                placeholder="e.g., Sports Day"
                suggestionType="events"
                context={{ eventType: newEvent.event_type }}
              />
            </div>
            <div>
              <Label>Event Type</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={newEvent.event_type}
                onChange={(e) => setNewEvent(prev => ({ ...prev, event_type: e.target.value as any }))}
              >
                <option value="holiday">Holiday</option>
                <option value="exam">Exam</option>
                <option value="event">Event</option>
                <option value="break">Break</option>
              </select>
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
              <Label>End Date</Label>
              <Input
                type="date"
                value={newEvent.end_date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>Description (AI Generated)</Label>
            <Textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="AI will generate this when you enter event name"
              className="bg-blue-50"
            />
          </div>
          <Button onClick={addEvent} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </CardContent>
      </Card>

      {/* Events List */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configured Events ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={eventTypeColors[event.event_type]}>
                      {event.event_type}
                    </Badge>
                    <div>
                      <h4 className="font-semibold">{event.event_name}</h4>
                      <p className="text-sm text-gray-600">
                        {event.start_date} to {event.end_date}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-500">{event.description}</p>
                      )}
                    </div>
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
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          ← Previous
        </Button>
        <Button onClick={saveAcademicCalendar}>
          Next: Infrastructure Setup →
        </Button>
      </div>
    </div>
  );
};
