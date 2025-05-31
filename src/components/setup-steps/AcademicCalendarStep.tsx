
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
    if (!eventName.trim()) return;
    
    try {
      const prompt = `Generate a brief, professional description for this academic event: "${eventName}" of type "${eventType}". Keep it under 50 words and make it relevant for a school calendar.`;
      const suggestions = await getSuggestions(prompt, { eventName, eventType }, 'event_description');
      if (suggestions.length > 0 && typeof suggestions[0] === 'string') {
        setNewEvent(prev => ({ ...prev, description: suggestions[0] }));
      }
    } catch (error) {
      console.log('Failed to generate description:', error);
    }
  };

  const addEvent = () => {
    // Validate required fields
    const errors = [];
    if (!newEvent.event_name.trim()) errors.push('Event name is required');
    if (!newEvent.start_date) errors.push('Start date is required');
    if (!newEvent.end_date) errors.push('End date is required');
    
    if (errors.length > 0) {
      toast({
        title: "❌ Validation Error",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    // Validate date logic
    if (new Date(newEvent.start_date) > new Date(newEvent.end_date)) {
      toast({
        title: "❌ Date Error",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    const eventToAdd = {
      ...newEvent,
      id: Date.now().toString(),
      event_name: newEvent.event_name.trim(),
      description: newEvent.description.trim() || `${newEvent.event_name} - ${newEvent.event_type}`
    };

    setEvents([...events, eventToAdd]);
    
    // Reset form
    setNewEvent({
      event_name: '',
      event_type: 'holiday',
      start_date: '',
      end_date: '',
      description: '',
    });

    toast({
      title: "✅ Event Added",
      description: `${eventToAdd.event_name} has been added to the calendar`,
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const removeEvent = (index: number) => {
    const eventName = events[index]?.event_name || 'Event';
    setEvents(events.filter((_, i) => i !== index));
    toast({
      title: "🗑️ Event Removed",
      description: `${eventName} has been removed from the calendar`,
    });
  };

  const handleAutoFill = async () => {
    try {
      const prompt = `Generate 8-10 common academic calendar events for a school year. Include holidays (like Diwali, Christmas), exams (like Mid-term, Final exams), cultural events (like Sports Day, Annual Function), and breaks. Return as simple array of event names only.`;
      const suggestions = await getSuggestions(prompt, { schoolType: schoolData.schoolType }, 'events');
      
      if (suggestions.length > 0) {
        const generatedEvents = suggestions.slice(0, 8).map((eventName: string, index: number) => {
          const eventTypes = ['holiday', 'exam', 'event', 'break'];
          const randomType = eventTypes[index % eventTypes.length];
          
          return {
            id: `generated-${Date.now()}-${index}`,
            event_name: typeof eventName === 'string' ? eventName : `Event ${index + 1}`,
            event_type: randomType,
            start_date: '',
            end_date: '',
            description: `School ${typeof eventName === 'string' ? eventName : `Event ${index + 1}`} - please set dates`,
          };
        });
        
        setEvents([...events, ...generatedEvents]);
        
        toast({
          title: "✨ AI Auto-filled successfully!",
          description: `Added ${generatedEvents.length} AI-generated events. Please set the dates.`,
          className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
        });
      }
    } catch (error) {
      console.log('Auto-fill failed, using fallback:', error);
      // Fallback events
      const fallbackEvents = [
        { event_name: "Summer Break", event_type: "break", description: "Annual summer vacation" },
        { event_name: "Mid-term Exams", event_type: "exam", description: "Half-yearly examinations" },
        { event_name: "Sports Day", event_type: "event", description: "Annual sports competition" },
        { event_name: "Diwali Holiday", event_type: "holiday", description: "Festival of lights celebration" }
      ];
      
      const generatedEvents = fallbackEvents.map((event, index) => ({
        id: `fallback-${Date.now()}-${index}`,
        event_name: event.event_name,
        event_type: event.event_type as 'holiday' | 'exam' | 'event' | 'break',
        start_date: '',
        end_date: '',
        description: event.description,
      }));
      
      setEvents([...events, ...generatedEvents]);
      
      toast({
        title: "✨ Auto-filled successfully!",
        description: `Added ${generatedEvents.length} events. Please set the dates.`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });
    }
  };

  const saveAcademicCalendar = async () => {
    if (!schoolId) {
      toast({
        title: "❌ Missing Information",
        description: "School ID is required. Please complete the school information step first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare all events including term breaks
      const allEvents = [
        ...events.filter(event => event.start_date && event.end_date),
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

      // Delete existing calendar events for this school
      const { error: deleteError } = await (supabase as any)
        .from('academic_calendar')
        .delete()
        .eq('school_id', schoolId);

      if (deleteError) {
        console.log('Delete error (may be expected):', deleteError);
      }

      if (allEvents.length > 0) {
        const { error } = await (supabase as any)
          .from('academic_calendar')
          .insert(allEvents.map(event => ({
            ...event,
            school_id: schoolId,
          })));

        if (error) {
          console.error('Insert error:', error);
          throw new Error(`Failed to save calendar: ${error.message}`);
        }
      }

      const calendarData = {
        academicCalendar: events,
        academic_year_start: academicYear.start_date,
        academic_year_end: academicYear.end_date,
        term_breaks: termBreaks,
      };

      onStepComplete(calendarData);
      
      toast({
        title: "✅ Success!",
        description: `Academic calendar configured with ${allEvents.length} events!`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });
      
      onNext();

    } catch (error) {
      console.error('Error saving academic calendar:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save academic calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <CalendarDays className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Academic Calendar Setup</h2>
          <p className="text-gray-600">Configure your school's academic year, terms, and important events</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-200"
        >
          <Wand2 className="h-4 w-4 text-indigo-600" />
          AI Auto Fill Events
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
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add Academic Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Event Name *</Label>
              <AIInput
                value={newEvent.event_name}
                onChange={(value) => {
                  setNewEvent(prev => ({ ...prev, event_name: value }));
                  if (value.trim()) {
                    generateEventDescription(value, newEvent.event_type);
                  }
                }}
                placeholder="e.g., Sports Day"
                suggestionType="events"
                context={{ eventType: newEvent.event_type }}
              />
            </div>
            <div>
              <Label>Event Type *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={newEvent.event_type}
                onChange={(e) => {
                  const newType = e.target.value as 'holiday' | 'exam' | 'event' | 'break';
                  setNewEvent(prev => ({ ...prev, event_type: newType }));
                  if (newEvent.event_name.trim()) {
                    generateEventDescription(newEvent.event_name, newType);
                  }
                }}
              >
                <option value="holiday">Holiday</option>
                <option value="exam">Exam</option>
                <option value="event">Event</option>
                <option value="break">Break</option>
              </select>
            </div>
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={newEvent.start_date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>End Date *</Label>
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
                <div key={event.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={eventTypeColors[event.event_type]}>
                      {event.event_type}
                    </Badge>
                    <div>
                      <h4 className="font-semibold">{String(event.event_name)}</h4>
                      <p className="text-sm text-gray-600">
                        {event.start_date || 'No start date'} to {event.end_date || 'No end date'}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-500">{String(event.description)}</p>
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
