
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Trash2, CalendarDays, Clock, GraduationCap, Wand2 } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const eventTypeColors = {
    holiday: 'bg-red-100 text-red-800',
    exam: 'bg-blue-100 text-blue-800',
    event: 'bg-green-100 text-green-800',
    break: 'bg-yellow-100 text-yellow-800',
  };

  const getEventSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('groq-suggestions', {
        body: {
          prompt: `Suggest 5 common academic events for a school year. Return as JSON array of objects with properties: event_name, event_type (holiday/exam/event/break), description. Examples: Sports Day, Annual Function, Mid-term Exams, etc.`,
          type: 'academic_events'
        }
      });

      if (error) throw error;
      return data.suggestions;
    } catch (error) {
      console.error('Error getting event suggestions:', error);
      return [
        { event_name: "Sports Day", event_type: "event", description: "Annual inter-house sports competition" },
        { event_name: "Mid-term Exams", event_type: "exam", description: "Half-yearly assessment examinations" },
        { event_name: "Annual Function", event_type: "event", description: "School's annual cultural program" },
        { event_name: "Winter Break", event_type: "holiday", description: "Winter vacation period" },
        { event_name: "Science Fair", event_type: "event", description: "Student science project exhibition" }
      ];
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAutoFill = async () => {
    const suggestions = await getEventSuggestions();
    if (suggestions && Array.isArray(suggestions)) {
      setEvents(suggestions.map((event: any, index: number) => ({
        id: `suggested-${index}`,
        event_name: event.event_name || '',
        event_type: event.event_type || 'event',
        start_date: '',
        end_date: '',
        description: event.description || ''
      })));
      
      toast({
        title: "✨ AI Events Generated!",
        description: "Relevant academic events have been suggested. Add dates to complete.",
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });
    }
  };

  const generateEventDescription = async (eventName: string, eventType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('groq-suggestions', {
        body: {
          prompt: `Generate a brief description for the academic event "${eventName}" of type "${eventType}". Return only the description text, maximum 50 words.`,
          type: 'event_description'
        }
      });

      if (error) throw error;
      return data.suggestions.text || data.suggestions;
    } catch (error) {
      console.error('Error generating description:', error);
      return `${eventName} - ${eventType} event`;
    }
  };

  const addEvent = async () => {
    if (!newEvent.event_name || !newEvent.start_date || !newEvent.end_date) {
      toast({
        title: "Error",
        description: "Please fill in event name, start date, and end date",
        variant: "destructive",
      });
      return;
    }

    // Auto-generate description if empty
    let description = newEvent.description;
    if (!description.trim()) {
      description = await generateEventDescription(newEvent.event_name, newEvent.event_type);
    }

    const eventToAdd = { 
      ...newEvent, 
      description,
      id: Date.now().toString() 
    };

    setEvents([eventToAdd]);
    setNewEvent({
      event_name: '',
      event_type: 'holiday',
      start_date: '',
      end_date: '',
      description: '',
    });

    toast({
      title: "✅ Event Added!",
      description: "Academic event has been added successfully.",
    });
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
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

        if (error) console.error('Database error (using fallback):', error);
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
      // Continue anyway with local storage
      const calendarData = {
        academicCalendar: events,
        academic_year_start: academicYear.start_date,
        academic_year_end: academicYear.end_date,
        term_breaks: termBreaks,
      };

      onStepComplete(calendarData);
      toast({
        title: "Success",
        description: "Academic calendar saved locally!",
      });
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-center space-y-2">
          <CalendarDays className="h-12 w-12 text-blue-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Academic Calendar Setup</h2>
          <p className="text-gray-600">Configure your school's academic year, terms, and important events</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          disabled={loadingSuggestions}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:from-indigo-100 hover:to-purple-100"
        >
          <Wand2 className="h-5 w-5 text-indigo-600" />
          <span className="font-medium text-indigo-700">
            {loadingSuggestions ? 'Generating...' : 'AI Auto Fill Events'}
          </span>
        </Button>
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
            <Clock className="h-5 w-5 text-purple-600" />
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
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add Academic Event
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Event Name</Label>
              <Input
                value={newEvent.event_name}
                onChange={(e) => setNewEvent(prev => ({ ...prev, event_name: e.target.value }))}
                placeholder="e.g., Sports Day"
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
            <Label>Description (AI will generate if empty)</Label>
            <Textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Leave empty for AI-generated description"
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
            <CardTitle>Configured Events</CardTitle>
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
