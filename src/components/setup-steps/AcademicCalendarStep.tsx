
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Trash2, CalendarDays, Clock, GraduationCap } from "lucide-react";
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

  const [weeklyOffs, setWeeklyOffs] = useState<string[]>(
    schoolData.weekly_offs || ['Sunday']
  );

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

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const addEvent = () => {
    if (!newEvent.event_name || !newEvent.start_date || !newEvent.end_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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

  const toggleWeeklyOff = (day: string) => {
    setWeeklyOffs(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
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
        // Use type assertion since types haven't been updated yet
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
        weekly_offs: weeklyOffs,
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
                  <Input
                    placeholder="Start Date"
                    type="date"
                    value={term.start_date}
                    onChange={(e) => {
                      const updated = [...termBreaks];
                      updated[index].start_date = e.target.value;
                      setTermBreaks(updated);
                    }}
                  />
                  <Input
                    placeholder="End Date"
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Offs */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Off Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {weekDays.map(day => (
              <Button
                key={day}
                variant={weeklyOffs.includes(day) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleWeeklyOff(day)}
              >
                {day}
              </Button>
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
            <Label>Description</Label>
            <Textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional event description"
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
