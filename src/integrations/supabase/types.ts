export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      direct_messages: {
        Row: {
          id: string
          message: string
          org_id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          sent_at: string
          thread_id: string | null
        }
        Insert: {
          id?: string
          message: string
          org_id: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          sent_at?: string
          thread_id?: string | null
        }
        Update: {
          id?: string
          message?: string
          org_id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          sent_at?: string
          thread_id?: string | null
        }
        Relationships: []
      }
      event_log: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          org_id: string
          type: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          org_id: string
          type: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          org_id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      flight_debriefs: {
        Row: {
          ai_summary: string | null
          aircraft_id: string | null
          created_at: string
          exceedances: Json | null
          flight_date: string
          flight_time: number
          id: string
          improvement_areas: Json | null
          instructor_id: string | null
          maneuver_scores: Json | null
          next_steps: string | null
          org_id: string
          overall_score: number | null
          session_id: string
          strengths: Json | null
          student_id: string
          study_recommendations: Json | null
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          aircraft_id?: string | null
          created_at?: string
          exceedances?: Json | null
          flight_date: string
          flight_time: number
          id?: string
          improvement_areas?: Json | null
          instructor_id?: string | null
          maneuver_scores?: Json | null
          next_steps?: string | null
          org_id: string
          overall_score?: number | null
          session_id: string
          strengths?: Json | null
          student_id: string
          study_recommendations?: Json | null
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          aircraft_id?: string | null
          created_at?: string
          exceedances?: Json | null
          flight_date?: string
          flight_time?: number
          id?: string
          improvement_areas?: Json | null
          instructor_id?: string | null
          maneuver_scores?: Json | null
          next_steps?: string | null
          org_id?: string
          overall_score?: number | null
          session_id?: string
          strengths?: Json | null
          student_id?: string
          study_recommendations?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      flight_schools: {
        Row: {
          admin_user_id: string | null
          aviation_region: string
          country: string
          created_at: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          admin_user_id?: string | null
          aviation_region: string
          country: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          admin_user_id?: string | null
          aviation_region?: string
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          org_id: string
          participants: string[]
          thread_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          participants: string[]
          thread_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          participants?: string[]
          thread_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          category: string | null
          created_at: string
          id: string
          message: string
          org_id: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string
          id?: string
          message: string
          org_id?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string
          id?: string
          message?: string
          org_id?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: string
          used: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          role?: string
          used?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "org_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_pending_requests: {
        Row: {
          email: string
          id: string
          org_id: string
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          email: string
          id?: string
          org_id: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          email?: string
          id?: string
          org_id?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_pending_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_settings: {
        Row: {
          auto_approve_domain: boolean | null
          created_at: string
          id: string
          org_id: string
          updated_at: string
        }
        Insert: {
          auto_approve_domain?: boolean | null
          created_at?: string
          id?: string
          org_id: string
          updated_at?: string
        }
        Update: {
          auto_approve_domain?: boolean | null
          created_at?: string
          id?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string | null
          aviation_region: string | null
          created_at: string | null
          email: string | null
          flight_school_id: string | null
          id: string
          name: string | null
          onboarding_completed: boolean | null
          org_id: string | null
          role: string | null
          trial_expires_at: string | null
        }
        Insert: {
          approval_status?: string | null
          aviation_region?: string | null
          created_at?: string | null
          email?: string | null
          flight_school_id?: string | null
          id: string
          name?: string | null
          onboarding_completed?: boolean | null
          org_id?: string | null
          role?: string | null
          trial_expires_at?: string | null
        }
        Update: {
          approval_status?: string | null
          aviation_region?: string | null
          created_at?: string | null
          email?: string | null
          flight_school_id?: string | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          org_id?: string | null
          role?: string | null
          trial_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_flight_school_fk"
            columns: ["flight_school_id"]
            isOneToOne: false
            referencedRelation: "flight_schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      school_join_requests: {
        Row: {
          flight_school_id: string
          id: string
          message: string | null
          org_id: string
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          flight_school_id: string
          id?: string
          message?: string | null
          org_id: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          flight_school_id?: string
          id?: string
          message?: string | null
          org_id?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_join_requests_flight_school_id_fkey"
            columns: ["flight_school_id"]
            isOneToOne: false
            referencedRelation: "flight_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_assignments: {
        Row: {
          active: boolean
          assigned_at: string
          course_type: string
          created_at: string
          id: string
          instructor_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          course_type: string
          created_at?: string
          id?: string
          instructor_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          course_type?: string
          created_at?: string
          id?: string
          instructor_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_badges: {
        Row: {
          badge_id: string
          badge_name: string
          created_at: string
          date_earned: string
          id: string
          org_id: string
          student_id: string
        }
        Insert: {
          badge_id: string
          badge_name: string
          created_at?: string
          date_earned?: string
          id?: string
          org_id: string
          student_id: string
        }
        Update: {
          badge_id?: string
          badge_name?: string
          created_at?: string
          date_earned?: string
          id?: string
          org_id?: string
          student_id?: string
        }
        Relationships: []
      }
      student_progress: {
        Row: {
          completed: boolean
          completion_date: string | null
          course_type: string
          created_at: string
          cross_country_hours: number
          dual_hours: number
          id: string
          instrument_hours: number
          milestone_id: string
          night_hours: number
          org_id: string
          overall_score: number | null
          readiness_level: string | null
          solo_hours: number
          strong_areas: Json | null
          student_id: string
          total_hours: number
          updated_at: string
          weak_areas: Json | null
        }
        Insert: {
          completed?: boolean
          completion_date?: string | null
          course_type: string
          created_at?: string
          cross_country_hours?: number
          dual_hours?: number
          id?: string
          instrument_hours?: number
          milestone_id: string
          night_hours?: number
          org_id: string
          overall_score?: number | null
          readiness_level?: string | null
          solo_hours?: number
          strong_areas?: Json | null
          student_id: string
          total_hours?: number
          updated_at?: string
          weak_areas?: Json | null
        }
        Update: {
          completed?: boolean
          completion_date?: string | null
          course_type?: string
          created_at?: string
          cross_country_hours?: number
          dual_hours?: number
          id?: string
          instrument_hours?: number
          milestone_id?: string
          night_hours?: number
          org_id?: string
          overall_score?: number | null
          readiness_level?: string | null
          solo_hours?: number
          strong_areas?: Json | null
          student_id?: string
          total_hours?: number
          updated_at?: string
          weak_areas?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_org_admin: {
        Args: { org_uuid?: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
