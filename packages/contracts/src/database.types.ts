export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string | null
          criteria: string
          description: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          is_special: boolean | null
          points_reward: number | null
          required_value: number | null
          title: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          criteria: string
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          is_special?: boolean | null
          points_reward?: number | null
          required_value?: number | null
          title: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          criteria?: string
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          is_special?: boolean | null
          points_reward?: number | null
          required_value?: number | null
          title?: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      assigned_chores: {
        Row: {
          assigned_at: string | null
          assigned_reward_points: number
          assigned_xp_reward: number
          awarded_reward_points: number
          awarded_xp: number
          child_id: number | null
          chore_id: number | null
          completed_at: string | null
          completion_count: number | null
          created_at: string | null
          id: number
          is_completed: boolean | null
          last_completed_at: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: number | null
          status: string
          submitted_at: string | null
          total_xp_earned: number | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_reward_points?: number
          assigned_xp_reward?: number
          awarded_reward_points?: number
          awarded_xp?: number
          child_id?: number | null
          chore_id?: number | null
          completed_at?: string | null
          completion_count?: number | null
          created_at?: string | null
          id?: number
          is_completed?: boolean | null
          last_completed_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: number | null
          status?: string
          submitted_at?: string | null
          total_xp_earned?: number | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_reward_points?: number
          assigned_xp_reward?: number
          awarded_reward_points?: number
          awarded_xp?: number
          child_id?: number | null
          chore_id?: number | null
          completed_at?: string | null
          completion_count?: number | null
          created_at?: string | null
          id?: number
          is_completed?: boolean | null
          last_completed_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: number | null
          status?: string
          submitted_at?: string | null
          total_xp_earned?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assigned_chores_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_chores_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "chores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_chores_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          age: number | null
          archived_at: string | null
          created_at: string | null
          id: number
          last_played: string | null
          level: number | null
          name: string
          reward_points: number | null
          updated_at: string | null
          user_id: number | null
          xp: number | null
        }
        Insert: {
          age?: number | null
          archived_at?: string | null
          created_at?: string | null
          id?: number
          last_played?: string | null
          level?: number | null
          name: string
          reward_points?: number | null
          updated_at?: string | null
          user_id?: number | null
          xp?: number | null
        }
        Update: {
          age?: number | null
          archived_at?: string | null
          created_at?: string | null
          id?: number
          last_played?: string | null
          level?: number | null
          name?: string
          reward_points?: number | null
          updated_at?: string | null
          user_id?: number | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "child_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_completion_history: {
        Row: {
          assigned_chore_id: number | null
          completed_at: string | null
          created_at: string | null
          id: number
          xp_earned: number
        }
        Insert: {
          assigned_chore_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: number
          xp_earned: number
        }
        Update: {
          assigned_chore_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: number
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "chore_completion_history_assigned_chore_id_fkey"
            columns: ["assigned_chore_id"]
            isOneToOne: false
            referencedRelation: "assigned_chores"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_stats: {
        Row: {
          child_id: number | null
          stats: Json
          updated_at: string | null
        }
        Insert: {
          child_id?: number | null
          stats?: Json
          updated_at?: string | null
        }
        Update: {
          child_id?: number | null
          stats?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chore_stats_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chores: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: number
          reward_points: number
          title: string
          updated_at: string | null
          user_id: number
          xp: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: number
          reward_points?: number
          title: string
          updated_at?: string | null
          user_id: number
          xp?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: number
          reward_points?: number
          title?: string
          updated_at?: string | null
          user_id?: number
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      completed_achievements: {
        Row: {
          achievement_id: number | null
          child_id: number | null
          completed_at: string | null
          id: number
        }
        Insert: {
          achievement_id?: number | null
          child_id?: number | null
          completed_at?: string | null
          id?: number
        }
        Update: {
          achievement_id?: number | null
          child_id?: number | null
          completed_at?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "completed_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_achievements_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_rewards: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string | null
          id: number
          image_url: string | null
          is_active: boolean
          star_cost: number
          title: string
          updated_at: string
          user_id: number
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          star_cost: number
          title: string
          updated_at?: string
          user_id: number
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          star_cost?: number
          title?: string
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "family_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_result_submissions: {
        Row: {
          child_id: number
          completed_at: string | null
          created_at: string | null
          game_type: string
          id: number
          response: Json | null
          session_id: string
        }
        Insert: {
          child_id: number
          completed_at?: string | null
          created_at?: string | null
          game_type: string
          id?: number
          response?: Json | null
          session_id: string
        }
        Update: {
          child_id?: number
          completed_at?: string | null
          created_at?: string | null
          game_type?: string
          id?: number
          response?: Json | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_result_submissions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learned_words: {
        Row: {
          category: string
          child_id: number | null
          id: number
          image: string | null
          learned_at: string | null
          times_learned: number | null
          word: string
          word_id: number | null
        }
        Insert: {
          category: string
          child_id?: number | null
          id?: number
          image?: string | null
          learned_at?: string | null
          times_learned?: number | null
          word: string
          word_id?: number | null
        }
        Update: {
          category?: string
          child_id?: number | null
          id?: number
          image?: string | null
          learned_at?: string | null
          times_learned?: number | null
          word?: string
          word_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learned_words_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "word_categories"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "learned_words_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learned_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["word_id"]
          },
        ]
      }
      math_stats: {
        Row: {
          child_id: number | null
          created_at: string | null
          stats: Json
          updated_at: string | null
        }
        Insert: {
          child_id?: number | null
          created_at?: string | null
          stats?: Json
          updated_at?: string | null
        }
        Update: {
          child_id?: number | null
          created_at?: string | null
          stats?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "math_stats_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_stats: {
        Row: {
          child_id: number | null
          stats: Json
          updated_at: string | null
        }
        Insert: {
          child_id?: number | null
          stats?: Json
          updated_at?: string | null
        }
        Update: {
          child_id?: number | null
          stats?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_stats_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: number
          token: string
          used_at: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: number
          token: string
          used_at?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: number
          token?: string
          used_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_reward_purchases: {
        Row: {
          child_id: number | null
          expiry_date: string | null
          id: number
          is_activated: boolean | null
          purchase_date: string | null
          reward_id: number | null
          user_id: number | null
        }
        Insert: {
          child_id?: number | null
          expiry_date?: string | null
          id?: number
          is_activated?: boolean | null
          purchase_date?: string | null
          reward_id?: number | null
          user_id?: number | null
        }
        Update: {
          child_id?: number | null
          expiry_date?: string | null
          id?: number
          is_activated?: boolean | null
          purchase_date?: string | null
          reward_id?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "premium_reward_purchases_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_reward_purchases_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "premium_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_reward_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_rewards: {
        Row: {
          category: string
          description: string | null
          does_expire: boolean | null
          duration_days: number | null
          id: number
          is_active: boolean | null
          points_required: number
          title: string
        }
        Insert: {
          category: string
          description?: string | null
          does_expire?: boolean | null
          duration_days?: number | null
          id?: number
          is_active?: boolean | null
          points_required: number
          title: string
        }
        Update: {
          category?: string
          description?: string | null
          does_expire?: boolean | null
          duration_days?: number | null
          id?: number
          is_active?: boolean | null
          points_required?: number
          title?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          cancelled_at: string | null
          child_id: number
          created_at: string
          id: number
          refunded_at: string | null
          rejection_reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: number | null
          reward_description: string | null
          reward_id: number | null
          reward_title: string
          star_cost: number
          status: string
          updated_at: string
          user_id: number
        }
        Insert: {
          cancelled_at?: string | null
          child_id: number
          created_at?: string
          id?: number
          refunded_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: number | null
          reward_description?: string | null
          reward_id?: number | null
          reward_title: string
          star_cost: number
          status?: string
          updated_at?: string
          user_id: number
        }
        Update: {
          cancelled_at?: string | null
          child_id?: number
          created_at?: string
          id?: number
          refunded_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: number | null
          reward_description?: string | null
          reward_id?: number | null
          reward_title?: string
          star_cost?: number
          status?: string
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "family_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shape_stats: {
        Row: {
          child_id: number | null
          stats: Json
          updated_at: string | null
        }
        Insert: {
          child_id?: number | null
          stats?: Json
          updated_at?: string | null
        }
        Update: {
          child_id?: number | null
          stats?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shape_stats_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shapes: {
        Row: {
          description: string | null
          id: number
          image: string | null
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          image?: string | null
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          image?: string | null
          name?: string
        }
        Relationships: []
      }
      spelling_stats: {
        Row: {
          child_id: number | null
          created_at: string | null
          stats: Json
          updated_at: string | null
        }
        Insert: {
          child_id?: number | null
          created_at?: string | null
          stats?: Json
          updated_at?: string | null
        }
        Update: {
          child_id?: number | null
          created_at?: string | null
          stats?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spelling_stats_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_chore_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
          user_id: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
          user_id: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_chore_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          display_name: string
          email: string
          id: number
          is_parent: boolean | null
          password_hash: string
          profile_image_url: string | null
          timezone: string | null
          total_children: number | null
          updated_at: string | null
          user_preferences: Json | null
          username: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          email: string
          id?: number
          is_parent?: boolean | null
          password_hash: string
          profile_image_url?: string | null
          timezone?: string | null
          total_children?: number | null
          updated_at?: string | null
          user_preferences?: Json | null
          username: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          email?: string
          id?: number
          is_parent?: boolean | null
          password_hash?: string
          profile_image_url?: string | null
          timezone?: string | null
          total_children?: number | null
          updated_at?: string | null
          user_preferences?: Json | null
          username?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: number
          last_used_at: string | null
          revoked_at: string | null
          token_id: string
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: number
          last_used_at?: string | null
          revoked_at?: string | null
          token_id: string
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: number
          last_used_at?: string | null
          revoked_at?: string | null
          token_id?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      word_categories: {
        Row: {
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      words: {
        Row: {
          category: string
          created_at: string | null
          image: string | null
          updated_at: string | null
          word: string
          word_id: number
        }
        Insert: {
          category: string
          created_at?: string | null
          image?: string | null
          updated_at?: string | null
          word: string
          word_id?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          image?: string | null
          updated_at?: string | null
          word?: string
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "words_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "word_categories"
            referencedColumns: ["name"]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

