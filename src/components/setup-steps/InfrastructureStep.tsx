
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building, School, Plus, Trash2, Wand2, Computer, Book, Dumbbell, Tv } from "lucide-react";
import { BaseStepProps } from '@/types/setup';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Equipment {
  name: string;
  quantity: number;
  checked: boolean;
}

interface Room {
  id?: string;
  room_name: string;
  room_type: string;
  capacity: number;
  equipment: Equipment[];
  grade_assignment?: string;
}

const ROOM_TYPES = [
  { value: 'classroom', label: 'Regular Classroom', icon: School },
  { value: 'lab', label: 'Laboratory', icon: Computer },
  { value: 'library', label: 'Library', icon: Book },
  { value: 'gym', label: 'Gymnasium', icon: Dumbbell },
  { value: 'auditorium', label: 'Auditorium', icon: Tv },
  { value: 'cafeteria', label: 'Cafeteria', icon: Building },
  { value: 'office', label: 'Office', icon: Building },
];

const STANDARD_EQUIPMENT = [
  { name: 'Projector', quantity: 1, checked: false },
  { name: 'Computer', quantity: 1, checked: false },
  { name: 'Air Conditioner', quantity: 1, checked: false },
  { name: 'Whiteboard', quantity: 1, checked: false },
  { name: 'Speaker System', quantity: 1, checked: false },
  { name: 'Smart Board', quantity: 1, checked: false },
];

const SAMPLE_ROOMS: Room[] = [
  {
    room_name: 'Classroom 101',
    room_type: 'classroom',
    capacity: 40,
    equipment: [
      { name: 'Projector', quantity: 1, checked: true },
      { name: 'Whiteboard', quantity: 1, checked: true },
      { name: 'Computer', quantity: 1, checked: true },
    ],
    grade_assignment: 'Grade 6'
  },
  {
    room_name: 'Science Lab',
    room_type: 'lab',
    capacity: 30,
    equipment: [
      { name: 'Microscopes', quantity: 15, checked: true },
      { name: 'Lab Tables', quantity: 8, checked: true },
      { name: 'Safety Equipment', quantity: 1, checked: true },
      { name: 'Whiteboard', quantity: 1, checked: true },
    ],
    grade_assignment: 'Multiple'
  },
  {
    room_name: 'Library',
    room_type: 'library',
    capacity: 50,
    equipment: [
      { name: 'Bookshelves', quantity: 20, checked: true },
      { name: 'Computers', quantity: 5, checked: true },
      { name: 'Reading Tables', quantity: 10, checked: true },
    ]
  },
  {
    room_name: 'Gymnasium',
    room_type: 'gym',
    capacity: 100,
    equipment: [
      { name: 'Basketball Hoops', quantity: 2, checked: true },
      { name: 'Exercise Mats', quantity: 20, checked: true },
      { name: 'Sports Equipment', quantity: 1, checked: true },
    ]
  }
];

