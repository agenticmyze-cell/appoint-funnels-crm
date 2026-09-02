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
      admin_activity_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          field: string | null
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          field?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          field?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: []
      }
      campaign_daily_stats: {
        Row: {
          campaign_id: string
          day: string
          id: string
          opportunities: number
          sent: number
          total_clicks: number
          total_opens: number
          total_replies: number
          unique_clicks: number
          unique_opens: number
        }
        Insert: {
          campaign_id: string
          day: string
          id?: string
          opportunities?: number
          sent?: number
          total_clicks?: number
          total_opens?: number
          total_replies?: number
          unique_clicks?: number
          unique_opens?: number
        }
        Update: {
          campaign_id?: string
          day?: string
          id?: string
          opportunities?: number
          sent?: number
          total_clicks?: number
          total_opens?: number
          total_replies?: number
          unique_clicks?: number
          unique_opens?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_daily_stats_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_steps: {
        Row: {
          campaign_id: string
          clicked: number
          created_at: string
          id: string
          opened: number
          opportunities: number
          replied: number
          sent: number
          step_number: number
          subject: string | null
        }
        Insert: {
          campaign_id: string
          clicked?: number
          created_at?: string
          id?: string
          opened?: number
          opportunities?: number
          replied?: number
          sent?: number
          step_number: number
          subject?: string | null
        }
        Update: {
          campaign_id?: string
          clicked?: number
          created_at?: string
          id?: string
          opened?: number
          opportunities?: number
          replied?: number
          sent?: number
          step_number?: number
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_steps_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          click_rate_enabled: boolean
          client_id: string
          created_at: string
          description: string | null
          emails_sent: number
          end_date: string | null
          id: string
          leads_count: number
          meetings_booked: number
          meetings_completed: number
          metrics_mode: Database["public"]["Enums"]["metrics_mode"]
          name: string
          open_rate_enabled: boolean
          opportunities: number
          opportunity_value: number
          progress: number
          revenue: number
          sequence_started: number
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          total_clicks: number
          total_opens: number
          total_replies: number
          unique_clicks: number
          unique_opens: number
          unique_replies: number
          updated_at: string
          won_deals: number
        }
        Insert: {
          click_rate_enabled?: boolean
          client_id: string
          created_at?: string
          description?: string | null
          emails_sent?: number
          end_date?: string | null
          id?: string
          leads_count?: number
          meetings_booked?: number
          meetings_completed?: number
          metrics_mode?: Database["public"]["Enums"]["metrics_mode"]
          name: string
          open_rate_enabled?: boolean
          opportunities?: number
          opportunity_value?: number
          progress?: number
          revenue?: number
          sequence_started?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          total_clicks?: number
          total_opens?: number
          total_replies?: number
          unique_clicks?: number
          unique_opens?: number
          unique_replies?: number
          updated_at?: string
          won_deals?: number
        }
        Update: {
          click_rate_enabled?: boolean
          client_id?: string
          created_at?: string
          description?: string | null
          emails_sent?: number
          end_date?: string | null
          id?: string
          leads_count?: number
          meetings_booked?: number
          meetings_completed?: number
          metrics_mode?: Database["public"]["Enums"]["metrics_mode"]
          name?: string
          open_rate_enabled?: boolean
          opportunities?: number
          opportunity_value?: number
          progress?: number
          revenue?: number
          sequence_started?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          total_clicks?: number
          total_opens?: number
          total_replies?: number
          unique_clicks?: number
          unique_opens?: number
          unique_replies?: number
          updated_at?: string
          won_deals?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          account_manager: string | null
          company: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          industry: string | null
          joined_date: string
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          account_manager?: string | null
          company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          joined_date?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_manager?: string | null
          company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          joined_date?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          activity_type: string
          campaign_id: string | null
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          lead_id: string | null
        }
        Insert: {
          activity_type: string
          campaign_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
        }
        Update: {
          activity_type?: string
          campaign_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
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
          campaign_id: string | null
          client_id: string
          company: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          industry: string | null
          last_activity_at: string | null
          last_name: string | null
          location: string | null
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          campaign_id?: string | null
          client_id: string
          company?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          industry?: string | null
          last_activity_at?: string | null
          last_name?: string | null
          location?: string | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          campaign_id?: string | null
          client_id?: string
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          industry?: string | null
          last_activity_at?: string | null
          last_name?: string | null
          location?: string | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          campaign_id: string | null
          client_id: string
          completed: boolean
          created_at: string
          id: string
          lead_id: string | null
          lead_name: string | null
          notes: string | null
          scheduled_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          client_id: string
          completed?: boolean
          created_at?: string
          id?: string
          lead_id?: string | null
          lead_name?: string | null
          notes?: string | null
          scheduled_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          client_id?: string
          completed?: boolean
          created_at?: string
          id?: string
          lead_id?: string | null
          lead_name?: string | null
          notes?: string | null
          scheduled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          client_id: string | null
          created_at: string
          id: string
          is_read: boolean
          kind: string
          title: string
        }
        Insert: {
          body?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind?: string
          title: string
        }
        Update: {
          body?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          campaign_id: string | null
          client_id: string
          company: string | null
          created_at: string
          expected_close_date: string | null
          id: string
          lead_id: string | null
          lead_name: string | null
          notes: string | null
          stage: Database["public"]["Enums"]["opp_stage"]
          updated_at: string
          value: number
        }
        Insert: {
          campaign_id?: string | null
          client_id: string
          company?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          lead_name?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["opp_stage"]
          updated_at?: string
          value?: number
        }
        Update: {
          campaign_id?: string | null
          client_id?: string
          company?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          lead_name?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["opp_stage"]
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          client_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      replies: {
        Row: {
          body: string | null
          campaign_id: string | null
          classification: Database["public"]["Enums"]["reply_class"]
          client_id: string
          created_at: string
          folder: string
          id: string
          is_read: boolean
          lead_email: string
          lead_id: string | null
          lead_name: string | null
          received_at: string
          subject: string | null
        }
        Insert: {
          body?: string | null
          campaign_id?: string | null
          classification?: Database["public"]["Enums"]["reply_class"]
          client_id: string
          created_at?: string
          folder?: string
          id?: string
          is_read?: boolean
          lead_email: string
          lead_id?: string | null
          lead_name?: string | null
          received_at?: string
          subject?: string | null
        }
        Update: {
          body?: string | null
          campaign_id?: string | null
          classification?: Database["public"]["Enums"]["reply_class"]
          client_id?: string
          created_at?: string
          folder?: string
          id?: string
          is_read?: boolean
          lead_email?: string
          lead_id?: string | null
          lead_name?: string | null
          received_at?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "replies_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      reply_messages: {
        Row: {
          body: string | null
          direction: string
          from_email: string | null
          id: string
          reply_id: string
          sent_at: string
          to_email: string | null
        }
        Insert: {
          body?: string | null
          direction?: string
          from_email?: string | null
          id?: string
          reply_id: string
          sent_at?: string
          to_email?: string | null
        }
        Update: {
          body?: string | null
          direction?: string
          from_email?: string | null
          id?: string
          reply_id?: string
          sent_at?: string
          to_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reply_messages_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "replies"
            referencedColumns: ["id"]
          },
        ]
      }
      screenshots: {
        Row: {
          campaign_id: string | null
          category: Database["public"]["Enums"]["screenshot_category"]
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          sort_order: number
          taken_on: string | null
          title: string | null
        }
        Insert: {
          campaign_id?: string | null
          category?: Database["public"]["Enums"]["screenshot_category"]
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          sort_order?: number
          taken_on?: string | null
          title?: string | null
        }
        Update: {
          campaign_id?: string | null
          category?: Database["public"]["Enums"]["screenshot_category"]
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          sort_order?: number
          taken_on?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screenshots_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screenshots_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          campaign_id: string | null
          client_id: string | null
          client_name: string | null
          company: string | null
          created_at: string
          emails_sent: number
          featured: boolean
          id: string
          industry: string | null
          leads: number
          logo_url: string | null
          meetings: number
          opportunities: number
          opportunity_value: number
          photo_url: string | null
          quote: string | null
          replies: number
          result_description: string | null
          result_headline: string | null
          revenue: number
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          client_id?: string | null
          client_name?: string | null
          company?: string | null
          created_at?: string
          emails_sent?: number
          featured?: boolean
          id?: string
          industry?: string | null
          leads?: number
          logo_url?: string | null
          meetings?: number
          opportunities?: number
          opportunity_value?: number
          photo_url?: string | null
          quote?: string | null
          replies?: number
          result_description?: string | null
          result_headline?: string | null
          revenue?: number
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          client_id?: string | null
          client_name?: string | null
          company?: string | null
          created_at?: string
          emails_sent?: number
          featured?: boolean
          id?: string
          industry?: string | null
          leads?: number
          logo_url?: string | null
          meetings?: number
          opportunities?: number
          opportunity_value?: number
          photo_url?: string | null
          quote?: string | null
          replies?: number
          result_description?: string | null
          result_headline?: string | null
          revenue?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      my_client_id: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "client"
      campaign_status: "draft" | "active" | "paused" | "completed" | "archived"
      client_status: "active" | "paused" | "completed" | "inactive"
      lead_status:
        | "new"
        | "contacted"
        | "opened"
        | "replied"
        | "interested"
        | "meeting_booked"
        | "opportunity"
        | "won"
        | "lost"
      metrics_mode: "live" | "manual"
      opp_stage:
        | "new"
        | "qualified"
        | "meeting_booked"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      reply_class:
        | "interested"
        | "not_interested"
        | "question"
        | "meeting_request"
        | "out_of_office"
        | "other"
      screenshot_category:
        | "campaign_results"
        | "client_reply"
        | "analytics"
        | "testimonial"
        | "dashboard"
        | "before_after"
        | "other"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "client"],
      campaign_status: ["draft", "active", "paused", "completed", "archived"],
      client_status: ["active", "paused", "completed", "inactive"],
      lead_status: [
        "new",
        "contacted",
        "opened",
        "replied",
        "interested",
        "meeting_booked",
        "opportunity",
        "won",
        "lost",
      ],
      metrics_mode: ["live", "manual"],
      opp_stage: [
        "new",
        "qualified",
        "meeting_booked",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      reply_class: [
        "interested",
        "not_interested",
        "question",
        "meeting_request",
        "out_of_office",
        "other",
      ],
      screenshot_category: [
        "campaign_results",
        "client_reply",
        "analytics",
        "testimonial",
        "dashboard",
        "before_after",
        "other",
      ],
    },
  },
} as const
