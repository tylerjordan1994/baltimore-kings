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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_date: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_archived: boolean
          kind: Database["public"]["Enums"]["achievement_kind"]
          photo_url: string | null
          profile_id: string | null
          season: string | null
          team_id: string | null
          title: string
        }
        Insert: {
          achievement_date?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_archived?: boolean
          kind?: Database["public"]["Enums"]["achievement_kind"]
          photo_url?: string | null
          profile_id?: string | null
          season?: string | null
          team_id?: string | null
          title: string
        }
        Update: {
          achievement_date?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_archived?: boolean
          kind?: Database["public"]["Enums"]["achievement_kind"]
          photo_url?: string | null
          profile_id?: string | null
          season?: string | null
          team_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni: {
        Row: {
          created_at: string
          current_country: string | null
          current_status: Database["public"]["Enums"]["alumni_status"]
          current_team: string | null
          display_order: number | null
          full_name: string
          id: string
          is_published: boolean
          linked_profile_id: string | null
          notable_history: string | null
          photo_url: string | null
          years_at_kings: string | null
        }
        Insert: {
          created_at?: string
          current_country?: string | null
          current_status?: Database["public"]["Enums"]["alumni_status"]
          current_team?: string | null
          display_order?: number | null
          full_name: string
          id?: string
          is_published?: boolean
          linked_profile_id?: string | null
          notable_history?: string | null
          photo_url?: string | null
          years_at_kings?: string | null
        }
        Update: {
          created_at?: string
          current_country?: string | null
          current_status?: Database["public"]["Enums"]["alumni_status"]
          current_team?: string | null
          display_order?: number | null
          full_name?: string
          id?: string
          is_published?: boolean
          linked_profile_id?: string | null
          notable_history?: string | null
          photo_url?: string | null
          years_at_kings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumni_linked_profile_id_fkey"
            columns: ["linked_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          position_preference: string | null
          prior_teams: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          position_preference?: string | null
          prior_teams?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          position_preference?: string | null
          prior_teams?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          calendar_event_id: string
          id: string
          marked_at: string
          marked_by: string | null
          notes: string | null
          profile_id: string
          status: string
        }
        Insert: {
          calendar_event_id: string
          id?: string
          marked_at?: string
          marked_by?: string | null
          notes?: string | null
          profile_id: string
          status?: string
        }
        Update: {
          calendar_event_id?: string
          id?: string
          marked_at?: string
          marked_by?: string | null
          notes?: string | null
          profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_profile_id: string | null
          created_at: string
          diff_json: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          created_at?: string
          diff_json?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string
          diff_json?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_assets: {
        Row: {
          id: string
          logo_full_url: string | null
          logo_mark_url: string | null
          logo_mono_url: string | null
          logo_white_url: string | null
          og_image_url: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          logo_full_url?: string | null
          logo_mark_url?: string | null
          logo_mono_url?: string | null
          logo_white_url?: string | null
          og_image_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          logo_full_url?: string | null
          logo_mark_url?: string | null
          logo_mono_url?: string | null
          logo_white_url?: string | null
          og_image_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_assets_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          heja_event_url: string | null
          id: string
          kind: Database["public"]["Enums"]["event_kind"]
          location: string | null
          starts_at: string
          team_ids: string[] | null
          title: string
          visibility: Database["public"]["Enums"]["event_visibility"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          heja_event_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["event_kind"]
          location?: string | null
          starts_at: string
          team_ids?: string[] | null
          title: string
          visibility?: Database["public"]["Enums"]["event_visibility"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          heja_event_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["event_kind"]
          location?: string | null
          starts_at?: string
          team_ids?: string[] | null
          title?: string
          visibility?: Database["public"]["Enums"]["event_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conduct_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          incident_date: string | null
          reporter_id: string | null
          status: string
          subject_profile_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          incident_date?: string | null
          reporter_id?: string | null
          status?: string
          subject_profile_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          incident_date?: string | null
          reporter_id?: string | null
          status?: string
          subject_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conduct_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conduct_reports_subject_profile_id_fkey"
            columns: ["subject_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_assignments: {
        Row: {
          assigned_at: string
          contract_id: string
          id: string
          profile_id: string
          status: Database["public"]["Enums"]["contract_assignment_status"]
        }
        Insert: {
          assigned_at?: string
          contract_id: string
          id?: string
          profile_id: string
          status?: Database["public"]["Enums"]["contract_assignment_status"]
        }
        Update: {
          assigned_at?: string
          contract_id?: string
          id?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["contract_assignment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "contract_assignments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatures: {
        Row: {
          contract_assignment_id: string
          id: string
          ip_address: string | null
          pdf_storage_path: string | null
          signature_text: string
          signed_at: string
        }
        Insert: {
          contract_assignment_id: string
          id?: string
          ip_address?: string | null
          pdf_storage_path?: string | null
          signature_text: string
          signed_at?: string
        }
        Update: {
          contract_assignment_id?: string
          id?: string
          ip_address?: string | null
          pdf_storage_path?: string | null
          signature_text?: string
          signed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_contract_assignment_id_fkey"
            columns: ["contract_assignment_id"]
            isOneToOne: false
            referencedRelation: "contract_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          applies_to: Database["public"]["Enums"]["contract_applies_to"]
          body_markdown: string
          created_at: string
          created_by: string | null
          effective_date: string
          expiration_date: string | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["contract_kind"]
          team_id: string | null
          title: string
        }
        Insert: {
          applies_to?: Database["public"]["Enums"]["contract_applies_to"]
          body_markdown: string
          created_at?: string
          created_by?: string | null
          effective_date?: string
          expiration_date?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["contract_kind"]
          team_id?: string | null
          title: string
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["contract_applies_to"]
          body_markdown?: string
          created_at?: string
          created_by?: string | null
          effective_date?: string
          expiration_date?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["contract_kind"]
          team_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          filename: string
          id: string
          kind: Database["public"]["Enums"]["document_kind"]
          profile_id: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          filename: string
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          profile_id: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          filename?: string
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          profile_id?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_periods: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_periods_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          areas_for_growth: string | null
          created_at: string
          evaluation_date: string
          evaluator_id: string
          id: string
          is_shared_with_player: boolean
          mental_rating: number | null
          notes: string | null
          period: string | null
          physical_rating: number | null
          profile_id: string
          strengths: string | null
          tactical_rating: number | null
          tags: string[]
          technical_rating: number | null
        }
        Insert: {
          areas_for_growth?: string | null
          created_at?: string
          evaluation_date?: string
          evaluator_id: string
          id?: string
          is_shared_with_player?: boolean
          mental_rating?: number | null
          notes?: string | null
          period?: string | null
          physical_rating?: number | null
          profile_id: string
          strengths?: string | null
          tactical_rating?: number | null
          tags?: string[]
          technical_rating?: number | null
        }
        Update: {
          areas_for_growth?: string | null
          created_at?: string
          evaluation_date?: string
          evaluator_id?: string
          id?: string
          is_shared_with_player?: boolean
          mental_rating?: number | null
          notes?: string | null
          period?: string | null
          physical_rating?: number | null
          profile_id?: string
          strengths?: string | null
          tactical_rating?: number | null
          tags?: string[]
          technical_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_items: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          id: string
          is_paid: boolean
          payment_id: string | null
          profile_id: string | null
          purpose: Database["public"]["Enums"]["payment_purpose"]
          team_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by?: string | null
          description: string
          due_date?: string | null
          id?: string
          is_paid?: boolean
          payment_id?: string | null
          profile_id?: string | null
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          team_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          is_paid?: boolean
          payment_id?: string | null
          profile_id?: string | null
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_items_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_items_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_areas: {
        Row: {
          category: Database["public"]["Enums"]["focus_category"]
          created_at: string
          default_for_positions: string[] | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["focus_category"]
          created_at?: string
          default_for_positions?: string[] | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["focus_category"]
          created_at?: string
          default_for_positions?: string[] | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      game_participations: {
        Row: {
          assists: number | null
          game_id: string
          goals: number | null
          id: string
          minutes: number | null
          notes: string | null
          profile_id: string
        }
        Insert: {
          assists?: number | null
          game_id: string
          goals?: number | null
          id?: string
          minutes?: number | null
          notes?: string | null
          profile_id: string
        }
        Update: {
          assists?: number | null
          game_id?: string
          goals?: number | null
          id?: string
          minutes?: number | null
          notes?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_participations_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_participations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          external_id: string | null
          external_source: string | null
          home_or_away: string
          id: string
          location: string | null
          notes: string | null
          opponent: string
          result: string | null
          score_against: number | null
          score_for: number | null
          scouting_notes_markdown: string | null
          scouting_notes_published_at: string | null
          season: string | null
          starts_at: string
          team_id: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          home_or_away: string
          id?: string
          location?: string | null
          notes?: string | null
          opponent: string
          result?: string | null
          score_against?: number | null
          score_for?: number | null
          scouting_notes_markdown?: string | null
          scouting_notes_published_at?: string | null
          season?: string | null
          starts_at: string
          team_id: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          home_or_away?: string
          id?: string
          location?: string | null
          notes?: string | null
          opponent?: string
          result?: string | null
          score_against?: number | null
          score_for?: number | null
          scouting_notes_markdown?: string | null
          scouting_notes_published_at?: string | null
          season?: string | null
          starts_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      learn_pages: {
        Row: {
          body_markdown: string | null
          category: string | null
          cover_image_url: string | null
          created_by: string | null
          id: string
          is_public: boolean
          order_index: number | null
          parent_slug: string | null
          reference_url: string | null
          requires_member: boolean
          slug: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body_markdown?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean
          order_index?: number | null
          parent_slug?: string | null
          reference_url?: string | null
          requires_member?: boolean
          slug: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body_markdown?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean
          order_index?: number | null
          parent_slug?: string | null
          reference_url?: string | null
          requires_member?: boolean
          slug?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learn_pages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          taken_at: string | null
          team_id: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          taken_at?: string | null
          team_id?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          taken_at?: string | null
          team_id?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_items_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_items_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_signups: {
        Row: {
          audience: string
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          audience?: string
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          audience?: string
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      orientations: {
        Row: {
          coach_approved_at: string | null
          coach_approved_by: string | null
          completed_at: string | null
          current_step: number
          id: string
          profile_id: string
          started_at: string
          steps_completed: Json
        }
        Insert: {
          coach_approved_at?: string | null
          coach_approved_by?: string | null
          completed_at?: string | null
          current_step?: number
          id?: string
          profile_id: string
          started_at?: string
          steps_completed?: Json
        }
        Update: {
          coach_approved_at?: string | null
          coach_approved_by?: string | null
          completed_at?: string | null
          current_step?: number
          id?: string
          profile_id?: string
          started_at?: string
          steps_completed?: Json
        }
        Relationships: [
          {
            foreignKeyName: "orientations_coach_approved_by_fkey"
            columns: ["coach_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orientations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          id: string
          paid_at: string | null
          profile_id: string
          purpose: Database["public"]["Enums"]["payment_purpose"]
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          profile_id: string
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          profile_id?: string
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_club_history: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          note: string | null
          profile_id: string
          team: string
          year_label: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          note?: string | null
          profile_id: string
          team: string
          year_label: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          note?: string | null
          profile_id?: string
          team?: string
          year_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_club_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_club_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_goals: {
        Row: {
          coach_feedback: string | null
          goal_text: string
          id: string
          profile_id: string
          season: string | null
          set_at: string
          status: Database["public"]["Enums"]["goal_status"]
          updated_at: string
        }
        Insert: {
          coach_feedback?: string | null
          goal_text: string
          id?: string
          profile_id: string
          season?: string | null
          set_at?: string
          status?: Database["public"]["Enums"]["goal_status"]
          updated_at?: string
        }
        Update: {
          coach_feedback?: string | null
          goal_text?: string
          id?: string
          profile_id?: string
          season?: string | null
          set_at?: string
          status?: Database["public"]["Enums"]["goal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_goals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          also_plays: boolean
          also_plays_for_steaks: boolean
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          hometown: string | null
          id: string
          inactive_notes: string | null
          inactive_reasons: string[] | null
          is_minor: boolean
          jersey_number: number | null
          made_inactive_at: string | null
          made_inactive_by: string | null
          masl3_player_id: string | null
          nickname: string | null
          phone: string | null
          photo_url: string | null
          position_primary: string | null
          position_secondary: string | null
          role: Database["public"]["Enums"]["user_role"]
          school: string | null
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
          years_in_club: number | null
        }
        Insert: {
          also_plays?: boolean
          also_plays_for_steaks?: boolean
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          hometown?: string | null
          id: string
          inactive_notes?: string | null
          inactive_reasons?: string[] | null
          is_minor?: boolean
          jersey_number?: number | null
          made_inactive_at?: string | null
          made_inactive_by?: string | null
          masl3_player_id?: string | null
          nickname?: string | null
          phone?: string | null
          photo_url?: string | null
          position_primary?: string | null
          position_secondary?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          years_in_club?: number | null
        }
        Update: {
          also_plays?: boolean
          also_plays_for_steaks?: boolean
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          hometown?: string | null
          id?: string
          inactive_notes?: string | null
          inactive_reasons?: string[] | null
          is_minor?: boolean
          jersey_number?: number | null
          made_inactive_at?: string | null
          made_inactive_by?: string | null
          masl3_player_id?: string | null
          nickname?: string | null
          phone?: string | null
          photo_url?: string | null
          position_primary?: string | null
          position_secondary?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          years_in_club?: number | null
        }
        Relationships: []
      }
      prospects: {
        Row: {
          assessment: string | null
          contact: string | null
          created_at: string
          current_team: string | null
          email: string | null
          event: string | null
          full_name: string
          id: string
          phone: string | null
          position: string | null
          priority: Database["public"]["Enums"]["prospect_priority"]
          scouted_at: string | null
          scouted_by: string | null
        }
        Insert: {
          assessment?: string | null
          contact?: string | null
          created_at?: string
          current_team?: string | null
          email?: string | null
          event?: string | null
          full_name: string
          id?: string
          phone?: string | null
          position?: string | null
          priority?: Database["public"]["Enums"]["prospect_priority"]
          scouted_at?: string | null
          scouted_by?: string | null
        }
        Update: {
          assessment?: string | null
          contact?: string | null
          created_at?: string
          current_team?: string | null
          email?: string | null
          event?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          priority?: Database["public"]["Enums"]["prospect_priority"]
          scouted_at?: string | null
          scouted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospects_scouted_by_fkey"
            columns: ["scouted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_signatures: {
        Row: {
          id: string
          ip_address: string | null
          profile_id: string
          requirement_id: string
          signature_text: string
          signed_at: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          profile_id: string
          requirement_id: string
          signature_text: string
          signed_at?: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          profile_id?: string
          requirement_id?: string
          signature_text?: string
          signed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_signatures_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_signatures_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          body_markdown: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          title: string
          version: number
        }
        Insert: {
          body_markdown: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          title: string
          version?: number
        }
        Update: {
          body_markdown?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "requirements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          end_date: string | null
          id: string
          name: string
          start_date: string
          summary: string | null
          team_id: string
        }
        Insert: {
          end_date?: string | null
          id?: string
          name: string
          start_date: string
          summary?: string | null
          team_id: string
        }
        Update: {
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string
          summary?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasons_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          caption: string | null
          embed_html: string | null
          external_url: string | null
          id: string
          media_url: string | null
          posted_at: string | null
          source: string
          synced_at: string | null
        }
        Insert: {
          caption?: string | null
          embed_html?: string | null
          external_url?: string | null
          id?: string
          media_url?: string | null
          posted_at?: string | null
          source?: string
          synced_at?: string | null
        }
        Update: {
          caption?: string | null
          embed_html?: string | null
          external_url?: string | null
          id?: string
          media_url?: string | null
          posted_at?: string | null
          source?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          order_index: number | null
          placements: string[] | null
          tier: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          order_index?: number | null
          placements?: string[] | null
          tier?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          order_index?: number | null
          placements?: string[] | null
          tier?: string
          website_url?: string | null
        }
        Relationships: []
      }
      superadmin_allowlist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      tactics_board_teams: {
        Row: {
          board_id: string
          team_id: string
        }
        Insert: {
          board_id: string
          team_id: string
        }
        Update: {
          board_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tactics_board_teams_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "tactics_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tactics_board_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tactics_boards: {
        Row: {
          created_at: string
          created_by: string | null
          field_type: Database["public"]["Enums"]["field_type"]
          id: string
          is_published: boolean
          kind: Database["public"]["Enums"]["tactics_kind"]
          name: string
          preview_image_url: string | null
          state_json: Json
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          field_type?: Database["public"]["Enums"]["field_type"]
          id?: string
          is_published?: boolean
          kind?: Database["public"]["Enums"]["tactics_kind"]
          name: string
          preview_image_url?: string | null
          state_json?: Json
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          field_type?: Database["public"]["Enums"]["field_type"]
          id?: string
          is_published?: boolean
          kind?: Database["public"]["Enums"]["tactics_kind"]
          name?: string
          preview_image_url?: string | null
          state_json?: Json
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tactics_boards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tactics_boards_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          is_active: boolean
          jersey_number_for_team: number | null
          joined_at: string
          position: string | null
          profile_id: string
          roster_position: Database["public"]["Enums"]["roster_position"]
          team_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          jersey_number_for_team?: number | null
          joined_at?: string
          position?: string | null
          profile_id: string
          roster_position?: Database["public"]["Enums"]["roster_position"]
          team_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          jersey_number_for_team?: number | null
          joined_at?: string
          position?: string | null
          profile_id?: string
          roster_position?: Database["public"]["Enums"]["roster_position"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          display_order: number | null
          field_type: Database["public"]["Enums"]["field_type"]
          id: string
          is_active: boolean
          league: Database["public"]["Enums"]["league_type"]
          name: string
          season: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          field_type?: Database["public"]["Enums"]["field_type"]
          id?: string
          is_active?: boolean
          league: Database["public"]["Enums"]["league_type"]
          name: string
          season?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          field_type?: Database["public"]["Enums"]["field_type"]
          id?: string
          is_active?: boolean
          league?: Database["public"]["Enums"]["league_type"]
          name?: string
          season?: string | null
          slug?: string
        }
        Relationships: []
      }
      ticketed_events: {
        Row: {
          capacity: number | null
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string | null
          id: string
          image_url: string | null
          is_published: boolean
          price_cents: number
          stripe_price_id: string | null
          title: string
          venue: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          price_cents?: number
          stripe_price_id?: string | null
          title: string
          venue?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          price_cents?: number
          stripe_price_id?: string | null
          title?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticketed_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          amount_cents: number | null
          id: string
          purchased_at: string
          purchaser_email: string | null
          purchaser_name: string | null
          quantity: number
          status: string
          stripe_session_id: string | null
          ticket_code: string
          ticketed_event_id: string
        }
        Insert: {
          amount_cents?: number | null
          id?: string
          purchased_at?: string
          purchaser_email?: string | null
          purchaser_name?: string | null
          quantity?: number
          status?: string
          stripe_session_id?: string | null
          ticket_code: string
          ticketed_event_id: string
        }
        Update: {
          amount_cents?: number | null
          id?: string
          purchased_at?: string
          purchaser_email?: string | null
          purchaser_name?: string | null
          quantity?: number
          status?: string
          stripe_session_id?: string | null
          ticket_code?: string
          ticketed_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_ticketed_event_id_fkey"
            columns: ["ticketed_event_id"]
            isOneToOne: false
            referencedRelation: "ticketed_events"
            referencedColumns: ["id"]
          },
        ]
      }
      training_assignments: {
        Row: {
          assigned_by: string | null
          assigned_to_profile_id: string | null
          assigned_to_team_id: string | null
          attached_document_path: string | null
          attached_youtube_url: string | null
          created_at: string
          due_by: string | null
          focus_area_id: string
          id: string
          is_auto_assigned: boolean
          notes_markdown: string | null
          priority: Database["public"]["Enums"]["training_priority"]
        }
        Insert: {
          assigned_by?: string | null
          assigned_to_profile_id?: string | null
          assigned_to_team_id?: string | null
          attached_document_path?: string | null
          attached_youtube_url?: string | null
          created_at?: string
          due_by?: string | null
          focus_area_id: string
          id?: string
          is_auto_assigned?: boolean
          notes_markdown?: string | null
          priority?: Database["public"]["Enums"]["training_priority"]
        }
        Update: {
          assigned_by?: string | null
          assigned_to_profile_id?: string | null
          assigned_to_team_id?: string | null
          attached_document_path?: string | null
          attached_youtube_url?: string | null
          created_at?: string
          due_by?: string | null
          focus_area_id?: string
          id?: string
          is_auto_assigned?: boolean
          notes_markdown?: string | null
          priority?: Database["public"]["Enums"]["training_priority"]
        }
        Relationships: [
          {
            foreignKeyName: "training_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_assignments_assigned_to_profile_id_fkey"
            columns: ["assigned_to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_assignments_assigned_to_team_id_fkey"
            columns: ["assigned_to_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_assignments_focus_area_id_fkey"
            columns: ["focus_area_id"]
            isOneToOne: false
            referencedRelation: "focus_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress: {
        Row: {
          assignment_id: string
          coach_notes: string | null
          id: string
          player_notes: string | null
          profile_id: string
          status: Database["public"]["Enums"]["training_status"]
          updated_at: string
        }
        Insert: {
          assignment_id: string
          coach_notes?: string | null
          id?: string
          player_notes?: string | null
          profile_id: string
          status?: Database["public"]["Enums"]["training_status"]
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          coach_notes?: string | null
          id?: string
          player_notes?: string | null
          profile_id?: string
          status?: Database["public"]["Enums"]["training_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "training_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorials: {
        Row: {
          body_markdown: string | null
          category: string | null
          created_at: string
          created_by: string | null
          external_url: string | null
          id: string
          is_published: boolean
          title: string
          youtube_url: string | null
        }
        Insert: {
          body_markdown?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          external_url?: string | null
          id?: string
          is_published?: boolean
          title: string
          youtube_url?: string | null
        }
        Update: {
          body_markdown?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          external_url?: string | null
          id?: string
          is_published?: boolean
          title?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutorials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_coach_or_above: { Args: never; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
    }
    Enums: {
      achievement_kind: "club" | "player"
      alumni_status:
        | "playing_pro_futsal"
        | "playing_pro_indoor"
        | "playing_pro_outdoor"
        | "coaching"
        | "college_level"
        | "national_team"
        | "retired"
        | "other"
      application_status: "new" | "reviewed" | "invited" | "rejected"
      contract_applies_to: "individual" | "team" | "all_active"
      contract_assignment_status: "pending" | "signed" | "expired" | "voided"
      contract_kind:
        | "player_agreement"
        | "coach_agreement"
        | "tryout_waiver"
        | "tournament_release"
        | "code_of_conduct"
        | "other"
      document_kind: "waiver" | "id" | "medical" | "other"
      event_kind:
        | "practice"
        | "home_game"
        | "away_game"
        | "tryout"
        | "meeting"
        | "other"
      event_visibility: "public" | "members_only"
      field_type: "futsal_rounded" | "masl_rounded_extra_player"
      focus_category: "technical" | "tactical" | "physical" | "mental"
      goal_status:
        | "proposed"
        | "approved"
        | "in_progress"
        | "achieved"
        | "revised"
        | "dropped"
      league_type: "masl3" | "masl2" | "futsal_l1" | "futsal_other"
      media_kind: "photo" | "video"
      payment_purpose:
        | "ref_fee"
        | "practice_fee"
        | "dues"
        | "other"
        | "tournament_fee"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      profile_status: "pending" | "active" | "inactive" | "archived" | "injured"
      prospect_priority:
        | "watch"
        | "target"
        | "actively_recruiting"
        | "signed"
        | "passed"
      roster_position: "starter" | "sub" | "reserve"
      tactics_kind: "formation" | "set_piece" | "play"
      training_priority: "low" | "normal" | "high"
      training_status:
        | "not_started"
        | "in_progress"
        | "player_marked_complete"
        | "coach_confirmed"
      user_role: "pending" | "player" | "coach" | "superadmin"
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
      achievement_kind: ["club", "player"],
      alumni_status: [
        "playing_pro_futsal",
        "playing_pro_indoor",
        "playing_pro_outdoor",
        "coaching",
        "college_level",
        "national_team",
        "retired",
        "other",
      ],
      application_status: ["new", "reviewed", "invited", "rejected"],
      contract_applies_to: ["individual", "team", "all_active"],
      contract_assignment_status: ["pending", "signed", "expired", "voided"],
      contract_kind: [
        "player_agreement",
        "coach_agreement",
        "tryout_waiver",
        "tournament_release",
        "code_of_conduct",
        "other",
      ],
      document_kind: ["waiver", "id", "medical", "other"],
      event_kind: [
        "practice",
        "home_game",
        "away_game",
        "tryout",
        "meeting",
        "other",
      ],
      event_visibility: ["public", "members_only"],
      field_type: ["futsal_rounded", "masl_rounded_extra_player"],
      focus_category: ["technical", "tactical", "physical", "mental"],
      goal_status: [
        "proposed",
        "approved",
        "in_progress",
        "achieved",
        "revised",
        "dropped",
      ],
      league_type: ["masl3", "masl2", "futsal_l1", "futsal_other"],
      media_kind: ["photo", "video"],
      payment_purpose: [
        "ref_fee",
        "practice_fee",
        "dues",
        "other",
        "tournament_fee",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      profile_status: ["pending", "active", "inactive", "archived", "injured"],
      prospect_priority: [
        "watch",
        "target",
        "actively_recruiting",
        "signed",
        "passed",
      ],
      roster_position: ["starter", "sub", "reserve"],
      tactics_kind: ["formation", "set_piece", "play"],
      training_priority: ["low", "normal", "high"],
      training_status: [
        "not_started",
        "in_progress",
        "player_marked_complete",
        "coach_confirmed",
      ],
      user_role: ["pending", "player", "coach", "superadmin"],
    },
  },
} as const



// ─────────────────────────────────────────────────────────────
// Convenience aliases — row + enum types used across the app.
// Aliases include optional joined relations (`profiles`, `teams`,
// `games`, `focus_areas`) so embedded Supabase selects type-check.
// ─────────────────────────────────────────────────────────────
type WithProfile<T> = T & { profiles?: Tables<"profiles"> | null }
type WithTeam<T> = T & { teams?: Tables<"teams"> | null }
type WithGame<T> = T & { games?: Tables<"games"> | null }
type WithFocusArea<T> = T & { focus_areas?: Tables<"focus_areas"> | null }

export type Achievement = WithProfile<WithTeam<Tables<"achievements">>>
export type Alumni = Tables<"alumni">
export type Application = Tables<"applications">
export type AttendanceRecord = WithProfile<Tables<"attendance_records">>
export type AuditLog = WithProfile<Tables<"audit_log">>
export type BrandAssets = Tables<"brand_assets">
export type CalendarEvent = Tables<"calendar_events">
export type ConductReport = WithProfile<Tables<"conduct_reports">>
export type Contract = WithTeam<Tables<"contracts">>
export type ContractAssignment = WithProfile<Tables<"contract_assignments">>
export type ContractSignature = WithProfile<Tables<"contract_signatures">>
export type Document = WithProfile<Tables<"documents">>
export type Evaluation = WithProfile<Tables<"evaluations">>
export type FeeItem = WithProfile<WithTeam<Tables<"fee_items">>>
export type FocusArea = Tables<"focus_areas">
export type Game = WithTeam<Tables<"games">>
export type GameParticipation = WithGame<WithProfile<Tables<"game_participations">>>
export type LearnPage = Tables<"learn_pages">
export type MediaItem = WithTeam<Tables<"media_items">>
export type NewsletterSignup = Tables<"newsletter_signups">
export type Orientation = WithProfile<Tables<"orientations">>
export type Payment = WithProfile<Tables<"payments">>
export type PlayerClubHistory = WithProfile<Tables<"player_club_history">>
export type PlayerGoal = WithProfile<Tables<"player_goals">>
export type Profile = Tables<"profiles">
export type Prospect = Tables<"prospects">
export type Requirement = Tables<"requirements">
export type RequirementSignature = WithProfile<Tables<"requirement_signatures">>
export type Season = WithTeam<Tables<"seasons">>
export type SocialPost = Tables<"social_posts">
export type Sponsor = Tables<"sponsors">
export type TacticsBoard = WithTeam<Tables<"tactics_boards">>
export type Team = Tables<"teams">
/**
 * team_members row, optionally carrying joined `profiles` / `teams`
 * relations when selected via Supabase embedding (`*, profiles(*)`).
 */
export type TeamMember = WithProfile<WithTeam<Tables<"team_members">>>
export type TrainingAssignment = WithProfile<WithFocusArea<Tables<"training_assignments">>>
export type TrainingProgress = WithProfile<Tables<"training_progress">>
export type Tutorial = Tables<"tutorials">

// Enum aliases
export type AchievementKind = Enums<"achievement_kind">
export type AlumniStatus = Enums<"alumni_status">
export type ApplicationStatus = Enums<"application_status">
export type ContractAppliesTo = Enums<"contract_applies_to">
export type ContractAssignmentStatus = Enums<"contract_assignment_status">
export type ContractKind = Enums<"contract_kind">
export type DocumentKind = Enums<"document_kind">
export type EventKind = Enums<"event_kind">
export type EventVisibility = Enums<"event_visibility">
export type FieldType = Enums<"field_type">
export type FocusCategory = Enums<"focus_category">
export type GoalStatus = Enums<"goal_status">
export type LeagueType = Enums<"league_type">
export type MediaKind = Enums<"media_kind">
export type PaymentPurpose = Enums<"payment_purpose">
export type PaymentStatus = Enums<"payment_status">
export type ProfileStatus = Enums<"profile_status">
export type ProspectPriority = Enums<"prospect_priority">
export type RosterPosition = Enums<"roster_position">
export type TacticsKind = Enums<"tactics_kind">
export type TrainingPriority = Enums<"training_priority">
export type TrainingStatus = Enums<"training_status">
export type UserRole = Enums<"user_role">

// Tactics board JSON shapes (tactics_boards.state_json contents)
/** Court position label used by the tactics board editor. */
export type TacticsPosition = string

/**
 * A token placed on the tactics board.
 * - `tokenType: "player"` — a real roster player or a generic position token.
 *   Real players carry a `profileId`; generic position tokens do not.
 * - `tokenType: "ball"` — the ball.
 * Numbers are intentionally NOT shown on play-builder tokens.
 */
export type TacticsPlayer = {
  id: string
  x: number
  y: number
  /** Display label — player first name or position label. */
  name: string
  /** "home" = our team, "away" = opponent. */
  team: "home" | "away"
  tokenType?: "player" | "ball"
  /** Set when this token represents a real roster player. */
  profileId?: string | null
  /** Optional position label (Ala, Fixo, etc.). */
  position?: string
  photoUrl?: string | null
  color?: string
  /** @deprecated numbers are no longer shown on tokens. Kept for back-compat. */
  jerseyNumber?: number | string
}

export type TacticsArrow = {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  /** Visual style of the arrow line. */
  style?: "solid" | "dashed"
  curved?: boolean
  controlX?: number
  controlY?: number
  kind?: string
  color?: string
}

export type TacticsLabel = {
  id: string
  x: number
  y: number
  text: string
  color?: string
}

/** Serialized board state stored in `tactics_boards.state_json`. */
export type TacticsBoardState = {
  players: TacticsPlayer[]
  arrows: TacticsArrow[]
  labels: TacticsLabel[]
}
