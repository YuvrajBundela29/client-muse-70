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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      client_pipeline: {
        Row: {
          created_at: string
          email_sent_date: string | null
          follow_up_day: number | null
          id: string
          lead_id: string
          notes: string | null
          pipeline_status: string
          priority_rank: number | null
          recommended_package: string | null
          service_track: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_sent_date?: string | null
          follow_up_day?: number | null
          id?: string
          lead_id: string
          notes?: string | null
          pipeline_status?: string
          priority_rank?: number | null
          recommended_package?: string | null
          service_track?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_sent_date?: string | null
          follow_up_day?: number | null
          id?: string
          lead_id?: string
          notes?: string | null
          pipeline_status?: string
          priority_rank?: number | null
          recommended_package?: string | null
          service_track?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_pipeline_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_name: string
          city: string
          created_at: string
          email: string | null
          google_rating: number | null
          growth_opportunity: string | null
          id: string
          industry: string
          instagram_url: string | null
          outreach_message: string | null
          phone: string | null
          recommended_service: string | null
          status: string
          user_id: string | null
          website: string | null
          website_problem: string | null
        }
        Insert: {
          business_name: string
          city: string
          created_at?: string
          email?: string | null
          google_rating?: number | null
          growth_opportunity?: string | null
          id?: string
          industry: string
          instagram_url?: string | null
          outreach_message?: string | null
          phone?: string | null
          recommended_service?: string | null
          status?: string
          user_id?: string | null
          website?: string | null
          website_problem?: string | null
        }
        Update: {
          business_name?: string
          city?: string
          created_at?: string
          email?: string | null
          google_rating?: number | null
          growth_opportunity?: string | null
          id?: string
          industry?: string
          instagram_url?: string | null
          outreach_message?: string | null
          phone?: string | null
          recommended_service?: string | null
          status?: string
          user_id?: string | null
          website?: string | null
          website_problem?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits_remaining: number
          email: string | null
          full_name: string | null
          id: string
          plan: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits_remaining?: number
          email?: string | null
          full_name?: string | null
          id: string
          plan?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits_remaining?: number
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      reel_library: {
        Row: {
          created_at: string
          description: string
          drive_link: string
          id: string
          industry_tags: string[]
          keywords: string[]
          reel_code: string
        }
        Insert: {
          created_at?: string
          description: string
          drive_link: string
          id?: string
          industry_tags?: string[]
          keywords?: string[]
          reel_code: string
        }
        Update: {
          created_at?: string
          description?: string
          drive_link?: string
          id?: string
          industry_tags?: string[]
          keywords?: string[]
          reel_code?: string
        }
        Relationships: []
      }
      saved_leads: {
        Row: {
          created_at: string
          follow_up_due_at: string | null
          id: string
          last_contacted_at: string | null
          lead_id: string
          notes: string | null
          pipeline_stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          follow_up_due_at?: string | null
          id?: string
          last_contacted_at?: string | null
          lead_id: string
          notes?: string | null
          pipeline_stage?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          follow_up_due_at?: string | null
          id?: string
          last_contacted_at?: string | null
          lead_id?: string
          notes?: string | null
          pipeline_stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          industry: string
          location: string
          result_count: number | null
          service: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry: string
          location: string
          result_count?: number | null
          service: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string
          location?: string
          result_count?: number | null
          service?: string
          user_id?: string
        }
        Relationships: []
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
