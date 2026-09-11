/**
-- ==============================================================================
-- LUMA — Database TypeScript Types (Phase 2)
-- Strongly-typed mapping of Supabase PostgreSQL public schema
-- ==============================================================================
*/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "VICTIM" | "COUNSELOR" | "ADMIN";
export type CaseStatus = "OPEN" | "ACTIVE" | "UNDER_REVIEW" | "CLOSED" | "REFERRED";
export type InteractionChannel = "VOICE_CALL" | "SMS" | "IN_APP_CHECK_IN" | "EMAIL" | "IN_PERSON";
export type ConsentStatus = "GIVEN" | "WITHDRAWN" | "PENDING";
export type AlertStatus = "NEW" | "UNDER_REVIEW" | "REVIEWED";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH";
export type FollowUpStatus = "PENDING" | "COMPLETED" | "OVERDUE" | "CANCELLED";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          display_name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          display_name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          display_name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cases: {
        Row: {
          id: string;
          case_ref: string;
          status: CaseStatus;
          victim_id: string;
          counselor_id: string | null;
          opened_at: string;
          updated_at: string;
          notes: string | null;
          latest_ai_insights: any | null; // JSONB
          insights_updated_at: string | null;
        };
        Insert: {
          id?: string;
          case_ref: string;
          status?: CaseStatus;
          victim_id: string;
          counselor_id?: string | null;
          opened_at?: string;
          updated_at?: string;
          notes?: string | null;
          latest_ai_insights?: any | null;
          insights_updated_at?: string | null;
        };
        Update: {
          id?: string;
          case_ref?: string;
          status?: CaseStatus;
          victim_id?: string;
          counselor_id?: string | null;
          opened_at?: string;
          updated_at?: string;
          notes?: string | null;
          latest_ai_insights?: any | null;
          insights_updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cases_victim_id_fkey";
            columns: ["victim_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cases_counselor_id_fkey";
            columns: ["counselor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      check_ins: {
        Row: {
          id: string;
          case_id: string;
          victim_id: string;
          response_text: string | null;
          voice_input_used: boolean;
          submitted_at: string;
          distress_level: string | null;
          distress_score: number | null;
          immediate_danger: boolean | null;
          distress_signals: string[] | null;
          distress_reason: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          victim_id: string;
          response_text?: string | null;
          voice_input_used?: boolean;
          submitted_at?: string;
          distress_level?: string | null;
          distress_score?: number | null;
          immediate_danger?: boolean | null;
          distress_signals?: string[] | null;
          distress_reason?: string | null;
        };
        Update: {
          id?: string;
          case_id?: string;
          victim_id?: string;
          response_text?: string | null;
          voice_input_used?: boolean;
          submitted_at?: string;
          distress_level?: string | null;
          distress_score?: number | null;
          immediate_danger?: boolean | null;
          distress_signals?: string[] | null;
          distress_reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "check_ins_case_id_fkey";
            columns: ["case_id"];
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "check_ins_victim_id_fkey";
            columns: ["victim_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      interactions: {
        Row: {
          id: string;
          case_id: string;
          channel: InteractionChannel;
          occurred_at: string;
          summary: string | null;
          recorded_by_id: string;
          distress_level: string | null;
          distress_score: number | null;
          immediate_danger: boolean | null;
          distress_signals: string[] | null;
          distress_reason: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          channel: InteractionChannel;
          occurred_at?: string;
          summary?: string | null;
          recorded_by_id: string;
          distress_level?: string | null;
          distress_score?: number | null;
          immediate_danger?: boolean | null;
          distress_signals?: string[] | null;
          distress_reason?: string | null;
        };
        Update: {
          id?: string;
          case_id?: string;
          channel?: InteractionChannel;
          occurred_at?: string;
          summary?: string | null;
          recorded_by_id?: string;
          distress_level?: string | null;
          distress_score?: number | null;
          immediate_danger?: boolean | null;
          distress_signals?: string[] | null;
          distress_reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "interactions_case_id_fkey";
            columns: ["case_id"];
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interactions_recorded_by_id_fkey";
            columns: ["recorded_by_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      consents: {
        Row: {
          id: string;
          victim_id: string;
          purpose: string;
          status: ConsentStatus;
          granted_at: string | null;
          withdrawn_at: string | null;
        };
        Insert: {
          id?: string;
          victim_id: string;
          purpose: string;
          status?: ConsentStatus;
          granted_at?: string | null;
          withdrawn_at?: string | null;
        };
        Update: {
          id?: string;
          victim_id?: string;
          purpose?: string;
          status?: ConsentStatus;
          granted_at?: string | null;
          withdrawn_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "consents_victim_id_fkey";
            columns: ["victim_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      alerts: {
        Row: {
          id: string;
          case_id: string;
          status: AlertStatus;
          severity: AlertSeverity;
          signal_description: string;
          raised_at: string;
          reviewed_at: string | null;
          reviewed_by_id: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          status?: AlertStatus;
          severity?: AlertSeverity;
          signal_description: string;
          raised_at?: string;
          reviewed_at?: string | null;
          reviewed_by_id?: string | null;
        };
        Update: {
          id?: string;
          case_id?: string;
          status?: AlertStatus;
          severity?: AlertSeverity;
          signal_description?: string;
          raised_at?: string;
          reviewed_at?: string | null;
          reviewed_by_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "alerts_case_id_fkey";
            columns: ["case_id"];
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alerts_reviewed_by_id_fkey";
            columns: ["reviewed_by_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      risk_scores: {
        Row: {
          id: string;
          case_id: string;
          score: number;
          computed_at: string;
          signal_reason: string;
          human_reviewed: boolean;
        };
        Insert: {
          id?: string;
          case_id: string;
          score: number;
          computed_at?: string;
          signal_reason: string;
          human_reviewed?: boolean;
        };
        Update: {
          id?: string;
          case_id?: string;
          score?: number;
          computed_at?: string;
          signal_reason?: string;
          human_reviewed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "risk_scores_case_id_fkey";
            columns: ["case_id"];
            referencedRelation: "cases";
            referencedColumns: ["id"];
          }
        ];
      };
      follow_ups: {
        Row: {
          id: string;
          case_id: string;
          counselor_id: string;
          title: string;
          description: string | null;
          due_date: string;
          status: FollowUpStatus;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          counselor_id: string;
          title: string;
          description?: string | null;
          due_date: string;
          status?: FollowUpStatus;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          counselor_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string;
          status?: FollowUpStatus;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follow_ups_case_id_fkey";
            columns: ["case_id"];
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follow_ups_counselor_id_fkey";
            columns: ["counselor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          actor_role: UserRole;
          action: string;
          resource_type: string;
          resource_id: string;
          timestamp: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          actor_id: string;
          actor_role: UserRole;
          action: string;
          resource_type: string;
          resource_id: string;
          timestamp?: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          actor_id?: string;
          actor_role?: UserRole;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          timestamp?: string;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
export type CaseInsert = Database["public"]["Tables"]["cases"]["Insert"];
export type CaseUpdate = Database["public"]["Tables"]["cases"]["Update"];

export type CheckInRow = Database["public"]["Tables"]["check_ins"]["Row"];
export type CheckInInsert = Database["public"]["Tables"]["check_ins"]["Insert"];
export type CheckInUpdate = Database["public"]["Tables"]["check_ins"]["Update"];

export type InteractionRow = Database["public"]["Tables"]["interactions"]["Row"];
export type InteractionInsert = Database["public"]["Tables"]["interactions"]["Insert"];
export type InteractionUpdate = Database["public"]["Tables"]["interactions"]["Update"];

export type ConsentRow = Database["public"]["Tables"]["consents"]["Row"];
export type ConsentInsert = Database["public"]["Tables"]["consents"]["Insert"];
export type ConsentUpdate = Database["public"]["Tables"]["consents"]["Update"];

export type AlertRow = Database["public"]["Tables"]["alerts"]["Row"];
export type AlertInsert = Database["public"]["Tables"]["alerts"]["Insert"];
export type AlertUpdate = Database["public"]["Tables"]["alerts"]["Update"];

export type RiskScoreRow = Database["public"]["Tables"]["risk_scores"]["Row"];
export type RiskScoreInsert = Database["public"]["Tables"]["risk_scores"]["Insert"];
export type RiskScoreUpdate = Database["public"]["Tables"]["risk_scores"]["Update"];

export type FollowUpRow = Database["public"]["Tables"]["follow_ups"]["Row"];
export type FollowUpInsert = Database["public"]["Tables"]["follow_ups"]["Insert"];
export type FollowUpUpdate = Database["public"]["Tables"]["follow_ups"]["Update"];

export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
export type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];
export type AuditLogUpdate = Database["public"]["Tables"]["audit_logs"]["Update"];

