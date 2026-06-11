// ---------------------------------------------------------------------------
// Drizzle ORM schema for SeoroAI (Neon PostgreSQL).
//
// Mirrors the original Supabase migrations 1:1, with two changes for the
// Clerk + Neon stack:
//   - `profiles.id` is a self-generated uuid PK (no auth.users FK).
//   - `profiles.clerk_user_id` is the external identity (unique).
// All other tables FK to `profiles.id`, so the rest of the schema is unchanged.
//
// NOTE: JS property names are kept identical to the DB columns (snake_case) so
// that Drizzle rows match the existing API/wire contract (and the frontend
// types in lib/database.types.ts) without any field remapping.
// ---------------------------------------------------------------------------

import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// --- Enums -----------------------------------------------------------------
export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
  "premium",
]);

export const featureTypeEnum = pgEnum("feature_type", [
  "translation",
  "cultural_filter",
  "explain_korean",
]);

export const resourceTypeEnum = pgEnum("resource_type", [
  "translation",
  "phrase",
  "analysis",
]);

interface NotificationPreferences {
  product_updates: boolean;
  usage_alerts: boolean;
}

// --- profiles --------------------------------------------------------------
// 1:1 with a Clerk user. Created by the Clerk webhook on sign-up (and lazily
// by the server auth helpers as a defensive fallback).
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerk_user_id: text("clerk_user_id").notNull().unique(),
  email: text("email"),
  full_name: text("full_name"),
  avatar_url: text("avatar_url"),
  subscription_tier: subscriptionTierEnum("subscription_tier")
    .notNull()
    .default("free"),
  preferred_language: text("preferred_language").notNull().default("en"),
  default_translation_mode: text("default_translation_mode")
    .notNull()
    .default("team-member"),
  theme: text("theme").notNull().default("system"),
  notification_preferences: jsonb("notification_preferences")
    .$type<NotificationPreferences>()
    .notNull()
    .default(sql`'{"product_updates": true, "usage_alerts": true}'::jsonb`),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- usage_tracking --------------------------------------------------------
// One row per (user, feature, day). usage_count is incremented atomically.
export const usage_tracking = pgTable(
  "usage_tracking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    feature_type: featureTypeEnum("feature_type").notNull(),
    usage_count: integer("usage_count").notNull().default(0),
    usage_date: date("usage_date").notNull().defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("usage_tracking_user_feature_date_key").on(
      t.user_id,
      t.feature_type,
      t.usage_date
    ),
    index("usage_tracking_user_date_idx").on(t.user_id, t.usage_date),
  ]
);

// --- translation_history ---------------------------------------------------
export const translation_history = pgTable(
  "translation_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    feature_type: featureTypeEnum("feature_type").notNull(),
    input_text: text("input_text").notNull(),
    output_text: text("output_text").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    is_favorite: boolean("is_favorite").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("translation_history_user_created_idx").on(
      t.user_id,
      t.created_at.desc()
    ),
    index("translation_history_user_feature_idx").on(t.user_id, t.feature_type),
  ]
);

// --- saved_phrases ---------------------------------------------------------
export const saved_phrases = pgTable(
  "saved_phrases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull().default("Custom"),
    phrase_content: text("phrase_content").notNull(),
    language: text("language").notNull().default("ko"),
    is_favorite: boolean("is_favorite").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("saved_phrases_user_created_idx").on(t.user_id, t.created_at.desc()),
    index("saved_phrases_user_category_idx").on(t.user_id, t.category),
  ]
);

// --- favorites -------------------------------------------------------------
// Generic favorites pointer across resource types.
export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    resource_type: resourceTypeEnum("resource_type").notNull(),
    resource_id: uuid("resource_id").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("favorites_user_resource_key").on(
      t.user_id,
      t.resource_type,
      t.resource_id
    ),
    index("favorites_user_idx").on(t.user_id),
  ]
);

// --- templates -------------------------------------------------------------
// Built-in workplace templates. System templates have user_id = null and
// is_system = true; they are readable by every authenticated user. Users may
// also create their own custom templates (user_id = their profile id).
export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
    is_system: boolean("is_system").notNull().default(false),
    category: text("category").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    situation_hint: text("situation_hint"),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("templates_category_idx").on(t.category, t.sort_order),
    index("templates_user_idx").on(t.user_id),
  ]
);

// --- Inferred row types (server-side) --------------------------------------
export type ProfileRow = typeof profiles.$inferSelect;
export type UsageTrackingRow = typeof usage_tracking.$inferSelect;
export type TranslationHistoryRow = typeof translation_history.$inferSelect;
export type SavedPhraseRow = typeof saved_phrases.$inferSelect;
export type FavoriteRow = typeof favorites.$inferSelect;
export type TemplateRow = typeof templates.$inferSelect;
