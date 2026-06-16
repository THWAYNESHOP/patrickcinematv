import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      watch_progress: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          progress: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          progress: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          progress?: number;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          title: string;
          poster: string;
          type: 'movie' | 'tv' | 'anime' | 'sports';
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          title: string;
          poster: string;
          type: 'movie' | 'tv' | 'anime' | 'sports';
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          title?: string;
          poster?: string;
          type?: 'movie' | 'tv' | 'anime' | 'sports';
          added_at?: string;
        };
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          title: string;
          poster: string;
          type: 'movie' | 'tv' | 'anime' | 'sports';
          timestamp: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          title: string;
          poster: string;
          type: 'movie' | 'tv' | 'anime' | 'sports';
          timestamp?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          title?: string;
          poster?: string;
          type?: 'movie' | 'tv' | 'anime' | 'sports';
          timestamp?: number;
        };
      };
    };
  };
};
