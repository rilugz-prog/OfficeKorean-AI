-- =====================================================================
-- OfficeKorean AI — Phase 2 schema
-- Migration 0001: extensions, enums, tables, indexes
-- =====================================================================

-- Required extensions ---------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- Enums -----------------------------------------------------------------
do $$ begin
  create type subscription_tier as enum ('free', 'pro', 'premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type feature_type as enum ('translation', 'cultural_filter', 'explain_korean');
exception when duplicate_object then null; end $$;

do $$ begin
  create type resource_type as enum ('translation', 'phrase', 'analysis');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- profiles
-- 1:1 with auth.users. Created automatically by a trigger on signup.
-- =====================================================================
create table if not exists public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  email                    text,
  full_name                text,
  avatar_url               text,
  subscription_tier        subscription_tier not null default 'free',
  preferred_language       text not null default 'en',
  default_translation_mode text not null default 'team-member',
  theme                    text not null default 'system',
  notification_preferences jsonb not null default '{"product_updates": true, "usage_alerts": true}'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- =====================================================================
-- usage_tracking
-- One row per (user, feature, day). usage_count is incremented atomically.
-- =====================================================================
create table if not exists public.usage_tracking (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  feature_type feature_type not null,
  usage_count  integer not null default 0,
  usage_date   date not null default current_date,
  created_at   timestamptz not null default now(),
  unique (user_id, feature_type, usage_date)
);

create index if not exists usage_tracking_user_date_idx
  on public.usage_tracking (user_id, usage_date);

-- =====================================================================
-- translation_history
-- =====================================================================
create table if not exists public.translation_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  feature_type feature_type not null,
  input_text   text not null,
  output_text  text not null,
  metadata     jsonb not null default '{}'::jsonb,
  is_favorite  boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists translation_history_user_created_idx
  on public.translation_history (user_id, created_at desc);
create index if not exists translation_history_user_feature_idx
  on public.translation_history (user_id, feature_type);
create index if not exists translation_history_favorite_idx
  on public.translation_history (user_id, is_favorite) where is_favorite;

-- =====================================================================
-- saved_phrases
-- =====================================================================
create table if not exists public.saved_phrases (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  category       text not null default 'Custom',
  phrase_content text not null,
  language       text not null default 'ko',
  is_favorite    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists saved_phrases_user_created_idx
  on public.saved_phrases (user_id, created_at desc);
create index if not exists saved_phrases_user_category_idx
  on public.saved_phrases (user_id, category);

-- =====================================================================
-- favorites
-- Generic favorites pointer across resource types.
-- =====================================================================
create table if not exists public.favorites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  resource_type resource_type not null,
  resource_id   uuid not null,
  created_at    timestamptz not null default now(),
  unique (user_id, resource_type, resource_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);

-- =====================================================================
-- templates
-- Built-in workplace templates. System templates have user_id = null and
-- is_system = true; they are readable by every authenticated user. Users
-- may also create their own custom templates (user_id = their id).
-- =====================================================================
create table if not exists public.templates (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  is_system       boolean not null default false,
  category        text not null,
  title           text not null,
  description     text,
  situation_hint  text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists templates_category_idx on public.templates (category, sort_order);
create index if not exists templates_user_idx on public.templates (user_id);
