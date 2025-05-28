
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Plus, Trash2, CalendarDays, Wand2 } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id?: string;
  event_name: string;
  event_type: 'holiday' | 'exam' | 'event' | 'break';
  start_date: string;
  end_date: string;
  description: string;
}

const EVENT_TYPES = [
  { value: 'holiday', label: 'Holiday', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'exam', label: 'Exam', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'event', label: 'Event', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'break', label: 'Break', color: 'bg-green-100 text-green-800 border-green-200' }
];

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    event_name: "Summer Vacation",
    event_type: "break",
    start_date: "2024-05-15",
    end_date: "2024-06-30",
    description: "Annual summer break"
  },
  {
    event_name: "Independence Day",
    event_type: "holiday",
    start_date: "2024-08-15",
    end_date: "2024-08-15",
    description: "National holiday"
  },
  {
    event_name: "Annual Sports Day",
    event_type: "event",
    start_date: "2024-11-15",
    end_date: "2024-11-16",
    description: "School sports competition"
  },
  {
    event_name: "Mid-term Examinations",
    event_type: "exam",
    start_date: "2024-09-15",
    end_date: "2024-09-25",
    description: "First semester mid-term exams"
  }
];

export const AcademicCalendarStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [academicYear, setAcademicYear] = useState({ start: '', end: '' });
  const [events, setEvents] = useState<CalendarEvent[]>([{
    event_name: '',
    event_type: 'holiday',
    start_date: '',
    end_date: '',
    description: ''
  }]);
  const [weeklyOffs, setWeeklyOffs] = useState<string[]>(['Sunday']);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const weekDays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleEventChange = (index: number, field: keyof CalendarEvent, value: string) => {
    const updatedEvents = [...events];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    setEvents(updatedEvents);
  };

  const addEvent = () => {
    setEvents([...events, {
      event_name: '',
      event_type: 'holiday',
      start_date: '',
      end_date: '',
      description: ''
    }]);
  };

  const removeEvent = (index: number) => {
    if (events.length > 1) {
      setEvents(events.filter((_, i) => i !== index));
    }
  };

  const handleWeeklyOffChange = (day: string, checked: boolean) => {
    if (checked) {
      setWeeklyOffs([...weeklyOffs, day]);
    } else {
      setWeeklyOffs(weeklyOffs.filter(d => d !== day));
    }
  };

  const handleAutoFill = () => {
    setEvents(SAMPLE_EVENTS);
    setAcademicYear({ start: '2024-04-01', end: '2025-03-31' });
    setWeeklyOffs(['Sunday']);
    toast({
      title: "✨ Auto-filled successfully!",
      description: "Sample academic calendar data has been loaded.",
      className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
    });
  };

  const handleSubmit = async () => {
    if (!schoolId) {
      toast({
        title: "❌ Missing Information",
        description: "School ID is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const validEvents = events.filter(event => 
        event.event_name.trim() && event.start_date && event.end_date
      );

      // Delete existing calendar events for this school
      const { error: deleteError } = await supabase
        .from('academic_calendar')
        .delete()
        .eq('school_id', schoolId);

      if (deleteError) {
        console.error('Error deleting existing events:', deleteError);
      }

      if (validEvents.length > 0) {
        const eventsWithSchoolId = validEvents.map(event => ({
          ...event,
          school_id: schoolId
        }));

        const { error: insertError } = await supabase
          .from('academic_calendar')
          .insert(eventsWithSchoolId);

        if (insertError) {
          throw new Error(`Failed to save events: ${insertError.message}`);
        }
      }

      toast({
        title: "✅ Success!",
        description: `Academic calendar configured with ${validEvents.length} events.`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      onStepComplete({ 
        academicCalendar: validEvents,
        academicYear,
        weeklyOffs
      });
      onNext();
    } catch (error) {
      console.error('Error saving academic calendar:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save calendar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeConfig = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0];
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Academic Calendar</h2>
          <p className="text-gray-600">Configure the academic year calendar, term dates, holidays and important events</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFill}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100 transition-all duration-300"
        >
          <Wand2 className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-700">Auto Fill</span>
        </Button>
      </div>

      {/* Academic Year Settings */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Academic Year Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Academic Year Start Date</Label>
              <div className="flex flex-col space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !academicYear.start && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {academicYear.start ? format(new Date(academicYear.start), "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={academicYear.start ? new Date(academicYear.start) : undefined}
                      onSelect={(date) => date && setAcademicYear({...academicYear, start: format(date, 'yyyy-MM-dd')})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Academic Year End Date</Label>
              <div className="flex flex-col space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !academicYear.end && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {academicYear.end ? format(new Date(academicYear.end), "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={academicYear.end ? new Date(academicYear.end) : undefined}
                      onSelect={(date) => date && setAcademicYear({...academicYear, end: format(date, 'yyyy-MM-dd')})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Off Days */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Weekly Off Days
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weekDays.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox 
                  id={`day-${day}`} 
                  checked={weeklyOffs.includes(day)}
                  onCheckedChange={(checked) => handleWeeklyOffChange(day, checked === true)}
                />
                <Label 
                  htmlFor={`day-${day}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {day}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events Management */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Events & Holidays</h3>
        
        {events.map((event, index) => (
          <Card key={index} className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Event {index + 1}
              </CardTitle>
              {events.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEvent(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Event Name *</Label>
                  <Input
                    value={event.event_name}
                    onChange={(e) => handleEventChange(index, 'event_name', e.target.value)}
                    placeholder="e.g., Independence Day"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Event Type *</Label>
                  <select
                    value={event.event_type}
                    onChange={(e) => handleEventChange(index, 'event_type', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-500"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Start Date *</Label>
                  <div className="flex flex-col space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !event.start_date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {event.start_date ? format(new Date(event.start_date), "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={event.start_date ? new Date(event.start_date) : undefined}
                          onSelect={(date) => date && handleEventChange(index, 'start_date', format(date, 'yyyy-MM-dd'))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">End Date *</Label>
                  <div className="flex flex-col space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !event.end_date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {event.end_date ? format(new Date(event.end_date), "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={event.end_date ? new Date(event.end_date) : undefined}
                          onSelect={(date) => date && handleEventChange(index, 'end_date', format(date, 'yyyy-MM-dd'))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Description</Label>
                <Textarea
                  value={event.description}
                  onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                  placeholder="Provide details about this event"
                  className="border-gray-300 focus:border-blue-500"
                  rows={2}
                />
              </div>

              {/* Event badge */}
              <div className="flex items-center mt-2">
                <div className={`px-3 py-1 rounded-full text-sm ${getEventTypeConfig(event.event_type).color} border`}>
                  {getEventTypeConfig(event.event_type).label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addEvent}
          className="w-full flex items-center gap-3 py-4 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        >
          <Plus className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-600">Add Another Event</span>
        </Button>
      </div>

      {/* Calendar summary */}
      {events.length > 0 && events.some(e => e.event_name && e.start_date && e.end_date) && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Calendar Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {EVENT_TYPES.map(type => {
                  const count = events.filter(e => e.event_type === type.value && e.event_name).length;
                  return (
                    <div key={type.value} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                      <span className="text-sm font-medium">{type.label}s:</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${type.color}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-sm mb-3">Events Timeline</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {events
                    .filter(event => event.event_name && event.start_date)
                    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                    .map((event, idx) => (
                      <div key={idx} className="flex items-center px-3 py-2 rounded-md hover:bg-gray-50">
                        <div className={`w-3 h-3 rounded-full mr-2 ${getEventTypeConfig(event.event_type).color.replace('text-', 'bg-').split(' ')[0]}`}></div>
                        <div className="flex-grow">
                          <span className="font-medium text-sm">{event.event_name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({event.start_date === event.end_date ? 
                              format(new Date(event.start_date), "MMM dd, yyyy") : 
                              `${format(new Date(event.start_date), "MMM dd")} - ${format(new Date(event.end_date), "MMM dd, yyyy")}`})
                          </span>
                        </div>
                        <span className={`text-xs ${getEventTypeConfig(event.event_type).color} px-2 py-0.5 rounded-full`}>
                          {getEventTypeConfig(event.event_type).label}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="px-8 py-3 border-gray-300 hover:bg-gray-50"
        >
          ← Previous
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium disabled:opacity-50"
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
