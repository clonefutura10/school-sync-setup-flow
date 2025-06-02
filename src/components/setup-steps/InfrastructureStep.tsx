
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Trash2, Users, FlaskConical, Laptop, MapPin } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Room {
  room_name: string;
  room_type: string;
  capacity: number;
  grade_assignment: string;
  equipment: { name: string; quantity: number }[];
}

export const InfrastructureStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId,
  schoolData
}) => {
  const { toast } = useToast();
  
  const [rooms, setRooms] = useState<Room[]>(
    schoolData.infrastructure || []
  );

  const [newRoom, setNewRoom] = useState<Room>({
    room_name: '',
    room_type: 'Regular Classroom',
    capacity: 30,
    grade_assignment: '',
    equipment: [],
  });

  const [newEquipment, setNewEquipment] = useState({ name: '', quantity: 1 });

  const roomTypes = [
    'Regular Classroom',
    'Science Lab',
    'Computer Lab',
    'Math Lab',
    'Library',
    'Indoor Gym',
    'Outdoor Playground',
    'Sports Ground',
    'Auditorium',
    'Cafeteria',
    'Principal Office',
    'Staff Room',
    'Art Room',
    'Music Room',
  ];

  const commonEquipment = [
    'Projector', 'Whiteboard', 'Air Conditioner', 'Fan', 'Desk', 'Chair',
    'Computer', 'Printer', 'Microscope', 'Beaker', 'Test Tube', 'Calculator',
  ];

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

    setRooms([...rooms, { ...newRoom }]);
    setNewRoom({
      room_name: '',
      room_type: 'Regular Classroom',
      capacity: 30,
      grade_assignment: '',
      equipment: [],
    });
  };

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const saveInfrastructure = async () => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "School ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (rooms.length > 0) {
        // Use type assertion since types haven't been updated yet
        const { error } = await (supabase as any)
          .from('infrastructure')
          .upsert(rooms.map(room => ({
            ...room,
            school_id: schoolId,
          })));

        if (error) throw error;
      }

      onStepComplete({ infrastructure: rooms });
      toast({
        title: "Success",
        description: "Infrastructure configured successfully!",
      });
      onNext();

    } catch (error) {
      console.error('Error saving infrastructure:', error);
      toast({
        title: "Error",
        description: "Failed to save infrastructure",
        variant: "destructive",
      });
    }
  };

  const getRoomTypeIcon = (type: string) => {
    if (type.includes('Lab')) return <FlaskConical className="h-4 w-4" />;
    if (type.includes('Computer')) return <Laptop className="h-4 w-4" />;
    if (type.includes('Office') || type.includes('Staff')) return <MapPin className="h-4 w-4" />;
    return <Building className="h-4 w-4" />;
  };

  const getRoomTypeColor = (type: string) => {
    if (type.includes('Lab')) return 'bg-purple-100 text-purple-800';
    if (type.includes('Computer')) return 'bg-blue-100 text-blue-800';
    if (type.includes('Gym') || type.includes('Sports')) return 'bg-green-100 text-green-800';
    if (type.includes('Office') || type.includes('Staff')) return 'bg-gray-100 text-gray-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Building className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Infrastructure Setup</h2>
        <p className="text-gray-600">Configure your school's rooms, facilities, and equipment</p>
      </div>

      {/* Add New Room */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add Room/Facility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Room Name</Label>
              <Input
                value={newRoom.room_name}
                onChange={(e) => setNewRoom(prev => ({ ...prev, room_name: e.target.value }))}
                placeholder="e.g., Room 101"
              />
            </div>
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
            <div>
              <Label>Grade Assignment</Label>
              <Input
                value={newRoom.grade_assignment}
                onChange={(e) => setNewRoom(prev => ({ ...prev, grade_assignment: e.target.value }))}
                placeholder="e.g., Grade 5-6"
              />
            </div>
          </div>

          {/* Equipment Section */}
          <div className="space-y-3">
            <Label>Equipment</Label>
            <div className="flex gap-2">
              <select
                className="flex-1 p-2 border rounded-md"
                value={newEquipment.name}
                onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
              >
                <option value="">Select equipment</option>
                {commonEquipment.map(eq => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
              <Input
                type="number"
                className="w-20"
                value={newEquipment.quantity}
                onChange={(e) => setNewEquipment(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                min="1"
              />
              <Button type="button" onClick={addEquipment} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {newRoom.equipment.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newRoom.equipment.map((eq, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {eq.name} ({eq.quantity})
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeEquipment(index)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
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
                      {getRoomTypeIcon(room.room_type)}
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
                  
                  <Badge className={getRoomTypeColor(room.room_type)}>
                    {room.room_type}
                  </Badge>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Capacity: {room.capacity} students</div>
                    {room.grade_assignment && (
                      <div>Grade: {room.grade_assignment}</div>
                    )}
                  </div>

                  {room.equipment.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-700">Equipment:</div>
                      <div className="flex flex-wrap gap-1">
                        {room.equipment.map((eq, eqIndex) => (
                          <Badge key={eqIndex} variant="outline" className="text-xs">
                            {eq.name} ({eq.quantity})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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
        <Button onClick={saveInfrastructure}>
          Next: Students →
        </Button>
      </div>
    </div>
  );
};
