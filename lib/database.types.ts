// ---------------------------------------------------------------------------
// Supabase database types for SeoroAI.
//
// Hand-maintained to mirror supabase/migrations. If you change the schema,
// update this file (or regenerate with `supabase gen types typescript`).
// ---------------------------------------------------------------------------

export type SubscriptionTier = "free" | "pro" | "premium";
export type FeatureType = "translation" | "cultural_filter" | "explain_korean";
export type ResourceType = "translation" | "phrase" | "analysis";

export interface NotificationPreferences {
  product_updates: boolean;
  usage_alerts: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  preferred_language: string;
  default_translation_mode: string;
  theme: string;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  feature_type: FeatureType;
  usage_count: number;
  usage_date: string;
  created_at: string;
}

export interface TranslationHistory {
  id: string;
  user_id: string;
  feature_type: FeatureType;
  input_text: string;
  output_text: string;
  metadata: Record<string, unknown>;
  is_favorite: boolean;
  created_at: string;
}

export interface SavedPhrase {
  id: string;
  user_id: string;
  title: string;
  category: string;
  phrase_content: string;
  language: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  resource_type: ResourceType;
  resource_id: string;
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string | null;
  is_system: boolean;
  category: string;
  title: string;
  description: string | null;
  situation_hint: string | null;
  sort_order: number;
  created_at: string;
}

// Minimal generated-style Database shape consumed by @supabase/supabase-js.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      usage_tracking: {
        Row: UsageTracking;
        Insert: Partial<UsageTracking> & { user_id: string; feature_type: FeatureType };
        Update: Partial<UsageTracking>;
      };
      translation_history: {
        Row: TranslationHistory;
        Insert: Partial<TranslationHistory> & {
          user_id: string;
          feature_type: FeatureType;
          input_text: string;
          output_text: string;
        };
        Update: Partial<TranslationHistory>;
      };
      saved_phrases: {
        Row: SavedPhrase;
        Insert: Partial<SavedPhrase> & {
          user_id: string;
          title: string;
          phrase_content: string;
        };
        Update: Partial<SavedPhrase>;
      };
      favorites: {
        Row: Favorite;
        Insert: Partial<Favorite> & {
          user_id: string;
          resource_type: ResourceType;
          resource_id: string;
        };
        Update: Partial<Favorite>;
      };
      templates: {
        Row: Template;
        Insert: Partial<Template> & { category: string; title: string };
        Update: Partial<Template>;
      };
    };
    Functions: {
      increment_usage: {
        Args: { p_feature: FeatureType };
        Returns: number;
      };
      usage_today: {
        Args: { p_feature: FeatureType };
        Returns: number;
      };
      usage_this_month: {
        Args: { p_feature: FeatureType };
        Returns: number;
      };
    };
  };
}
