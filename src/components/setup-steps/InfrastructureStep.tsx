
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Trash2, Users, FlaskConical, Laptop, MapPin, Wand2 } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GroqSuggestionInput } from "../GroqSuggestionInput";

interface Room {
  room_name: string;
  room_type: string;
  capacity: number;
  grade_assignment: string;
  equipment: { name: string; quantity: number }[];
}

interface SchoolOverview {
  total_rooms: number;
  room_types: string[];
  special_facilities: string[];
  building_floors: number;
}

export const InfrastructureStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId,
  schoolData
}) => {
  const { toast } = useToast();
  
  const [schoolOverview, setSchoolOverview] = useState<SchoolOverview>({
    total_rooms: 0,
    room_types: [],
    special_facilities: [],
    building_floors: 1
  });

  const [rooms, setRooms] = useState<Room[]>(
    schoolData.infrastructure || []
  );

  const [showDetailedRooms, setShowDetailedRooms] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const [newRoom, setNewRoom] = useState<Room>({
    room_name: '',
    room_type: 'Regular Classroom',
    capacity: 30,
    grade_assignment: '',
    equipment: [],
  });

  const [newEquipment, setNewEquipment] = useState({ name: '', quantity: 1 });

  const roomTypes = [
    'Regular Classroom', 'Science Lab', 'Computer Lab', 'Math Lab', 'Library',
    'Indoor Gym', 'Outdoor Playground', 'Sports Ground', 'Auditorium', 'Cafeteria',
    'Principal Office', 'Staff Room', 'Art Room', 'Music Room', 'Medical Room'
  ];

  const generateRoomsFromOverview = async () => {
    if (!schoolOverview.total_rooms || schoolOverview.total_rooms === 0) {
      toast({
        title: "Error",
        description: "Please enter the total number of rooms first",
        variant: "destructive",
      });
      return;
    }

    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('groq-suggestions', {
        body: {
          prompt: `Generate ${schoolOverview.total_rooms} rooms for a ${schoolOverview.building_floors}-floor school building. Include room types: ${schoolOverview.room_types.join(', ')}. Special facilities: ${schoolOverview.special_facilities.join(', ')}. Return as JSON array with: room_name, room_type, capacity, grade_assignment, equipment (array of {name, quantity}).`,
          type: 'infrastructure_generation'
        }
      });

      if (error) throw error;
      
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setRooms(data.suggestions);
        setShowDetailedRooms(true);
        toast({
          title: "✨ AI Generated Rooms!",
          description: `${data.suggestions.length} rooms have been generated based on your requirements.`,
        });
      }
    } catch (error) {
      console.error('Error generating rooms:', error);
      toast({
        title: "Error",
        description: "Failed to generate rooms. Please add them manually.",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const addEquipment = () => {
    if (!newEquipment.name) return;
    
    setNewRoom(prev => ({
      ...prev,
      equipment: [...prev.equipment, { ...newEquipment }]
    }));
    setNewEquipment({ name: '', quantity: 1 });
  };

  const removeEquipment = (index: number) => {
    setNewRoom(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }));
  };

  const addRoom = () => {
    if (!newRoom.room_name || !newRoom.room_type) {
      toast({
        title: "Error",
        description: "Please fill in room name and type",
        variant: "destructive",
      });
      return;
    }

    setRooms(prevRooms => [...prevRooms, { ...newRoom }]);
    setNewRoom({
      room_name: '',
      room_type: 'Regular Classroom',
      capacity: 30,
      grade_assignment: '',
      equipment: [],
    });
    
    toast({
      title: "✅ Room Added!",
      description: "Room has been added successfully.",
    });
  };

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const saveInfrastructure = async () => {
    try {
      if (rooms.length > 0 && schoolId) {
        const { error } = await (supabase as any)
          .from('infrastructure')
          .upsert(rooms.map(room => ({
            ...room,
            school_id: schoolId,
          })));

        if (error) console.error('Database error (using fallback):', error);
      }

      const infrastructureData = {
        infrastructure: rooms,
        school_overview: schoolOverview
      };

      onStepComplete(infrastructureData);
      toast({
        title: "Success",
        description: "Infrastructure configured successfully!",
      });
      onNext();

    } catch (error) {
      console.error('Error saving infrastructure:', error);
      // Continue with local storage
      onStepComplete({ infrastructure: rooms, school_overview: schoolOverview });
      toast({
        title: "Success",
        description: "Infrastructure saved locally!",
      });
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Building className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Infrastructure Setup</h2>
        <p className="text-gray-600">Configure your school's facilities and infrastructure</p>
      </div>

      {/* School Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            School Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Total Number of Rooms</Label>
              <Input
                type="number"
                value={schoolOverview.total_rooms}
                onChange={(e) => setSchoolOverview(prev => ({ ...prev, total_rooms: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 25"
                min="1"
              />
            </div>
            <div>
              <Label>Building Floors</Label>
              <Input
                type="number"
                value={schoolOverview.building_floors}
                onChange={(e) => setSchoolOverview(prev => ({ ...prev, building_floors: parseInt(e.target.value) || 1 }))}
                placeholder="e.g., 3"
                min="1"
              />
            </div>
          </div>
          
          <GroqSuggestionInput
            label="Room Types (comma-separated)"
            value={schoolOverview.room_types.join(', ')}
            onChange={(value) => setSchoolOverview(prev => ({ ...prev, room_types: value.split(',').map(s => s.trim()) }))}
            placeholder="Classroom, Lab, Library, etc."
            suggestionPrompt="Suggest common room types for a school building. Return as comma-separated list."
          />
          
          <GroqSuggestionInput
            label="Special Facilities (comma-separated)"
            value={schoolOverview.special_facilities.join(', ')}
            onChange={(value) => setSchoolOverview(prev => ({ ...prev, special_facilities: value.split(',').map(s => s.trim()) }))}
            placeholder="Swimming Pool, Auditorium, etc."
            suggestionPrompt="Suggest special facilities that a modern school might have. Return as comma-separated list."
          />

          <Button 
            onClick={generateRoomsFromOverview} 
            disabled={loadingAI}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {loadingAI ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Rooms...
              </div>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Rooms with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Detailed Rooms Section */}
      {(showDetailedRooms || rooms.length > 0) && (
        <>
          {/* Add New Room */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Add Custom Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <GroqSuggestionInput
                  label="Room Name"
                  value={newRoom.room_name}
                  onChange={(value) => setNewRoom(prev => ({ ...prev, room_name: value }))}
                  placeholder="e.g., Room 101"
                  suggestionPrompt="Suggest creative and organized room names for a school. Return as JSON array."
                />
                
                <div>
                  <Label>Room Type</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newRoom.room_type}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, room_type: e.target.value }))}
                  >
                    {roomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <GroqSuggestionInput
                  label="Grade Assignment"
                  value={newRoom.grade_assignment}
                  onChange={(value) => setNewRoom(prev => ({ ...prev, grade_assignment: value }))}
                  placeholder="e.g., Grade 5-6"
                  suggestionPrompt="Suggest appropriate grade assignments for school rooms. Return as JSON array."
                />
              </div>

              <Button onClick={addRoom} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </CardContent>
          </Card>

          {/* Rooms List */}
          {rooms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Configured Rooms ({rooms.length})</span>
                  <Badge variant="outline">
                    <Users className="h-4 w-4 mr-1" />
                    Total Capacity: {rooms.reduce((sum, room) => sum + room.capacity, 0)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map((room, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <h4 className="font-semibold">{room.room_name}</h4>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRoom(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Badge className="bg-blue-100 text-blue-800">
                        {room.room_type}
                      </Badge>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Capacity: {room.capacity} students</div>
                        {room.grade_assignment && (
                          <div>Grade: {room.grade_assignment}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          ← Previous
        </Button>
        <Button onClick={saveInfrastructure}>
          Next: Students →
        </Button>
      </div>
    </div>
  );
};
