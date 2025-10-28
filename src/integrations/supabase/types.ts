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
      achievement_streaks: {
        Row: {
          best_count: number
          created_at: string
          current_count: number
          id: string
          is_active: boolean
          last_activity_date: string | null
          org_id: string
          streak_start_date: string | null
          streak_type: string
          student_id: string
          updated_at: string
        }
        Insert: {
          best_count?: number
          created_at?: string
          current_count?: number
          id?: string
          is_active?: boolean
          last_activity_date?: string | null
          org_id: string
          streak_start_date?: string | null
          streak_type: string
          student_id: string
          updated_at?: string
        }
        Update: {
          best_count?: number
          created_at?: string
          current_count?: number
          id?: string
          is_active?: boolean
          last_activity_date?: string | null
          org_id?: string
          streak_start_date?: string | null
          streak_type?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_actions: {
        Row: {
          action_type: string
          ai_confidence: number | null
          created_at: string
          expires_at: string | null
          id: string
          org_id: string
          priority: string
          recommendation_text: string
          recommended_action: Json | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_entity_id: string
          target_entity_type: string
        }
        Insert: {
          action_type: string
          ai_confidence?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          org_id: string
          priority?: string
          recommendation_text: string
          recommended_action?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_entity_id: string
          target_entity_type: string
        }
        Update: {
          action_type?: string
          ai_confidence?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          org_id?: string
          priority?: string
          recommendation_text?: string
          recommended_action?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_entity_id?: string
          target_entity_type?: string
        }
        Relationships: []
      }
      ai_learning_feedback: {
        Row: {
          actual_outcome: string | null
          ai_action_id: string | null
          created_at: string
          feedback_notes: string | null
          feedback_score: number | null
          feedback_type: string
          id: string
          org_id: string
          provided_by: string | null
        }
        Insert: {
          actual_outcome?: string | null
          ai_action_id?: string | null
          created_at?: string
          feedback_notes?: string | null
          feedback_score?: number | null
          feedback_type: string
          id?: string
          org_id: string
          provided_by?: string | null
        }
        Update: {
          actual_outcome?: string | null
          ai_action_id?: string | null
          created_at?: string
          feedback_notes?: string | null
          feedback_score?: number | null
          feedback_type?: string
          id?: string
          org_id?: string
          provided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_learning_feedback_ai_action_id_fkey"
            columns: ["ai_action_id"]
            isOneToOne: false
            referencedRelation: "ai_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      aircraft: {
        Row: {
          aircraft_type: string
          avionics_config: Json | null
          certificate_expiry: string | null
          created_at: string
          current_fuel_level: number | null
          fuel_capacity: number | null
          hours_since_maintenance: number
          id: string
          insurance_expiry: string | null
          last_inspection: string | null
          location: string | null
          maintenance_intervals: Json | null
          make_model: string
          next_inspection: string | null
          org_id: string
          registration: string
          status: string
          total_hours: number
          updated_at: string
          year_manufactured: number | null
        }
        Insert: {
          aircraft_type: string
          avionics_config?: Json | null
          certificate_expiry?: string | null
          created_at?: string
          current_fuel_level?: number | null
          fuel_capacity?: number | null
          hours_since_maintenance?: number
          id?: string
          insurance_expiry?: string | null
          last_inspection?: string | null
          location?: string | null
          maintenance_intervals?: Json | null
          make_model: string
          next_inspection?: string | null
          org_id: string
          registration: string
          status?: string
          total_hours?: number
          updated_at?: string
          year_manufactured?: number | null
        }
        Update: {
          aircraft_type?: string
          avionics_config?: Json | null
          certificate_expiry?: string | null
          created_at?: string
          current_fuel_level?: number | null
          fuel_capacity?: number | null
          hours_since_maintenance?: number
          id?: string
          insurance_expiry?: string | null
          last_inspection?: string | null
          location?: string | null
          maintenance_intervals?: Json | null
          make_model?: string
          next_inspection?: string | null
          org_id?: string
          registration?: string
          status?: string
          total_hours?: number
          updated_at?: string
          year_manufactured?: number | null
        }
        Relationships: []
      }
      aircraft_availability: {
        Row: {
          aircraft_id: string
          created_at: string
          end_at: string
          id: string
          org_id: string
          reason: string | null
          start_at: string
          state: string
        }
        Insert: {
          aircraft_id: string
          created_at?: string
          end_at: string
          id?: string
          org_id: string
          reason?: string | null
          start_at: string
          state?: string
        }
        Update: {
          aircraft_id?: string
          created_at?: string
          end_at?: string
          id?: string
          org_id?: string
          reason?: string | null
          start_at?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_availability_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aircraft_availability_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      aircraft_capability: {
        Row: {
          aircraft_id: string
          capability: string
          created_at: string
          id: string
          notes: string | null
          value: string
        }
        Insert: {
          aircraft_id: string
          capability: string
          created_at?: string
          id?: string
          notes?: string | null
          value?: string
        }
        Update: {
          aircraft_id?: string
          capability?: string
          created_at?: string
          id?: string
          notes?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_capability_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
        ]
      }
      aircraft_defects: {
        Row: {
          aircraft_id: string
          created_at: string
          description: string
          due_date: string | null
          id: string
          maintenance_event_id: string | null
          mel_reference: string | null
          org_id: string
          rectified_at: string | null
          rectified_by: string | null
          regulatory_action_required: boolean | null
          reported_at: string
          reported_by: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          aircraft_id: string
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          maintenance_event_id?: string | null
          mel_reference?: string | null
          org_id: string
          rectified_at?: string | null
          rectified_by?: string | null
          regulatory_action_required?: boolean | null
          reported_at?: string
          reported_by?: string | null
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          aircraft_id?: string
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          maintenance_event_id?: string | null
          mel_reference?: string | null
          org_id?: string
          rectified_at?: string | null
          rectified_by?: string | null
          regulatory_action_required?: boolean | null
          reported_at?: string
          reported_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_defects_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aircraft_defects_maintenance_event_id_fkey"
            columns: ["maintenance_event_id"]
            isOneToOne: false
            referencedRelation: "maintenance_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aircraft_defects_rectified_by_fkey"
            columns: ["rectified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aircraft_defects_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_block: {
        Row: {
          created_at: string
          end_at: string
          id: string
          location_icao: string | null
          notes: string | null
          org_id: string
          recurs_rrule: string | null
          start_at: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          location_icao?: string | null
          notes?: string | null
          org_id: string
          recurs_rrule?: string | null
          start_at: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          location_icao?: string | null
          notes?: string | null
          org_id?: string
          recurs_rrule?: string | null
          start_at?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_block_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_unlock_conditions: {
        Row: {
          badge_id: string
          badge_name: string
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          points_awarded: number
          unlock_conditions: Json
        }
        Insert: {
          badge_id: string
          badge_name: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          points_awarded?: number
          unlock_conditions: Json
        }
        Update: {
          badge_id?: string
          badge_name?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          points_awarded?: number
          unlock_conditions?: Json
        }
        Relationships: []
      }
      billing_calculations: {
        Row: {
          applied_rules: Json
          base_amount: number
          calculation_date: string
          created_at: string
          discounts_applied: number | null
          final_amount: number
          flight_session_id: string | null
          id: string
          invoice_id: string | null
          org_id: string
          student_id: string
          surcharges_applied: number | null
        }
        Insert: {
          applied_rules: Json
          base_amount: number
          calculation_date?: string
          created_at?: string
          discounts_applied?: number | null
          final_amount: number
          flight_session_id?: string | null
          id?: string
          invoice_id?: string | null
          org_id: string
          student_id: string
          surcharges_applied?: number | null
        }
        Update: {
          applied_rules?: Json
          base_amount?: number
          calculation_date?: string
          created_at?: string
          discounts_applied?: number | null
          final_amount?: number
          flight_session_id?: string | null
          id?: string
          invoice_id?: string | null
          org_id?: string
          student_id?: string
          surcharges_applied?: number | null
        }
        Relationships: []
      }
      billing_rule_sets: {
        Row: {
          created_at: string
          description: string | null
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean
          org_id: string
          rule_set_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          org_id: string
          rule_set_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean
          org_id?: string
          rule_set_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          priority: number
          rule_name: string
          rule_set_id: string
          rule_type: string
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number
          rule_name: string
          rule_set_id: string
          rule_type: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number
          rule_name?: string
          rule_set_id?: string
          rule_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_rules_rule_set_id_fkey"
            columns: ["rule_set_id"]
            isOneToOne: false
            referencedRelation: "billing_rule_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_blocks: {
        Row: {
          block_end_date: string | null
          block_start_date: string
          block_type: string
          blocked_operations: string[]
          compliance_item_id: string
          created_at: string
          id: string
          is_active: boolean
          org_id: string
          overridden_by: string | null
          override_reason: string | null
          user_id: string
        }
        Insert: {
          block_end_date?: string | null
          block_start_date: string
          block_type: string
          blocked_operations: string[]
          compliance_item_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          org_id: string
          overridden_by?: string | null
          override_reason?: string | null
          user_id: string
        }
        Update: {
          block_end_date?: string | null
          block_start_date?: string
          block_type?: string
          blocked_operations?: string[]
          compliance_item_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          org_id?: string
          overridden_by?: string | null
          override_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_blocks_compliance_item_id_fkey"
            columns: ["compliance_item_id"]
            isOneToOne: false
            referencedRelation: "compliance_items"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_items: {
        Row: {
          auto_renew_reminder: boolean
          compliance_type_id: string
          created_at: string
          document_reference: string | null
          expiry_date: string
          id: string
          issued_date: string | null
          issuing_authority: string | null
          next_due_date: string | null
          notes: string | null
          org_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew_reminder?: boolean
          compliance_type_id: string
          created_at?: string
          document_reference?: string | null
          expiry_date: string
          id?: string
          issued_date?: string | null
          issuing_authority?: string | null
          next_due_date?: string | null
          notes?: string | null
          org_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew_reminder?: boolean
          compliance_type_id?: string
          created_at?: string
          document_reference?: string | null
          expiry_date?: string
          id?: string
          issued_date?: string | null
          issuing_authority?: string | null
          next_due_date?: string | null
          notes?: string | null
          org_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_items_compliance_type_id_fkey"
            columns: ["compliance_type_id"]
            isOneToOne: false
            referencedRelation: "compliance_types"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_types: {
        Row: {
          applicable_roles: string[]
          aviation_region: string | null
          blocks_operations: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          recurrence_rules: Json
          type_name: string
          warning_days_before: number
        }
        Insert: {
          applicable_roles: string[]
          aviation_region?: string | null
          blocks_operations?: boolean
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          recurrence_rules: Json
          type_name: string
          warning_days_before?: number
        }
        Update: {
          applicable_roles?: string[]
          aviation_region?: string | null
          blocks_operations?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          recurrence_rules?: Json
          type_name?: string
          warning_days_before?: number
        }
        Relationships: []
      }
      constraint_policies: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          org_id: string
          policy_json: Json
          policy_type: string
          updated_at: string
          version: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          org_id: string
          policy_json?: Json
          policy_type: string
          updated_at?: string
          version?: number
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          org_id?: string
          policy_json?: Json
          policy_type?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "constraint_policies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      document_metadata: {
        Row: {
          access_level: string
          compliance_item_id: string | null
          created_at: string
          document_name: string
          document_type: string
          file_extension: string | null
          file_size_bytes: number | null
          id: string
          is_current_version: boolean
          mime_type: string | null
          org_id: string
          related_entity_id: string | null
          related_entity_type: string | null
          retention_policy_days: number | null
          storage_bucket: string
          storage_path: string
          storage_url: string
          updated_at: string
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          access_level?: string
          compliance_item_id?: string | null
          created_at?: string
          document_name: string
          document_type: string
          file_extension?: string | null
          file_size_bytes?: number | null
          id?: string
          is_current_version?: boolean
          mime_type?: string | null
          org_id: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          retention_policy_days?: number | null
          storage_bucket: string
          storage_path: string
          storage_url: string
          updated_at?: string
          uploaded_by?: string | null
          version_number?: number
        }
        Update: {
          access_level?: string
          compliance_item_id?: string | null
          created_at?: string
          document_name?: string
          document_type?: string
          file_extension?: string | null
          file_size_bytes?: number | null
          id?: string
          is_current_version?: boolean
          mime_type?: string | null
          org_id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          retention_policy_days?: number | null
          storage_bucket?: string
          storage_path?: string
          storage_url?: string
          updated_at?: string
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_metadata_compliance_item_id_fkey"
            columns: ["compliance_item_id"]
            isOneToOne: false
            referencedRelation: "compliance_items"
            referencedColumns: ["id"]
          },
        ]
      }
      environment_snapshot: {
        Row: {
          captured_at: string
          id: string
          notams: Json | null
          org_id: string
          source_system: string | null
          traffic: Json | null
          weather: Json | null
        }
        Insert: {
          captured_at?: string
          id?: string
          notams?: Json | null
          org_id: string
          source_system?: string | null
          traffic?: Json | null
          weather?: Json | null
        }
        Update: {
          captured_at?: string
          id?: string
          notams?: Json | null
          org_id?: string
          source_system?: string | null
          traffic?: Json | null
          weather?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "environment_snapshot_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_log: {
        Row: {
          ai_action_id: string | null
          category: string
          confidence_score: number | null
          created_at: string
          decision_context: Json | null
          id: string
          message: string | null
          metadata: Json | null
          org_id: string
          type: string
          user_id: string | null
        }
        Insert: {
          ai_action_id?: string | null
          category: string
          confidence_score?: number | null
          created_at?: string
          decision_context?: Json | null
          id?: string
          message?: string | null
          metadata?: Json | null
          org_id: string
          type: string
          user_id?: string | null
        }
        Update: {
          ai_action_id?: string | null
          category?: string
          confidence_score?: number | null
          created_at?: string
          decision_context?: Json | null
          id?: string
          message?: string | null
          metadata?: Json | null
          org_id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_log_ai_action_id_fkey"
            columns: ["ai_action_id"]
            isOneToOne: false
            referencedRelation: "ai_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      external_crm_sync: {
        Row: {
          created_at: string
          error_details: string | null
          external_crm_type: string
          external_id: string
          id: string
          last_sync_at: string | null
          lead_id: string | null
          org_id: string
          sync_direction: string
          sync_status: string
        }
        Insert: {
          created_at?: string
          error_details?: string | null
          external_crm_type: string
          external_id: string
          id?: string
          last_sync_at?: string | null
          lead_id?: string | null
          org_id: string
          sync_direction: string
          sync_status?: string
        }
        Update: {
          created_at?: string
          error_details?: string | null
          external_crm_type?: string
          external_id?: string
          id?: string
          last_sync_at?: string | null
          lead_id?: string | null
          org_id?: string
          sync_direction?: string
          sync_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_crm_sync_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
      flight_hours_log: {
        Row: {
          aircraft_id: string
          assignment_id: string | null
          flight_date: string
          flight_duration_hours: number
          flight_type: string | null
          id: string
          instructor_id: string
          is_cross_country: boolean | null
          is_instrument: boolean | null
          is_night_flight: boolean | null
          landings: number | null
          logged_at: string | null
          logged_by: string | null
          org_id: string
          remarks: string | null
          student_id: string
          takeoffs: number | null
        }
        Insert: {
          aircraft_id: string
          assignment_id?: string | null
          flight_date: string
          flight_duration_hours: number
          flight_type?: string | null
          id?: string
          instructor_id: string
          is_cross_country?: boolean | null
          is_instrument?: boolean | null
          is_night_flight?: boolean | null
          landings?: number | null
          logged_at?: string | null
          logged_by?: string | null
          org_id: string
          remarks?: string | null
          student_id: string
          takeoffs?: number | null
        }
        Update: {
          aircraft_id?: string
          assignment_id?: string | null
          flight_date?: string
          flight_duration_hours?: number
          flight_type?: string | null
          id?: string
          instructor_id?: string
          is_cross_country?: boolean | null
          is_instrument?: boolean | null
          is_night_flight?: boolean | null
          landings?: number | null
          logged_at?: string | null
          logged_by?: string | null
          org_id?: string
          remarks?: string | null
          student_id?: string
          takeoffs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_hours_log_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "roster_assignment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_hours_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      flight_sessions: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          aircraft_id: string | null
          arrival_airport: string | null
          created_at: string
          departure_airport: string | null
          flight_date: string
          flight_phases: Json | null
          flight_time: number | null
          flight_type: string
          fuel_used: number | null
          id: string
          instructor_id: string | null
          lesson_plan: string | null
          org_id: string
          roster_assignment_id: string | null
          route: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          session_ref: string
          status: string
          student_id: string | null
          telemetry_ingested: boolean | null
          telemetry_ingested_at: string | null
          updated_at: string
          weather_conditions: Json | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          aircraft_id?: string | null
          arrival_airport?: string | null
          created_at?: string
          departure_airport?: string | null
          flight_date: string
          flight_phases?: Json | null
          flight_time?: number | null
          flight_type: string
          fuel_used?: number | null
          id?: string
          instructor_id?: string | null
          lesson_plan?: string | null
          org_id: string
          roster_assignment_id?: string | null
          route?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          session_ref: string
          status?: string
          student_id?: string | null
          telemetry_ingested?: boolean | null
          telemetry_ingested_at?: string | null
          updated_at?: string
          weather_conditions?: Json | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          aircraft_id?: string | null
          arrival_airport?: string | null
          created_at?: string
          departure_airport?: string | null
          flight_date?: string
          flight_phases?: Json | null
          flight_time?: number | null
          flight_type?: string
          fuel_used?: number | null
          id?: string
          instructor_id?: string | null
          lesson_plan?: string | null
          org_id?: string
          roster_assignment_id?: string | null
          route?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          session_ref?: string
          status?: string
          student_id?: string | null
          telemetry_ingested?: boolean | null
          telemetry_ingested_at?: string | null
          updated_at?: string
          weather_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_sessions_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_sessions_roster_assignment_id_fkey"
            columns: ["roster_assignment_id"]
            isOneToOne: false
            referencedRelation: "roster_assignment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_telemetry: {
        Row: {
          aileron_position: number | null
          airspeed: number | null
          altitude_agl: number | null
          altitude_msl: number | null
          autopilot_engaged: boolean | null
          com1_frequency: number | null
          com2_frequency: number | null
          cylinder_head_temp: number | null
          elevator_position: number | null
          engine_rpm: number | null
          exceedance_flags: Json | null
          exhaust_gas_temp: number | null
          flight_phase: string | null
          flight_session_id: string
          fuel_flow: number | null
          g_force_lateral: number | null
          g_force_longitudinal: number | null
          g_force_vertical: number | null
          groundspeed: number | null
          heading: number | null
          latitude: number | null
          longitude: number | null
          manifold_pressure: number | null
          nav1_frequency: number | null
          nav2_frequency: number | null
          oil_pressure: number | null
          oil_temperature: number | null
          org_id: string
          outside_air_temp: number | null
          rudder_position: number | null
          throttle_position: number | null
          time: string
          track: number | null
          transponder_code: number | null
          vertical_speed: number | null
          visibility: number | null
          wind_direction: number | null
          wind_speed: number | null
        }
        Insert: {
          aileron_position?: number | null
          airspeed?: number | null
          altitude_agl?: number | null
          altitude_msl?: number | null
          autopilot_engaged?: boolean | null
          com1_frequency?: number | null
          com2_frequency?: number | null
          cylinder_head_temp?: number | null
          elevator_position?: number | null
          engine_rpm?: number | null
          exceedance_flags?: Json | null
          exhaust_gas_temp?: number | null
          flight_phase?: string | null
          flight_session_id: string
          fuel_flow?: number | null
          g_force_lateral?: number | null
          g_force_longitudinal?: number | null
          g_force_vertical?: number | null
          groundspeed?: number | null
          heading?: number | null
          latitude?: number | null
          longitude?: number | null
          manifold_pressure?: number | null
          nav1_frequency?: number | null
          nav2_frequency?: number | null
          oil_pressure?: number | null
          oil_temperature?: number | null
          org_id: string
          outside_air_temp?: number | null
          rudder_position?: number | null
          throttle_position?: number | null
          time: string
          track?: number | null
          transponder_code?: number | null
          vertical_speed?: number | null
          visibility?: number | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Update: {
          aileron_position?: number | null
          airspeed?: number | null
          altitude_agl?: number | null
          altitude_msl?: number | null
          autopilot_engaged?: boolean | null
          com1_frequency?: number | null
          com2_frequency?: number | null
          cylinder_head_temp?: number | null
          elevator_position?: number | null
          engine_rpm?: number | null
          exceedance_flags?: Json | null
          exhaust_gas_temp?: number | null
          flight_phase?: string | null
          flight_session_id?: string
          fuel_flow?: number | null
          g_force_lateral?: number | null
          g_force_longitudinal?: number | null
          g_force_vertical?: number | null
          groundspeed?: number | null
          heading?: number | null
          latitude?: number | null
          longitude?: number | null
          manifold_pressure?: number | null
          nav1_frequency?: number | null
          nav2_frequency?: number | null
          oil_pressure?: number | null
          oil_temperature?: number | null
          org_id?: string
          outside_air_temp?: number | null
          rudder_position?: number | null
          throttle_position?: number | null
          time?: string
          track?: number | null
          transponder_code?: number | null
          vertical_speed?: number | null
          visibility?: number | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_telemetry_flight_session_id_fkey"
            columns: ["flight_session_id"]
            isOneToOne: false
            referencedRelation: "flight_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_configs: {
        Row: {
          api_endpoint: string | null
          auth_config: Json | null
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          last_sync_at: string | null
          org_id: string
          provider_name: string
          sync_frequency: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          auth_config?: Json | null
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean
          last_sync_at?: string | null
          org_id: string
          provider_name: string
          sync_frequency?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          auth_config?: Json | null
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean
          last_sync_at?: string | null
          org_id?: string
          provider_name?: string
          sync_frequency?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      integration_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_data: Json | null
          event_type: string
          id: string
          integration_id: string | null
          org_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          integration_id?: string | null
          org_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          integration_id?: string | null
          org_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "org_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string
          duration_minutes: number | null
          id: string
          lead_id: string
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          org_id: string
          outcome: string | null
          performed_by: string | null
        }
        Insert: {
          activity_date?: string
          activity_type: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          lead_id: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          org_id: string
          outcome?: string | null
          performed_by?: string | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          lead_id?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          org_id?: string
          outcome?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          conversion_probability: number | null
          created_at: string
          email: string
          expected_start_date: string | null
          id: string
          lead_temperature: string | null
          marketing_source: string | null
          name: string
          notes: string | null
          org_id: string
          phone: string | null
          pipeline_stage: string | null
          referral_source: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          conversion_probability?: number | null
          created_at?: string
          email: string
          expected_start_date?: string | null
          id?: string
          lead_temperature?: string | null
          marketing_source?: string | null
          name: string
          notes?: string | null
          org_id: string
          phone?: string | null
          pipeline_stage?: string | null
          referral_source?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          conversion_probability?: number | null
          created_at?: string
          email?: string
          expected_start_date?: string | null
          id?: string
          lead_temperature?: string | null
          marketing_source?: string | null
          name?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          pipeline_stage?: string | null
          referral_source?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_catalog: {
        Row: {
          created_at: string
          description: string | null
          duration_min: number
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          program: string
          requirements: Json
          stage: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_min: number
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          program: string
          requirements?: Json
          stage?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_min?: number
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          program?: string
          requirements?: Json
          stage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_catalog_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_events: {
        Row: {
          aircraft_id: string
          certifying_signature: string | null
          completed_at: string | null
          cost: number | null
          created_at: string
          description: string
          event_type: string
          hours_at_maintenance: number | null
          id: string
          maintenance_type: string
          next_due_date: string | null
          next_due_hours: number | null
          org_id: string
          parts_used: Json | null
          performed_by: string | null
          regulatory_ref: string | null
          scheduled_date: string | null
          started_at: string | null
          status: string
          updated_at: string
          work_order_ref: string | null
        }
        Insert: {
          aircraft_id: string
          certifying_signature?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          description: string
          event_type: string
          hours_at_maintenance?: number | null
          id?: string
          maintenance_type: string
          next_due_date?: string | null
          next_due_hours?: number | null
          org_id: string
          parts_used?: Json | null
          performed_by?: string | null
          regulatory_ref?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          work_order_ref?: string | null
        }
        Update: {
          aircraft_id?: string
          certifying_signature?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          description?: string
          event_type?: string
          hours_at_maintenance?: number | null
          id?: string
          maintenance_type?: string
          next_due_date?: string | null
          next_due_hours?: number | null
          org_id?: string
          parts_used?: Json | null
          performed_by?: string | null
          regulatory_ref?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          work_order_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_events_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_predictions: {
        Row: {
          aircraft_id: string
          component_name: string | null
          confidence_score: number | null
          created_at: string
          id: string
          model_version: string | null
          org_id: string
          predicted_date: string
          prediction_type: string
          reasoning: string | null
          risk_level: string
          training_data_cutoff: string | null
        }
        Insert: {
          aircraft_id: string
          component_name?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          model_version?: string | null
          org_id: string
          predicted_date: string
          prediction_type: string
          reasoning?: string | null
          risk_level: string
          training_data_cutoff?: string | null
        }
        Update: {
          aircraft_id?: string
          component_name?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          model_version?: string | null
          org_id?: string
          predicted_date?: string
          prediction_type?: string
          reasoning?: string | null
          risk_level?: string
          training_data_cutoff?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_predictions_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_recordings: {
        Row: {
          assignment_id: string | null
          cloud_storage_url: string | null
          created_at: string
          duration_minutes: number | null
          file_size_mb: number | null
          id: string
          meeting_id: string
          meeting_platform: string
          org_id: string
          recording_url: string | null
          transcript: string | null
          uploaded_at: string | null
        }
        Insert: {
          assignment_id?: string | null
          cloud_storage_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          file_size_mb?: number | null
          id?: string
          meeting_id: string
          meeting_platform: string
          org_id: string
          recording_url?: string | null
          transcript?: string | null
          uploaded_at?: string | null
        }
        Update: {
          assignment_id?: string | null
          cloud_storage_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          file_size_mb?: number | null
          id?: string
          meeting_id?: string
          meeting_platform?: string
          org_id?: string
          recording_url?: string | null
          transcript?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_recordings_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "roster_assignment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_recordings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      milestone_templates: {
        Row: {
          course_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          milestone_id: string
          milestone_name: string
          order_sequence: number
          prerequisite_milestones: string[] | null
          required_cross_country_hours: number
          required_hours: number
          required_instrument_hours: number
          required_night_hours: number
          required_solo_hours: number
        }
        Insert: {
          course_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          milestone_id: string
          milestone_name: string
          order_sequence: number
          prerequisite_milestones?: string[] | null
          required_cross_country_hours?: number
          required_hours?: number
          required_instrument_hours?: number
          required_night_hours?: number
          required_solo_hours?: number
        }
        Update: {
          course_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          milestone_id?: string
          milestone_name?: string
          order_sequence?: number
          prerequisite_milestones?: string[] | null
          required_cross_country_hours?: number
          required_hours?: number
          required_instrument_hours?: number
          required_night_hours?: number
          required_solo_hours?: number
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
      org_integrations: {
        Row: {
          created_at: string
          created_by: string | null
          credentials: Json | null
          id: string
          integration_name: string
          integration_type: string
          last_sync_at: string | null
          org_id: string
          settings: Json | null
          status: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          credentials?: Json | null
          id?: string
          integration_name: string
          integration_type: string
          last_sync_at?: string | null
          org_id: string
          settings?: Json | null
          status?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          credentials?: Json | null
          id?: string
          integration_name?: string
          integration_type?: string
          last_sync_at?: string | null
          org_id?: string
          settings?: Json | null
          status?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      report_history: {
        Row: {
          date_range_end: string | null
          date_range_start: string | null
          error_message: string | null
          file_format: string | null
          file_size_kb: number | null
          file_url: string | null
          filters_applied: Json | null
          generated_at: string | null
          generated_by: string | null
          id: string
          org_id: string
          report_name: string
          report_type: string
          row_count: number | null
          status: string | null
          template_id: string | null
        }
        Insert: {
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          file_format?: string | null
          file_size_kb?: number | null
          file_url?: string | null
          filters_applied?: Json | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          org_id: string
          report_name: string
          report_type: string
          row_count?: number | null
          status?: string | null
          template_id?: string | null
        }
        Update: {
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          file_format?: string | null
          file_size_kb?: number | null
          file_url?: string | null
          filters_applied?: Json | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          org_id?: string
          report_name?: string
          report_type?: string
          row_count?: number | null
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_history_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          created_at: string | null
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          org_id: string
          recipients: Json | null
          schedule_name: string
          template_id: string | null
          time_of_day: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          org_id: string
          recipients?: Json | null
          schedule_name: string
          template_id?: string | null
          time_of_day?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          org_id?: string
          recipients?: Json | null
          schedule_name?: string
          template_id?: string | null
          time_of_day?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          format: string | null
          id: string
          is_active: boolean | null
          is_ai_enabled: boolean | null
          name: string
          org_id: string
          regulatory_authority: string | null
          report_type: string
          template_config: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          is_ai_enabled?: boolean | null
          name: string
          org_id: string
          regulatory_authority?: string | null
          report_type: string
          template_config?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          is_ai_enabled?: boolean | null
          name?: string
          org_id?: string
          regulatory_authority?: string | null
          report_type?: string
          template_config?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      roster_alternative_solutions: {
        Row: {
          alternative_assignment: Json
          created_at: string
          generated_at: string
          id: string
          org_id: string
          original_assignment_id: string | null
          score_breakdown: Json
          status: string
          trigger_details: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          alternative_assignment?: Json
          created_at?: string
          generated_at?: string
          id?: string
          org_id: string
          original_assignment_id?: string | null
          score_breakdown?: Json
          status?: string
          trigger_details?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          alternative_assignment?: Json
          created_at?: string
          generated_at?: string
          id?: string
          org_id?: string
          original_assignment_id?: string | null
          score_breakdown?: Json
          status?: string
          trigger_details?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_alternative_solutions_original_assignment_id_fkey"
            columns: ["original_assignment_id"]
            isOneToOne: false
            referencedRelation: "roster_assignment"
            referencedColumns: ["id"]
          },
        ]
      }
      roster_assignment: {
        Row: {
          aircraft_id: string | null
          airport_icao: string
          created_at: string
          end_at: string
          feasibility_proof: Json | null
          id: string
          instructor_id: string | null
          lesson_id: string | null
          meeting_id: string | null
          meeting_platform: string | null
          meeting_url: string | null
          org_id: string
          plan_id: string
          recording_url: string | null
          score_breakdown: Json | null
          start_at: string
          status: string
          student_id: string
          sync_state: Json | null
          updated_at: string
        }
        Insert: {
          aircraft_id?: string | null
          airport_icao: string
          created_at?: string
          end_at: string
          feasibility_proof?: Json | null
          id?: string
          instructor_id?: string | null
          lesson_id?: string | null
          meeting_id?: string | null
          meeting_platform?: string | null
          meeting_url?: string | null
          org_id: string
          plan_id: string
          recording_url?: string | null
          score_breakdown?: Json | null
          start_at: string
          status?: string
          student_id: string
          sync_state?: Json | null
          updated_at?: string
        }
        Update: {
          aircraft_id?: string | null
          airport_icao?: string
          created_at?: string
          end_at?: string
          feasibility_proof?: Json | null
          id?: string
          instructor_id?: string | null
          lesson_id?: string | null
          meeting_id?: string | null
          meeting_platform?: string | null
          meeting_url?: string | null
          org_id?: string
          plan_id?: string
          recording_url?: string | null
          score_breakdown?: Json | null
          start_at?: string
          status?: string
          student_id?: string
          sync_state?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_assignment_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignment_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignment_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_assignment_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "roster_plan"
            referencedColumns: ["id"]
          },
        ]
      }
      roster_plan: {
        Row: {
          created_at: string
          id: string
          objective_weights: Json | null
          org_id: string
          period_end: string
          period_start: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          objective_weights?: Json | null
          org_id: string
          period_end: string
          period_start: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          objective_weights?: Json | null
          org_id?: string
          period_end?: string
          period_start?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_plan_org_id_fkey"
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
      sync_logs: {
        Row: {
          detailed_log: Json | null
          error_summary: string | null
          id: string
          integration_config_id: string
          org_id: string
          records_failed: number | null
          records_processed: number | null
          status: string
          sync_completed_at: string | null
          sync_started_at: string
        }
        Insert: {
          detailed_log?: Json | null
          error_summary?: string | null
          id?: string
          integration_config_id: string
          org_id: string
          records_failed?: number | null
          records_processed?: number | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Update: {
          detailed_log?: Json | null
          error_summary?: string | null
          id?: string
          integration_config_id?: string
          org_id?: string
          records_failed?: number | null
          records_processed?: number | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_integration_config_id_fkey"
            columns: ["integration_config_id"]
            isOneToOne: false
            referencedRelation: "integration_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry_batch_logs: {
        Row: {
          batch_size: number
          error_details: string | null
          flight_session_id: string
          id: string
          ingestion_completed_at: string | null
          ingestion_started_at: string
          org_id: string
          source_system: string
          status: string
        }
        Insert: {
          batch_size: number
          error_details?: string | null
          flight_session_id: string
          id?: string
          ingestion_completed_at?: string | null
          ingestion_started_at?: string
          org_id: string
          source_system?: string
          status?: string
        }
        Update: {
          batch_size?: number
          error_details?: string | null
          flight_session_id?: string
          id?: string
          ingestion_completed_at?: string | null
          ingestion_started_at?: string
          org_id?: string
          source_system?: string
          status?: string
        }
        Relationships: []
      }
      telemetry_data_points: {
        Row: {
          created_at: string
          exceedance_flag: boolean | null
          flight_session_id: string
          org_id: string
          parameter_id: string
          timestamp: string
          value_boolean: boolean | null
          value_integer: number | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string
          exceedance_flag?: boolean | null
          flight_session_id: string
          org_id: string
          parameter_id: string
          timestamp: string
          value_boolean?: boolean | null
          value_integer?: number | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string
          exceedance_flag?: boolean | null
          flight_session_id?: string
          org_id?: string
          parameter_id?: string
          timestamp?: string
          value_boolean?: boolean | null
          value_integer?: number | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telemetry_data_points_parameter_id_fkey"
            columns: ["parameter_id"]
            isOneToOne: false
            referencedRelation: "telemetry_parameters"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry_parameters: {
        Row: {
          created_at: string
          data_type: string
          description: string | null
          id: string
          max_value: number | null
          min_value: number | null
          parameter_name: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          data_type: string
          description?: string | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter_name: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter_name?: string
          unit?: string | null
        }
        Relationships: []
      }
      trial_flights: {
        Row: {
          aircraft_id: string | null
          conversion_outcome: string | null
          created_at: string
          duration_actual: number | null
          duration_planned: number | null
          flight_session_id: string | null
          flight_type: string
          follow_up_scheduled: string | null
          id: string
          instructor_id: string | null
          instructor_notes: string | null
          lead_id: string
          org_id: string
          scheduled_date: string | null
          student_feedback: string | null
          updated_at: string
        }
        Insert: {
          aircraft_id?: string | null
          conversion_outcome?: string | null
          created_at?: string
          duration_actual?: number | null
          duration_planned?: number | null
          flight_session_id?: string | null
          flight_type?: string
          follow_up_scheduled?: string | null
          id?: string
          instructor_id?: string | null
          instructor_notes?: string | null
          lead_id: string
          org_id: string
          scheduled_date?: string | null
          student_feedback?: string | null
          updated_at?: string
        }
        Update: {
          aircraft_id?: string | null
          conversion_outcome?: string | null
          created_at?: string
          duration_actual?: number | null
          duration_planned?: number | null
          flight_session_id?: string | null
          flight_type?: string
          follow_up_scheduled?: string | null
          id?: string
          instructor_id?: string | null
          instructor_notes?: string | null
          lead_id?: string
          org_id?: string
          scheduled_date?: string | null
          student_feedback?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_flights_flight_session_id_fkey"
            columns: ["flight_session_id"]
            isOneToOne: false
            referencedRelation: "flight_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_flights_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          is_active: boolean
          org_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          org_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          org_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_cache: {
        Row: {
          airport_code: string
          data_type: string
          fetched_at: string
          id: string
          is_current: boolean
          parsed_data: Json | null
          raw_data: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          airport_code: string
          data_type: string
          fetched_at?: string
          id?: string
          is_current?: boolean
          parsed_data?: Json | null
          raw_data: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          airport_code?: string
          data_type?: string
          fetched_at?: string
          id?: string
          is_current?: boolean
          parsed_data?: Json | null
          raw_data?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_org_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          assigned_at: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: { Args: { org_uuid?: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "student"
        | "instructor"
        | "admin"
        | "super_admin"
        | "ops_manager"
        | "maintenance_officer"
        | "compliance_officer"
        | "accounts_officer"
        | "marketing_crm"
        | "support"
        | "pending"
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
    Enums: {
      app_role: [
        "student",
        "instructor",
        "admin",
        "super_admin",
        "ops_manager",
        "maintenance_officer",
        "compliance_officer",
        "accounts_officer",
        "marketing_crm",
        "support",
        "pending",
      ],
    },
  },
} as const
