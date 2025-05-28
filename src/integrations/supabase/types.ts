export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academic_calendar: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          event_name: string
          event_type: string
          id: string
          school_id: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          event_name: string
          event_type: string
          id?: string
          school_id?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          event_name?: string
          event_type?: string
          id?: string
          school_id?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_calendar_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string
          day_of_week: string
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          capacity: number | null
          created_at: string
          grade: string | null
          id: string
          name: string
          periods_per_day: number | null
          periods_per_week: number | null
          room_number: string | null
          school_id: string | null
          section: string | null
          teacher_id: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          grade?: string | null
          id?: string
          name: string
          periods_per_day?: number | null
          periods_per_week?: number | null
          room_number?: string | null
          school_id?: string | null
          section?: string | null
          teacher_id?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          grade?: string | null
          id?: string
          name?: string
          periods_per_day?: number | null
          periods_per_week?: number | null
          room_number?: string | null
          school_id?: string | null
          section?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      infrastructure: {
        Row: {
          capacity: number | null
          created_at: string
          equipment: Json | null
          grade_assignment: string | null
          id: string
          is_available: boolean | null
          room_name: string
          room_type: string
          school_id: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          equipment?: Json | null
          grade_assignment?: string | null
          id?: string
          is_available?: boolean | null
          room_name: string
          room_type: string
          school_id?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          equipment?: Json | null
          grade_assignment?: string | null
          id?: string
          is_available?: boolean | null
          room_name?: string
          room_type?: string
          school_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_settings: {
        Row: {
          created_at: string
          id: string
          school_id: string | null
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          school_id?: string | null
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          school_id?: string | null
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          academic_year: string | null
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          principal_name: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          principal_name?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          principal_name?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string
          grade: string | null
          id: string
          last_name: string
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          school_id: string | null
          section: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          grade?: string | null
          id?: string
          last_name: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          school_id?: string | null
          section?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          grade?: string | null
          id?: string
          last_name?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          school_id?: string | null
          section?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          created_at: string
          department: string | null
          description: string | null
          id: string
          name: string
          school_id: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          name: string
          school_id?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_subject_mappings: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          periods_per_week: number | null
          preferred_time_slots: string[] | null
          school_id: string | null
          subject_id: string | null
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          periods_per_week?: number | null
          preferred_time_slots?: string[] | null
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          periods_per_week?: number | null
          preferred_time_slots?: string[] | null
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subject_mappings_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_mappings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_mappings_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_mappings_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          availability_notes: string | null
          created_at: string
          department: string | null
          email: string | null
          experience_years: number | null
          first_name: string
          id: string
          last_name: string
          max_hours_per_day: number | null
          phone: string | null
          preferences: string | null
          qualification: string | null
          school_id: string | null
          subjects: Json | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          availability_notes?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          experience_years?: number | null
          first_name: string
          id?: string
          last_name: string
          max_hours_per_day?: number | null
          phone?: string | null
          preferences?: string | null
          qualification?: string | null
          school_id?: string | null
          subjects?: Json | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          availability_notes?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          experience_years?: number | null
          first_name?: string
          id?: string
          last_name?: string
          max_hours_per_day?: number | null
          phone?: string | null
          preferences?: string | null
          qualification?: string | null
          school_id?: string | null
          subjects?: Json | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          name: string
          school_id: string | null
          start_time: string
          type: string | null
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          name: string
          school_id?: string | null
          start_time: string
          type?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          name?: string
          school_id?: string | null
          start_time?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      timetables: {
        Row: {
          class_id: string | null
          created_at: string
          day_of_week: string
          id: string
          period_number: number
          room_number: string | null
          schedule_data: Json | null
          school_id: string | null
          subject_id: string | null
          teacher_id: string | null
          time_slot_id: string | null
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          day_of_week: string
          id?: string
          period_number: number
          room_number?: string | null
          schedule_data?: Json | null
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          time_slot_id?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          day_of_week?: string
          id?: string
          period_number?: number
          room_number?: string | null
          schedule_data?: Json | null
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          time_slot_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetables_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