export const InfrastructureStep: React.FC<BaseStepProps> = ({
  onNext,
  onPrevious,
  onStepComplete,
  schoolId
}) => {
  const [rooms, setRooms] = useState<Room[]>([{
    room_name: '',
    room_type: 'classroom',
    capacity: 40,
    equipment: [...STANDARD_EQUIPMENT],
  }]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const handleRoomChange = (index: number, field: keyof Room, value: string | number) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setRooms(updatedRooms);
  };

  const handleEquipmentChange = (roomIndex: number, equipIndex: number, field: keyof Equipment, value: boolean | number | string) => {
    const updatedRooms = [...rooms];
    const equipment = [...updatedRooms[roomIndex].equipment];
    equipment[equipIndex] = { ...equipment[equipIndex], [field]: value };
    updatedRooms[roomIndex].equipment = equipment;
    setRooms(updatedRooms);
  };

  const addEquipment = (roomIndex: number) => {
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex].equipment = [
      ...updatedRooms[roomIndex].equipment,
      { name: '', quantity: 1, checked: true }
    ];
    setRooms(updatedRooms);
  };

  const removeEquipment = (roomIndex: number, equipIndex: number) => {
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex].equipment = updatedRooms[roomIndex].equipment.filter((_, i) => i !== equipIndex);
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    setRooms([...rooms, {
      room_name: '',
      room_type: 'classroom',
      capacity: 40,
      equipment: [...STANDARD_EQUIPMENT],
    }]);
  };

  const removeRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index));
    }
  };

  const handleAutoFill = () => {
    setRooms(SAMPLE_ROOMS);
    toast({
      title: "✨ Auto-filled successfully!",
      description: "Sample infrastructure data has been added.",
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
      const validRooms = rooms.filter(room => 
        room.room_name.trim()
      );

      if (validRooms.length === 0) {
        throw new Error("Please add at least one room with a name.");
      }

      // Delete existing infrastructure for this school
      const { error: deleteError } = await supabase
        .from('infrastructure')
        .delete()
        .eq('school_id', schoolId);

      if (deleteError) {
        console.error('Error deleting existing infrastructure:', deleteError);
      }

      // Prepare rooms data for database
      const roomsWithSchoolId = validRooms.map(room => ({
        school_id: schoolId,
        room_name: room.room_name,
        room_type: room.room_type,
        capacity: room.capacity,
        grade_assignment: room.grade_assignment || null,
        equipment: room.equipment
          .filter(eq => eq.checked)
          .map(eq => ({ name: eq.name, quantity: eq.quantity }))
      }));

      const { error: insertError } = await supabase
        .from('infrastructure')
        .insert(roomsWithSchoolId);

      if (insertError) {
        throw new Error(`Failed to save infrastructure: ${insertError.message}`);
      }

      toast({
        title: "✅ Success!",
        description: `${validRooms.length} rooms added to your school infrastructure.`,
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });

      onStepComplete({ infrastructure: validRooms });
      onNext();
    } catch (error) {
      console.error('Error saving infrastructure:', error);
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save infrastructure.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = activeTab === 'all' 
    ? rooms 
    : rooms.filter(room => room.room_type === activeTab);

  const getRoomTypeIcon = (type: string) => {
    const roomType = ROOM_TYPES.find(rt => rt.value === type);
    const IconComponent = roomType?.icon || Building;
    return <IconComponent className="h-5 w-5" />;
  };

  const calculateUtilization = () => {
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const roomTypes = rooms.reduce((acc: Record<string, number>, room) => {
      acc[room.room_type] = (acc[room.room_type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCapacity,
      totalRooms: rooms.length,
      roomTypes
    };
  };

  const utilization = calculateUtilization();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Infrastructure Setup</h2>
          <p className="text-gray-600">Configure classrooms, labs, and other facilities for your school</p>
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

      {/* Infrastructure Overview Card */}
      {rooms.length > 0 && rooms.some(r => r.room_name.trim()) && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Building className="h-5 w-5 text-blue-600" />
              Infrastructure Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border flex flex-col">
                <span className="text-sm text-gray-500">Total Rooms</span>
                <span className="text-3xl font-bold text-blue-700">{utilization.totalRooms}</span>
              </div>
              <div className="bg-white p-4 rounded-lg border flex flex-col">
                <span className="text-sm text-gray-500">Total Capacity</span>
                <span className="text-3xl font-bold text-green-700">{utilization.totalCapacity}</span>
              </div>
              <div className="bg-white p-4 rounded-lg border flex flex-col">
                <span className="text-sm text-gray-500">Room Types</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(utilization.roomTypes).map(([type, count]) => (
                    <span key={type} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {type} ({count})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Room Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          {ROOM_TYPES.map(type => (
            <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-1">
              <type.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{type.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No rooms with the selected type. Add a new room or select a different type.
          </div>
        ) : (
          filteredRooms.map((room, index) => {
            const originalIndex = rooms.findIndex(r => r === room);
            return (
              <Card key={originalIndex} className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {getRoomTypeIcon(room.room_type)}
                    {ROOM_TYPES.find(rt => rt.value === room.room_type)?.label || 'Room'} {originalIndex + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRoom(originalIndex)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Room Name *</Label>
                      <Input
                        value={room.room_name}
                        onChange={(e) => handleRoomChange(originalIndex, 'room_name', e.target.value)}
                        placeholder="e.g., Classroom 101"
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Room Type *</Label>
                      <select
                        value={room.room_type}
                        onChange={(e) => handleRoomChange(originalIndex, 'room_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-500"
                      >
                        {ROOM_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Capacity</Label>
                      <Input
                        type="number"
                        value={room.capacity}
                        onChange={(e) => handleRoomChange(originalIndex, 'capacity', parseInt(e.target.value) || 0)}
                        placeholder="40"
                        min="1"
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {room.room_type === 'classroom' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Grade Assignment</Label>
                      <Input
                        value={room.grade_assignment || ''}
                        onChange={(e) => handleRoomChange(originalIndex, 'grade_assignment', e.target.value)}
                        placeholder="e.g., Grade 6, Multiple, Senior Section"
                        className="border-gray-300 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500">Which grade normally uses this room</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold">Equipment</Label>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => addEquipment(originalIndex)}
                        className="text-xs flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Equipment
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {room.equipment.map((equip, eIndex) => (
                        <div key={eIndex} className="flex items-center space-x-3 bg-gray-50 rounded-md p-2">
                          <Checkbox
                            id={`equip-${originalIndex}-${eIndex}`}
                            checked={equip.checked}
                            onCheckedChange={(checked) => 
                              handleEquipmentChange(originalIndex, eIndex, 'checked', checked === true)
                            }
                          />
                          
                          <div className="grid grid-cols-3 gap-2 flex-grow">
                            <div className="col-span-2">
                              <Input
                                value={equip.name}
                                onChange={(e) => handleEquipmentChange(originalIndex, eIndex, 'name', e.target.value)}
                                placeholder="Equipment name"
                                className="border-gray-300 focus:border-blue-500 h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Input
                                type="number"
                                value={equip.quantity}
                                onChange={(e) => handleEquipmentChange(originalIndex, eIndex, 'quantity', parseInt(e.target.value) || 0)}
                                placeholder="Qty"
                                min="1"
                                className="border-gray-300 focus:border-blue-500 h-8 text-sm"
                              />
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEquipment(originalIndex, eIndex)}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Utilization indicator */}
                  {room.equipment.some(e => e.checked && e.name) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Equipment:</span>
                        <span className="text-sm font-medium">{room.equipment.filter(e => e.checked).length} items</span>
                      </div>
                      <Progress 
                        value={room.equipment.filter(e => e.checked).length / Math.max(room.equipment.length, 1) * 100} 
                        className="h-2 bg-gray-200"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addRoom}
          className="w-full flex items-center gap-3 py-4 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        >
          <Plus className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-600">Add Another Room</span>
        </Button>
      </div>

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
