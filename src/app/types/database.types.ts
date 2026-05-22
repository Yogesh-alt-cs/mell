// Supabase Database Types (simplified for Mellow Quiz)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          xp: number;
          level: number;
          streak_days: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          icon_key: string;
          accent: string | null;
          sort_order: number;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']>;
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      quizzes: {
        Row: {
          id: string;
          title: string;
          category_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['quizzes']['Row']>;
        Update: Partial<Database['public']['Tables']['quizzes']['Row']>;
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string | null;
          score: number;
          total: number;
          time_seconds: number;
          completed_at: string;
        };
        Insert: Partial<Database['public']['Tables']['quiz_attempts']['Row']>;
        Update: Partial<Database['public']['Tables']['quiz_attempts']['Row']>;
      };
    };
  };
}
