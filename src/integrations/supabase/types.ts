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
      agent_presence: {
        Row: {
          account_owner_id: string
          last_seen_at: string
          manual_override: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_owner_id: string
          last_seen_at?: string
          manual_override?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_owner_id?: string
          last_seen_at?: string
          manual_override?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          channel_type: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model: string | null
          name: string
          system_prompt: string
          telegram_bot_id: string | null
          temperature: number | null
          twilio_connection_id: string | null
          updated_at: string | null
          user_id: string
          web_chatbot_id: string | null
          whatsapp_connection_id: string | null
        }
        Insert: {
          channel_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string | null
          name: string
          system_prompt: string
          telegram_bot_id?: string | null
          temperature?: number | null
          twilio_connection_id?: string | null
          updated_at?: string | null
          user_id: string
          web_chatbot_id?: string | null
          whatsapp_connection_id?: string | null
        }
        Update: {
          channel_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string | null
          name?: string
          system_prompt?: string
          telegram_bot_id?: string | null
          temperature?: number | null
          twilio_connection_id?: string | null
          updated_at?: string | null
          user_id?: string
          web_chatbot_id?: string | null
          whatsapp_connection_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_telegram_bot_id_fkey"
            columns: ["telegram_bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agents_twilio_connection_id_fkey"
            columns: ["twilio_connection_id"]
            isOneToOne: false
            referencedRelation: "twilio_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agents_web_chatbot_id_fkey"
            columns: ["web_chatbot_id"]
            isOneToOne: false
            referencedRelation: "web_chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agents_whatsapp_connection_id_fkey"
            columns: ["whatsapp_connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_response_buffer: {
        Row: {
          accumulated_messages: Json
          channel_type: string
          conversation_id: string
          created_at: string
          first_message_at: string
          id: string
          message_count: number
          phone_number: string
          processed: boolean
          session_name: string | null
          telegram_bot_id: string | null
          twilio_connection_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accumulated_messages?: Json
          channel_type?: string
          conversation_id: string
          created_at?: string
          first_message_at?: string
          id?: string
          message_count?: number
          phone_number: string
          processed?: boolean
          session_name?: string | null
          telegram_bot_id?: string | null
          twilio_connection_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accumulated_messages?: Json
          channel_type?: string
          conversation_id?: string
          created_at?: string
          first_message_at?: string
          id?: string
          message_count?: number
          phone_number?: string
          processed?: boolean
          session_name?: string | null
          telegram_bot_id?: string | null
          twilio_connection_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_response_buffer_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_response_buffer_telegram_bot_id_fkey"
            columns: ["telegram_bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_response_buffer_twilio_connection_id_fkey"
            columns: ["twilio_connection_id"]
            isOneToOne: false
            referencedRelation: "twilio_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_settings: {
        Row: {
          account_owner_id: string
          assign_strategy: string
          auto_assign_enabled: boolean
          created_at: string
          include_unassigned_for_all: boolean
          last_assigned_user_id: string | null
          updated_at: string
        }
        Insert: {
          account_owner_id: string
          assign_strategy?: string
          auto_assign_enabled?: boolean
          created_at?: string
          include_unassigned_for_all?: boolean
          last_assigned_user_id?: string | null
          updated_at?: string
        }
        Update: {
          account_owner_id?: string
          assign_strategy?: string
          auto_assign_enabled?: boolean
          created_at?: string
          include_unassigned_for_all?: boolean
          last_assigned_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      automated_message_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          last_retry_at: string | null
          lead_id: string | null
          message_content: string
          phone_number: string
          retry_count: number | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          trigger_id: string | null
          trigger_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_retry_at?: string | null
          lead_id?: string | null
          message_content: string
          phone_number: string
          retry_count?: number | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          trigger_id?: string | null
          trigger_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_retry_at?: string | null
          lead_id?: string | null
          message_content?: string
          phone_number?: string
          retry_count?: number | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          trigger_id?: string | null
          trigger_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_message_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_message_logs_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "column_message_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_sends: {
        Row: {
          campaign_id: string
          contact_id: string | null
          contact_name: string | null
          created_at: string | null
          error_message: string | null
          id: string
          message_sent: string
          phone_number: string
          sent_at: string | null
          status: string
          user_id: string
          was_personalized: boolean | null
        }
        Insert: {
          campaign_id: string
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_sent: string
          phone_number: string
          sent_at?: string | null
          status?: string
          user_id: string
          was_personalized?: boolean | null
        }
        Update: {
          campaign_id?: string
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_sent?: string
          phone_number?: string
          sent_at?: string | null
          status?: string
          user_id?: string
          was_personalized?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "mass_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_sends_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      casino_api_configs: {
        Row: {
          agent_username: string | null
          api_base_url: string | null
          api_key: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          skin_id: string | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          agent_username?: string | null
          api_base_url?: string | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          skin_id?: string | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          agent_username?: string | null
          api_base_url?: string | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          skin_id?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      column_message_triggers: {
        Row: {
          column_id: string
          created_at: string | null
          delay_hours: number | null
          id: string
          is_active: boolean | null
          message_content: string
          message_title: string
          trigger_condition: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          column_id: string
          created_at?: string | null
          delay_hours?: number | null
          id?: string
          is_active?: boolean | null
          message_content: string
          message_title: string
          trigger_condition: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          column_id?: string
          created_at?: string | null
          delay_hours?: number | null
          id?: string
          is_active?: boolean | null
          message_content?: string
          message_title?: string
          trigger_condition?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_triggers_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "lead_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      consumption_alert_history: {
        Row: {
          account_owner_id: string
          alert_type: string
          created_at: string
          description: string
          id: string
          is_read: boolean
          metadata: Json
          metric_value: number
          period_end: string
          period_start: string
          recommended_action: string
          severity: string
          target_user_id: string | null
          threshold_value: number
          title: string
        }
        Insert: {
          account_owner_id: string
          alert_type: string
          created_at?: string
          description: string
          id?: string
          is_read?: boolean
          metadata?: Json
          metric_value?: number
          period_end: string
          period_start: string
          recommended_action: string
          severity?: string
          target_user_id?: string | null
          threshold_value?: number
          title: string
        }
        Update: {
          account_owner_id?: string
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          is_read?: boolean
          metadata?: Json
          metric_value?: number
          period_end?: string
          period_start?: string
          recommended_action?: string
          severity?: string
          target_user_id?: string | null
          threshold_value?: number
          title?: string
        }
        Relationships: []
      }
      consumption_alert_settings: {
        Row: {
          account_owner_id: string
          agent_monthly_message_threshold: number
          created_at: string
          default_severity: string
          enable_agent_volume_alert: boolean
          enable_low_savings_alert: boolean
          enable_twilio_cost_alert: boolean
          enable_whatsapp_api_unusual_alert: boolean
          id: string
          minimum_savings_percent: number
          target_user_id: string | null
          twilio_monthly_cost_threshold: number
          twilio_monthly_message_threshold: number
          updated_at: string
          whatsapp_api_unusual_growth_percent: number
        }
        Insert: {
          account_owner_id: string
          agent_monthly_message_threshold?: number
          created_at?: string
          default_severity?: string
          enable_agent_volume_alert?: boolean
          enable_low_savings_alert?: boolean
          enable_twilio_cost_alert?: boolean
          enable_whatsapp_api_unusual_alert?: boolean
          id?: string
          minimum_savings_percent?: number
          target_user_id?: string | null
          twilio_monthly_cost_threshold?: number
          twilio_monthly_message_threshold?: number
          updated_at?: string
          whatsapp_api_unusual_growth_percent?: number
        }
        Update: {
          account_owner_id?: string
          agent_monthly_message_threshold?: number
          created_at?: string
          default_severity?: string
          enable_agent_volume_alert?: boolean
          enable_low_savings_alert?: boolean
          enable_twilio_cost_alert?: boolean
          enable_whatsapp_api_unusual_alert?: boolean
          id?: string
          minimum_savings_percent?: number
          target_user_id?: string | null
          twilio_monthly_cost_threshold?: number
          twilio_monthly_message_threshold?: number
          updated_at?: string
          whatsapp_api_unusual_growth_percent?: number
        }
        Relationships: []
      }
      contact_details: {
        Row: {
          agent_id: string | null
          birth_date: string | null
          conversation_id: string | null
          created_at: string | null
          funnel_stage: string | null
          gender: string | null
          id: string
          notes: string | null
          origin: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          birth_date?: string | null
          conversation_id?: string | null
          created_at?: string | null
          funnel_stage?: string | null
          gender?: string | null
          id?: string
          notes?: string | null
          origin?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          birth_date?: string | null
          conversation_id?: string | null
          created_at?: string | null
          funnel_stage?: string | null
          gender?: string | null
          id?: string
          notes?: string | null
          origin?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_details_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_list_members: {
        Row: {
          added_at: string | null
          contact_id: string
          contact_list_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          added_at?: string | null
          contact_id: string
          contact_list_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          added_at?: string | null
          contact_id?: string
          contact_list_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_list_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_list_members_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_sales: {
        Row: {
          amount: number
          contact_detail_id: string | null
          created_at: string | null
          description: string | null
          id: string
          sale_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          contact_detail_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          sale_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          contact_detail_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          sale_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_sales_contact_detail_id_fkey"
            columns: ["contact_detail_id"]
            isOneToOne: false
            referencedRelation: "contact_details"
            referencedColumns: ["id"]
          },
        ]
      }
      contacto_bloqueado_bot: {
        Row: {
          created_at: string | null
          id: string
          numero: string
          pushname: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          numero: string
          pushname?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          numero?: string
          pushname?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          birth_date: string | null
          company: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          is_blocked: boolean | null
          last_name: string | null
          name: string
          notes: string | null
          origin: string | null
          phone_number: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          is_blocked?: boolean | null
          last_name?: string | null
          name: string
          notes?: string | null
          origin?: string | null
          phone_number: string
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          is_blocked?: boolean | null
          last_name?: string | null
          name?: string
          notes?: string | null
          origin?: string | null
          phone_number?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          casino_user_created: boolean | null
          casino_username: string | null
          channel_type: string | null
          contact_name: string | null
          created_at: string | null
          facebook_connection_id: string | null
          id: string
          last_inbound_message_time: string | null
          last_message: string | null
          last_message_time: string | null
          lead_id: string | null
          payment_receipt_detected_at: string | null
          payment_receipt_sent: boolean | null
          phone_number: string
          pushname: string | null
          status: string | null
          telegram_bot_id: string | null
          twilio_connection_id: string | null
          unread_count: number | null
          updated_at: string | null
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          casino_user_created?: boolean | null
          casino_username?: string | null
          channel_type?: string | null
          contact_name?: string | null
          created_at?: string | null
          facebook_connection_id?: string | null
          id?: string
          last_inbound_message_time?: string | null
          last_message?: string | null
          last_message_time?: string | null
          lead_id?: string | null
          payment_receipt_detected_at?: string | null
          payment_receipt_sent?: boolean | null
          phone_number: string
          pushname?: string | null
          status?: string | null
          telegram_bot_id?: string | null
          twilio_connection_id?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          casino_user_created?: boolean | null
          casino_username?: string | null
          channel_type?: string | null
          contact_name?: string | null
          created_at?: string | null
          facebook_connection_id?: string | null
          id?: string
          last_inbound_message_time?: string | null
          last_message?: string | null
          last_message_time?: string | null
          lead_id?: string | null
          payment_receipt_detected_at?: string | null
          payment_receipt_sent?: boolean | null
          phone_number?: string
          pushname?: string | null
          status?: string | null
          telegram_bot_id?: string | null
          twilio_connection_id?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_telegram_bot_id_fkey"
            columns: ["telegram_bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_twilio_connection_id_fkey"
            columns: ["twilio_connection_id"]
            isOneToOne: false
            referencedRelation: "twilio_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      email_inboxes: {
        Row: {
          ai_enabled: boolean
          ai_webhook_url: string | null
          created_at: string
          email_address: string
          id: string
          signature_html: string | null
          signature_text: string | null
          user_id: string | null
        }
        Insert: {
          ai_enabled?: boolean
          ai_webhook_url?: string | null
          created_at?: string
          email_address: string
          id?: string
          signature_html?: string | null
          signature_text?: string | null
          user_id?: string | null
        }
        Update: {
          ai_enabled?: boolean
          ai_webhook_url?: string | null
          created_at?: string
          email_address?: string
          id?: string
          signature_html?: string | null
          signature_text?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_messages: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string
          direction: string | null
          from_email: string | null
          id: string
          inbox_id: string | null
          is_read: boolean | null
          received_at: string
          requires_human_followup: boolean | null
          subject: string | null
          to_email: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          direction?: string | null
          from_email?: string | null
          id?: string
          inbox_id?: string | null
          is_read?: boolean | null
          received_at?: string
          requires_human_followup?: boolean | null
          subject?: string | null
          to_email?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          direction?: string | null
          from_email?: string | null
          id?: string
          inbox_id?: string | null
          is_read?: boolean | null
          received_at?: string
          requires_human_followup?: boolean | null
          subject?: string | null
          to_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_inbox_id_fkey"
            columns: ["inbox_id"]
            isOneToOne: false
            referencedRelation: "email_inboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      etiquetas: {
        Row: {
          color: string
          creado_en: string
          creado_por: string | null
          descripcion: string | null
          id: string
          nombre: string
          organizacion_id: string | null
        }
        Insert: {
          color?: string
          creado_en?: string
          creado_por?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          organizacion_id?: string | null
        }
        Update: {
          color?: string
          creado_en?: string
          creado_por?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          organizacion_id?: string | null
        }
        Relationships: []
      }
      facebook_connections: {
        Row: {
          ai_enabled: boolean | null
          created_at: string | null
          default_column_id: string | null
          id: string
          instagram_account_id: string | null
          instagram_username: string | null
          n8n_webhook_url: string | null
          page_access_token: string
          page_id: string
          page_name: string
          status: string | null
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          ai_enabled?: boolean | null
          created_at?: string | null
          default_column_id?: string | null
          id?: string
          instagram_account_id?: string | null
          instagram_username?: string | null
          n8n_webhook_url?: string | null
          page_access_token: string
          page_id: string
          page_name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          ai_enabled?: boolean | null
          created_at?: string | null
          default_column_id?: string | null
          id?: string
          instagram_account_id?: string | null
          instagram_username?: string | null
          n8n_webhook_url?: string | null
          page_access_token?: string
          page_id?: string
          page_name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      ia_calls: {
        Row: {
          contacts: Json | null
          created_at: string
          id: string
          knowledge_base_files: Json | null
          knowledge_base_text: string | null
          name: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contacts?: Json | null
          created_at?: string
          id?: string
          knowledge_base_files?: Json | null
          knowledge_base_text?: string | null
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contacts?: Json | null
          created_at?: string
          id?: string
          knowledge_base_files?: Json | null
          knowledge_base_text?: string | null
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ia_default_settings: {
        Row: {
          cashier_numbers: string
          casino_link: string | null
          cbu: string
          created_at: string | null
          id: number
          is_enabled: boolean
          updated_at: string | null
        }
        Insert: {
          cashier_numbers?: string
          casino_link?: string | null
          cbu?: string
          created_at?: string | null
          id?: number
          is_enabled?: boolean
          updated_at?: string | null
        }
        Update: {
          cashier_numbers?: string
          casino_link?: string | null
          cbu?: string
          created_at?: string | null
          id?: number
          is_enabled?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      ia_humanization_settings: {
        Row: {
          ai_temperature: number
          combine_multiple_messages: boolean
          created_at: string | null
          delay_between_messages_ms: number
          emoji_frequency: number
          enable_response_variation: boolean
          enable_typing_indicator: boolean
          id: number
          max_response_delay_ms: number
          max_responses_per_minute: number
          min_response_delay_ms: number
          updated_at: string | null
        }
        Insert: {
          ai_temperature?: number
          combine_multiple_messages?: boolean
          created_at?: string | null
          delay_between_messages_ms?: number
          emoji_frequency?: number
          enable_response_variation?: boolean
          enable_typing_indicator?: boolean
          id?: number
          max_response_delay_ms?: number
          max_responses_per_minute?: number
          min_response_delay_ms?: number
          updated_at?: string | null
        }
        Update: {
          ai_temperature?: number
          combine_multiple_messages?: boolean
          created_at?: string | null
          delay_between_messages_ms?: number
          emoji_frequency?: number
          enable_response_variation?: boolean
          enable_typing_indicator?: boolean
          id?: number
          max_response_delay_ms?: number
          max_responses_per_minute?: number
          min_response_delay_ms?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      internal_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      landing_chat_config: {
        Row: {
          cashier_number: string | null
          cbu: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cashier_number?: string | null
          cbu?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cashier_number?: string | null
          cbu?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      landing_chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          session_id: string
          status: string | null
          updated_at: string | null
          user_id: string
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: []
      }
      landing_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          direction: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          direction: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          direction?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "landing_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_columns: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          position: number
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          position: number
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          position?: number
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_columns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          bot_active: boolean | null
          column_id: string
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          last_inbound_message_time: string | null
          name: string
          notes: string | null
          phone: string
          position: number
          tags: string[] | null
          updated_at: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          bot_active?: boolean | null
          column_id: string
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_inbound_message_time?: string | null
          name: string
          notes?: string | null
          phone: string
          position: number
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          bot_active?: boolean | null
          column_id?: string
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_inbound_message_time?: string | null
          name?: string
          notes?: string | null
          phone?: string
          position?: number
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "lead_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      mass_campaigns: {
        Row: {
          attachment_mime_types: string[] | null
          attachment_names: string[] | null
          attachment_urls: string[] | null
          campaign_message: string | null
          channel_type: string | null
          contact_list_id: string | null
          created_at: string | null
          description: string | null
          edit_with_ai: boolean | null
          id: string
          max_delay: number | null
          message: string
          min_delay: number | null
          name: string
          scheduled_at: string | null
          sent_count: number | null
          status: string | null
          telegram_bot_id: string | null
          total_count: number | null
          twilio_connection_id: string | null
          updated_at: string | null
          user_id: string
          whatsapp_connection_id: string | null
          whatsapp_connection_ids: string[] | null
          whatsapp_connection_name: string | null
        }
        Insert: {
          attachment_mime_types?: string[] | null
          attachment_names?: string[] | null
          attachment_urls?: string[] | null
          campaign_message?: string | null
          channel_type?: string | null
          contact_list_id?: string | null
          created_at?: string | null
          description?: string | null
          edit_with_ai?: boolean | null
          id?: string
          max_delay?: number | null
          message: string
          min_delay?: number | null
          name: string
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string | null
          telegram_bot_id?: string | null
          total_count?: number | null
          twilio_connection_id?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_connection_id?: string | null
          whatsapp_connection_ids?: string[] | null
          whatsapp_connection_name?: string | null
        }
        Update: {
          attachment_mime_types?: string[] | null
          attachment_names?: string[] | null
          attachment_urls?: string[] | null
          campaign_message?: string | null
          channel_type?: string | null
          contact_list_id?: string | null
          created_at?: string | null
          description?: string | null
          edit_with_ai?: boolean | null
          id?: string
          max_delay?: number | null
          message?: string
          min_delay?: number | null
          name?: string
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string | null
          telegram_bot_id?: string | null
          total_count?: number | null
          twilio_connection_id?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_connection_id?: string | null
          whatsapp_connection_ids?: string[] | null
          whatsapp_connection_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mass_campaigns_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mass_campaigns_telegram_bot_id_fkey"
            columns: ["telegram_bot_id"]
            isOneToOne: false
            referencedRelation: "telegram_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mass_campaigns_twilio_connection_id_fkey"
            columns: ["twilio_connection_id"]
            isOneToOne: false
            referencedRelation: "twilio_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mass_campaigns_whatsapp_connection_id_fkey"
            columns: ["whatsapp_connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      mensaje_landing: {
        Row: {
          created_at: string
          id: number
          id_usuario: string | null
          mensaje: string | null
          orientacion: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_usuario?: string | null
          mensaje?: string | null
          orientacion?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          id_usuario?: string | null
          mensaje?: string | null
          orientacion?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          direction: string
          file_url: string | null
          id: string
          is_bot: boolean | null
          message: string | null
          message_type: string | null
          metadata: Json | null
          responded_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          direction: string
          file_url?: string | null
          id?: string
          is_bot?: boolean | null
          message?: string | null
          message_type?: string | null
          metadata?: Json | null
          responded_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          direction?: string
          file_url?: string | null
          id?: string
          is_bot?: boolean | null
          message?: string | null
          message_type?: string | null
          metadata?: Json | null
          responded_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_channel_cost_snapshots: {
        Row: {
          created_at: string
          external_cost: number
          id: string
          internal_cost: number
          month: string
          total_savings: number
          twilio_cost: number
          twilio_messages: number
          updated_at: string
          user_id: string
          whatsapp_api_cost: number
          whatsapp_api_messages: number
        }
        Insert: {
          created_at?: string
          external_cost?: number
          id?: string
          internal_cost?: number
          month: string
          total_savings?: number
          twilio_cost?: number
          twilio_messages?: number
          updated_at?: string
          user_id: string
          whatsapp_api_cost?: number
          whatsapp_api_messages?: number
        }
        Update: {
          created_at?: string
          external_cost?: number
          id?: string
          internal_cost?: number
          month?: string
          total_savings?: number
          twilio_cost?: number
          twilio_messages?: number
          updated_at?: string
          user_id?: string
          whatsapp_api_cost?: number
          whatsapp_api_messages?: number
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          api_key: string | null
          configuration: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          provider: string
          secret_key: string | null
          supported_currencies: string[] | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider: string
          secret_key?: string | null
          supported_currencies?: string[] | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider?: string
          secret_key?: string | null
          supported_currencies?: string[] | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      payment_plans: {
        Row: {
          billing_period: string
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          limits: Json | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          billing_period: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          billing_period?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number
          stock: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price?: number
          stock?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number
          stock?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          parent_user_id: string | null
          phone: string | null
          plan_id: string | null
          plan_type: string | null
          profile_type: Database["public"]["Enums"]["profile_type"] | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          parent_user_id?: string | null
          phone?: string | null
          plan_id?: string | null
          plan_type?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          parent_user_id?: string | null
          phone?: string | null
          plan_id?: string | null
          plan_type?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_replies: {
        Row: {
          attachment_urls: string[] | null
          created_at: string | null
          hotkey: string | null
          id: string
          message: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachment_urls?: string[] | null
          created_at?: string | null
          hotkey?: string | null
          id?: string
          message: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachment_urls?: string[] | null
          created_at?: string | null
          hotkey?: string | null
          id?: string
          message?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          sale_date: string
          seller_id: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          sale_date?: string
          seller_id: string
          total_amount?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          sale_date?: string
          seller_id?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          lead_id: string
          message_content: string
          phone_number: string
          retry_count: number | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          trigger_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          lead_id: string
          message_content: string
          phone_number: string
          retry_count?: number | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          trigger_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          lead_id?: string
          message_content?: string
          phone_number?: string
          retry_count?: number | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          trigger_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "column_message_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      system_status: {
        Row: {
          component_name: string
          created_at: string | null
          error_message: string | null
          id: string
          last_check_at: string | null
          metadata: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          component_name: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_check_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          component_name?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_check_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tareas: {
        Row: {
          asignada: number | null
          categoria: string
          creado_por: number | null
          created_at: string
          descripion: string | null
          fecha: string
          hora: string | null
          id: number
          prioridad: string
          titulo: string
        }
        Insert: {
          asignada?: number | null
          categoria?: string
          creado_por?: number | null
          created_at?: string
          descripion?: string | null
          fecha: string
          hora?: string | null
          id?: number
          prioridad?: string
          titulo: string
        }
        Update: {
          asignada?: number | null
          categoria?: string
          creado_por?: number | null
          created_at?: string
          descripion?: string | null
          fecha?: string
          hora?: string | null
          id?: number
          prioridad?: string
          titulo?: string
        }
        Relationships: []
      }
      telegram_bots: {
        Row: {
          ai_enabled: boolean | null
          bot_id: number | null
          bot_name: string
          bot_token: string
          bot_username: string | null
          created_at: string | null
          default_column_id: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
          workspace_id: string | null
        }
        Insert: {
          ai_enabled?: boolean | null
          bot_id?: number | null
          bot_name: string
          bot_token: string
          bot_username?: string | null
          created_at?: string | null
          default_column_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
          workspace_id?: string | null
        }
        Update: {
          ai_enabled?: boolean | null
          bot_id?: number | null
          bot_name?: string
          bot_token?: string
          bot_username?: string | null
          created_at?: string | null
          default_column_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_bots_default_column_id_fkey"
            columns: ["default_column_id"]
            isOneToOne: false
            referencedRelation: "lead_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_bots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      twilio_connections: {
        Row: {
          account_sid: string
          ai_enabled: boolean | null
          auth_token: string
          connection_name: string
          created_at: string | null
          default_column_id: string | null
          id: string
          n8n_webhook_url: string | null
          phone_number: string
          status: string | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
          workspace_id: string | null
        }
        Insert: {
          account_sid: string
          ai_enabled?: boolean | null
          auth_token: string
          connection_name: string
          created_at?: string | null
          default_column_id?: string | null
          id?: string
          n8n_webhook_url?: string | null
          phone_number: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
          workspace_id?: string | null
        }
        Update: {
          account_sid?: string
          ai_enabled?: boolean | null
          auth_token?: string
          connection_name?: string
          created_at?: string | null
          default_column_id?: string | null
          id?: string
          n8n_webhook_url?: string | null
          phone_number?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "twilio_connections_default_column_id_fkey"
            columns: ["default_column_id"]
            isOneToOne: false
            referencedRelation: "lead_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "twilio_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      twilio_daily_usage: {
        Row: {
          created_at: string | null
          id: string
          messages_sent: number | null
          twilio_connection_id: string
          updated_at: string | null
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages_sent?: number | null
          twilio_connection_id: string
          updated_at?: string | null
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          messages_sent?: number | null
          twilio_connection_id?: string
          updated_at?: string | null
          usage_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "twilio_daily_usage_twilio_connection_id_fkey"
            columns: ["twilio_connection_id"]
            isOneToOne: false
            referencedRelation: "twilio_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          resource_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          resource_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bot_settings: {
        Row: {
          auto_stop_on_human_reply: boolean | null
          bot_enabled: boolean
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_stop_on_human_reply?: boolean | null
          bot_enabled?: boolean
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_stop_on_human_reply?: boolean | null
          bot_enabled?: boolean
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          puede_asignar_tareas: boolean | null
          puede_configurar_bot: boolean | null
          puede_crear_agentes_ia: boolean | null
          puede_crear_campanas_masivas: boolean | null
          puede_crear_contactos: boolean | null
          puede_crear_embudos: boolean | null
          puede_crear_listas_contactos: boolean | null
          puede_crear_tareas: boolean | null
          puede_crear_ventas: boolean | null
          puede_editar_agentes_ia: boolean | null
          puede_editar_campanas_masivas: boolean | null
          puede_editar_configuracion: boolean | null
          puede_editar_contactos: boolean | null
          puede_editar_embudos: boolean | null
          puede_editar_listas_contactos: boolean | null
          puede_editar_tareas: boolean | null
          puede_editar_ventas: boolean | null
          puede_eliminar_agentes_ia: boolean | null
          puede_eliminar_campanas_masivas: boolean | null
          puede_eliminar_contactos: boolean | null
          puede_eliminar_embudos: boolean | null
          puede_eliminar_listas_contactos: boolean | null
          puede_eliminar_mensajes: boolean | null
          puede_eliminar_tareas: boolean | null
          puede_eliminar_ventas: boolean | null
          puede_enviar_campanas_masivas: boolean | null
          puede_enviar_chat_interno: boolean | null
          puede_enviar_mensajes: boolean | null
          puede_exportar_datos: boolean | null
          puede_gestionar_etiquetas: boolean | null
          puede_gestionar_facebook: boolean | null
          puede_gestionar_ia: boolean | null
          puede_gestionar_instagram: boolean | null
          puede_gestionar_integraciones: boolean | null
          puede_gestionar_plantillas: boolean | null
          puede_gestionar_respuestas_rapidas: boolean | null
          puede_gestionar_telegram: boolean | null
          puede_gestionar_usuarios: boolean | null
          puede_gestionar_whatsapp: boolean | null
          puede_gestionar_workspaces: boolean | null
          puede_importar_contactos: boolean | null
          puede_mover_contactos_embudos: boolean | null
          puede_responder_chat_landing: boolean | null
          puede_ver_agentes_ia: boolean | null
          puede_ver_analytics: boolean | null
          puede_ver_calendario: boolean | null
          puede_ver_campanas_masivas: boolean | null
          puede_ver_chat_interno: boolean | null
          puede_ver_chat_landing: boolean | null
          puede_ver_chats: boolean | null
          puede_ver_configuracion: boolean | null
          puede_ver_contactos: boolean | null
          puede_ver_dashboard: boolean | null
          puede_ver_embudos: boolean | null
          puede_ver_listas_contactos: boolean | null
          puede_ver_mensajes_otros: boolean | null
          puede_ver_reportes: boolean | null
          puede_ver_tareas: boolean | null
          puede_ver_ventas: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          puede_asignar_tareas?: boolean | null
          puede_configurar_bot?: boolean | null
          puede_crear_agentes_ia?: boolean | null
          puede_crear_campanas_masivas?: boolean | null
          puede_crear_contactos?: boolean | null
          puede_crear_embudos?: boolean | null
          puede_crear_listas_contactos?: boolean | null
          puede_crear_tareas?: boolean | null
          puede_crear_ventas?: boolean | null
          puede_editar_agentes_ia?: boolean | null
          puede_editar_campanas_masivas?: boolean | null
          puede_editar_configuracion?: boolean | null
          puede_editar_contactos?: boolean | null
          puede_editar_embudos?: boolean | null
          puede_editar_listas_contactos?: boolean | null
          puede_editar_tareas?: boolean | null
          puede_editar_ventas?: boolean | null
          puede_eliminar_agentes_ia?: boolean | null
          puede_eliminar_campanas_masivas?: boolean | null
          puede_eliminar_contactos?: boolean | null
          puede_eliminar_embudos?: boolean | null
          puede_eliminar_listas_contactos?: boolean | null
          puede_eliminar_mensajes?: boolean | null
          puede_eliminar_tareas?: boolean | null
          puede_eliminar_ventas?: boolean | null
          puede_enviar_campanas_masivas?: boolean | null
          puede_enviar_chat_interno?: boolean | null
          puede_enviar_mensajes?: boolean | null
          puede_exportar_datos?: boolean | null
          puede_gestionar_etiquetas?: boolean | null
          puede_gestionar_facebook?: boolean | null
          puede_gestionar_ia?: boolean | null
          puede_gestionar_instagram?: boolean | null
          puede_gestionar_integraciones?: boolean | null
          puede_gestionar_plantillas?: boolean | null
          puede_gestionar_respuestas_rapidas?: boolean | null
          puede_gestionar_telegram?: boolean | null
          puede_gestionar_usuarios?: boolean | null
          puede_gestionar_whatsapp?: boolean | null
          puede_gestionar_workspaces?: boolean | null
          puede_importar_contactos?: boolean | null
          puede_mover_contactos_embudos?: boolean | null
          puede_responder_chat_landing?: boolean | null
          puede_ver_agentes_ia?: boolean | null
          puede_ver_analytics?: boolean | null
          puede_ver_calendario?: boolean | null
          puede_ver_campanas_masivas?: boolean | null
          puede_ver_chat_interno?: boolean | null
          puede_ver_chat_landing?: boolean | null
          puede_ver_chats?: boolean | null
          puede_ver_configuracion?: boolean | null
          puede_ver_contactos?: boolean | null
          puede_ver_dashboard?: boolean | null
          puede_ver_embudos?: boolean | null
          puede_ver_listas_contactos?: boolean | null
          puede_ver_mensajes_otros?: boolean | null
          puede_ver_reportes?: boolean | null
          puede_ver_tareas?: boolean | null
          puede_ver_ventas?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          puede_asignar_tareas?: boolean | null
          puede_configurar_bot?: boolean | null
          puede_crear_agentes_ia?: boolean | null
          puede_crear_campanas_masivas?: boolean | null
          puede_crear_contactos?: boolean | null
          puede_crear_embudos?: boolean | null
          puede_crear_listas_contactos?: boolean | null
          puede_crear_tareas?: boolean | null
          puede_crear_ventas?: boolean | null
          puede_editar_agentes_ia?: boolean | null
          puede_editar_campanas_masivas?: boolean | null
          puede_editar_configuracion?: boolean | null
          puede_editar_contactos?: boolean | null
          puede_editar_embudos?: boolean | null
          puede_editar_listas_contactos?: boolean | null
          puede_editar_tareas?: boolean | null
          puede_editar_ventas?: boolean | null
          puede_eliminar_agentes_ia?: boolean | null
          puede_eliminar_campanas_masivas?: boolean | null
          puede_eliminar_contactos?: boolean | null
          puede_eliminar_embudos?: boolean | null
          puede_eliminar_listas_contactos?: boolean | null
          puede_eliminar_mensajes?: boolean | null
          puede_eliminar_tareas?: boolean | null
          puede_eliminar_ventas?: boolean | null
          puede_enviar_campanas_masivas?: boolean | null
          puede_enviar_chat_interno?: boolean | null
          puede_enviar_mensajes?: boolean | null
          puede_exportar_datos?: boolean | null
          puede_gestionar_etiquetas?: boolean | null
          puede_gestionar_facebook?: boolean | null
          puede_gestionar_ia?: boolean | null
          puede_gestionar_instagram?: boolean | null
          puede_gestionar_integraciones?: boolean | null
          puede_gestionar_plantillas?: boolean | null
          puede_gestionar_respuestas_rapidas?: boolean | null
          puede_gestionar_telegram?: boolean | null
          puede_gestionar_usuarios?: boolean | null
          puede_gestionar_whatsapp?: boolean | null
          puede_gestionar_workspaces?: boolean | null
          puede_importar_contactos?: boolean | null
          puede_mover_contactos_embudos?: boolean | null
          puede_responder_chat_landing?: boolean | null
          puede_ver_agentes_ia?: boolean | null
          puede_ver_analytics?: boolean | null
          puede_ver_calendario?: boolean | null
          puede_ver_campanas_masivas?: boolean | null
          puede_ver_chat_interno?: boolean | null
          puede_ver_chat_landing?: boolean | null
          puede_ver_chats?: boolean | null
          puede_ver_configuracion?: boolean | null
          puede_ver_contactos?: boolean | null
          puede_ver_dashboard?: boolean | null
          puede_ver_embudos?: boolean | null
          puede_ver_listas_contactos?: boolean | null
          puede_ver_mensajes_otros?: boolean | null
          puede_ver_reportes?: boolean | null
          puede_ver_tareas?: boolean | null
          puede_ver_ventas?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          external_subscription_id: string | null
          id: string
          payment_provider: string | null
          plan_id: string
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          external_subscription_id?: string | null
          id?: string
          payment_provider?: string | null
          plan_id: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          external_subscription_id?: string | null
          id?: string
          payment_provider?: string | null
          plan_id?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage: {
        Row: {
          bot_responses_this_month: number | null
          campaigns_this_month: number | null
          contacts_used: number | null
          conversations_used: number | null
          created_at: string | null
          device_sessions_used: number | null
          id: string
          storage_used_mb: number | null
          updated_at: string | null
          usage_month: string
          user_id: string
          whatsapp_connections_used: number | null
        }
        Insert: {
          bot_responses_this_month?: number | null
          campaigns_this_month?: number | null
          contacts_used?: number | null
          conversations_used?: number | null
          created_at?: string | null
          device_sessions_used?: number | null
          id?: string
          storage_used_mb?: number | null
          updated_at?: string | null
          usage_month: string
          user_id: string
          whatsapp_connections_used?: number | null
        }
        Update: {
          bot_responses_this_month?: number | null
          campaigns_this_month?: number | null
          contacts_used?: number | null
          conversations_used?: number | null
          created_at?: string | null
          device_sessions_used?: number | null
          id?: string
          storage_used_mb?: number | null
          updated_at?: string | null
          usage_month?: string
          user_id?: string
          whatsapp_connections_used?: number | null
        }
        Relationships: []
      }
      vapi_assistants: {
        Row: {
          created_at: string | null
          first_message: string | null
          id: string
          model_name: string | null
          model_provider: string | null
          name: string
          system_prompt: string | null
          vapi_assistant_id: string
          voice_id: string | null
          voice_provider: string | null
        }
        Insert: {
          created_at?: string | null
          first_message?: string | null
          id?: string
          model_name?: string | null
          model_provider?: string | null
          name: string
          system_prompt?: string | null
          vapi_assistant_id: string
          voice_id?: string | null
          voice_provider?: string | null
        }
        Update: {
          created_at?: string | null
          first_message?: string | null
          id?: string
          model_name?: string | null
          model_provider?: string | null
          name?: string
          system_prompt?: string | null
          vapi_assistant_id?: string
          voice_id?: string | null
          voice_provider?: string | null
        }
        Relationships: []
      }
      vapi_calls: {
        Row: {
          assistant_id: string | null
          campaign_id: string | null
          created_at: string | null
          destination: string
          duration_seconds: number | null
          ended_at: string | null
          ended_reason: string | null
          id: string
          intent: Json | null
          phone_number_id: string | null
          raw_event: Json | null
          recording_url: string | null
          started_at: string | null
          status: string | null
          summary: string | null
          transcript: string | null
          updated_at: string | null
          vapi_call_id: string | null
        }
        Insert: {
          assistant_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          destination: string
          duration_seconds?: number | null
          ended_at?: string | null
          ended_reason?: string | null
          id?: string
          intent?: Json | null
          phone_number_id?: string | null
          raw_event?: Json | null
          recording_url?: string | null
          started_at?: string | null
          status?: string | null
          summary?: string | null
          transcript?: string | null
          updated_at?: string | null
          vapi_call_id?: string | null
        }
        Update: {
          assistant_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          destination?: string
          duration_seconds?: number | null
          ended_at?: string | null
          ended_reason?: string | null
          id?: string
          intent?: Json | null
          phone_number_id?: string | null
          raw_event?: Json | null
          recording_url?: string | null
          started_at?: string | null
          status?: string | null
          summary?: string | null
          transcript?: string | null
          updated_at?: string | null
          vapi_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vapi_calls_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ia_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      vapi_campaigns: {
        Row: {
          assistant_id: string | null
          contacts: Json
          created_at: string | null
          id: string
          name: string
          phone_number_id: string | null
          status: string | null
        }
        Insert: {
          assistant_id?: string | null
          contacts: Json
          created_at?: string | null
          id?: string
          name: string
          phone_number_id?: string | null
          status?: string | null
        }
        Update: {
          assistant_id?: string | null
          contacts?: Json
          created_at?: string | null
          id?: string
          name?: string
          phone_number_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      vapi_phone_numbers: {
        Row: {
          created_at: string | null
          friendly_name: string | null
          id: string
          phone_number: string | null
          vapi_phone_number_id: string
        }
        Insert: {
          created_at?: string | null
          friendly_name?: string | null
          id?: string
          phone_number?: string | null
          vapi_phone_number_id: string
        }
        Update: {
          created_at?: string | null
          friendly_name?: string | null
          id?: string
          phone_number?: string | null
          vapi_phone_number_id?: string
        }
        Relationships: []
      }
      vapi_voices: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          name: string | null
          provider: string
          raw_data: Json | null
          vapi_voice_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          name?: string | null
          provider: string
          raw_data?: Json | null
          vapi_voice_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          name?: string | null
          provider?: string
          raw_data?: Json | null
          vapi_voice_id?: string
        }
        Relationships: []
      }
      web_chatbots: {
        Row: {
          ai_agent_id: string | null
          ai_enabled: boolean | null
          allowed_domains: string[] | null
          background_image_url: string | null
          created_at: string | null
          default_column_id: string | null
          height: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          placeholder_text: string | null
          position: string | null
          primary_color: string | null
          updated_at: string | null
          user_id: string
          welcome_message: string | null
          widget_type: string | null
          width: string | null
          workspace_id: string | null
        }
        Insert: {
          ai_agent_id?: string | null
          ai_enabled?: boolean | null
          allowed_domains?: string[] | null
          background_image_url?: string | null
          created_at?: string | null
          default_column_id?: string | null
          height?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          placeholder_text?: string | null
          position?: string | null
          primary_color?: string | null
          updated_at?: string | null
          user_id: string
          welcome_message?: string | null
          widget_type?: string | null
          width?: string | null
          workspace_id?: string | null
        }
        Update: {
          ai_agent_id?: string | null
          ai_enabled?: boolean | null
          allowed_domains?: string[] | null
          background_image_url?: string | null
          created_at?: string | null
          default_column_id?: string | null
          height?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          placeholder_text?: string | null
          position?: string | null
          primary_color?: string | null
          updated_at?: string | null
          user_id?: string
          welcome_message?: string | null
          widget_type?: string | null
          width?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "web_chatbots_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "web_chatbots_default_column_id_fkey"
            columns: ["default_column_id"]
            isOneToOne: false
            referencedRelation: "lead_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "web_chatbots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      webchat_ai_settings: {
        Row: {
          cashier_numbers: string
          casino_link: string | null
          cbu: string
          created_at: string | null
          id: number
          is_enabled: boolean
          max_tokens: number
          model: string
          system_prompt: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cashier_numbers?: string
          casino_link?: string | null
          cbu?: string
          created_at?: string | null
          id?: number
          is_enabled?: boolean
          max_tokens?: number
          model?: string
          system_prompt?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cashier_numbers?: string
          casino_link?: string | null
          cbu?: string
          created_at?: string | null
          id?: number
          is_enabled?: boolean
          max_tokens?: number
          model?: string
          system_prompt?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_connections: {
        Row: {
          ai_enabled: boolean | null
          connection_subtype: string | null
          created_at: string | null
          default_column_id: string | null
          id: string
          n8n_webhook_url: string | null
          name: string | null
          phone_number: string
          qr_code: string | null
          session_data: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          ai_enabled?: boolean | null
          connection_subtype?: string | null
          created_at?: string | null
          default_column_id?: string | null
          id?: string
          n8n_webhook_url?: string | null
          name?: string | null
          phone_number: string
          qr_code?: string | null
          session_data?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          ai_enabled?: boolean | null
          connection_subtype?: string | null
          created_at?: string | null
          default_column_id?: string | null
          id?: string
          n8n_webhook_url?: string | null
          name?: string | null
          phone_number?: string
          qr_code?: string | null
          session_data?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_default_column_id_fkey"
            columns: ["default_column_id"]
            isOneToOne: false
            referencedRelation: "lead_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          casino_api_config_id: string | null
          channel_type: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          position: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          casino_api_config_id?: string | null
          channel_type?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          position?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          casino_api_config_id?: string | null
          channel_type?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          position?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_casino_api_config_id_fkey"
            columns: ["casino_api_config_id"]
            isOneToOne: false
            referencedRelation: "casino_api_configs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_assign_conversation: {
        Args: { p_conversation_id: string }
        Returns: string
      }
      check_message_exists_by_waha_id: {
        Args: { p_waha_id: string }
        Returns: boolean
      }
      get_account_owner_id: { Args: { user_id: string }; Returns: string }
      get_conversations_by_hour: {
        Args: { p_start_date: string; p_user_id: string }
        Returns: {
          hour: number
          new_count: number
          recurring_count: number
        }[]
      }
      get_conversion_rate: {
        Args: { p_user_id: string }
        Returns: {
          qualified_leads: number
          total_leads: number
        }[]
      }
      get_messages_by_hour: {
        Args: { p_start_date: string; p_user_id: string }
        Returns: {
          hour: number
          incoming: number
          outgoing: number
        }[]
      }
      get_messages_heatmap: {
        Args: { p_start_date: string; p_user_id: string }
        Returns: {
          day_of_week: number
          hour: number
          msg_count: number
        }[]
      }
      get_unread_count: { Args: { user_uuid: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_usage: {
        Args: { p_amount?: number; p_resource_type: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "user" | "cashier"
      profile_type: "superadmin" | "client" | "cajero"
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
      app_role: ["superadmin", "admin", "user", "cashier"],
      profile_type: ["superadmin", "client", "cajero"],
    },
  },
} as const
