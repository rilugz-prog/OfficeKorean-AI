// ---------------------------------------------------------------------------
// Domain types for SeoroAI — the API / wire contract.
//
// These describe the JSON shapes returned by the Route Handlers and consumed
// by the client hooks & components (snake_case, dates as ISO strings). They
// intentionally mirror the Drizzle row types in lib/db/schema.ts but use
// `string` for timestamps (as serialized over HTTP). The Drizzle `*Row` types
// (with `Date` timestamps) are for server-side use only.
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
  clerk_user_id: string;
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
