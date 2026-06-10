-- =====================================================================
-- SeoroAI — Phase 2 schema
-- Migration 0003: Row Level Security
--
-- Every table is owner-scoped: a user may only read/write rows where
-- user_id = auth.uid(). The templates table additionally exposes
-- read-only system templates (is_system = true) to all authenticated users.
-- =====================================================================

alter table public.profiles            enable row level security;
alter table public.usage_tracking      enable row level security;
alter table public.translation_history enable row level security;
alter table public.saved_phrases       enable row level security;
alter table public.favorites           enable row level security;
alter table public.templates           enable row level security;

-- profiles --------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- usage_tracking --------------------------------------------------------
-- Inserts/updates happen through SECURITY DEFINER functions, but we still
-- allow owner reads so the dashboard can query usage directly.
drop policy if exists "usage_select_own" on public.usage_tracking;
create policy "usage_select_own" on public.usage_tracking
  for select using (auth.uid() = user_id);

drop policy if exists "usage_insert_own" on public.usage_tracking;
create policy "usage_insert_own" on public.usage_tracking
  for insert with check (auth.uid() = user_id);

drop policy if exists "usage_update_own" on public.usage_tracking;
create policy "usage_update_own" on public.usage_tracking
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- translation_history ---------------------------------------------------
drop policy if exists "history_select_own" on public.translation_history;
create policy "history_select_own" on public.translation_history
  for select using (auth.uid() = user_id);

drop policy if exists "history_insert_own" on public.translation_history;
create policy "history_insert_own" on public.translation_history
  for insert with check (auth.uid() = user_id);

drop policy if exists "history_update_own" on public.translation_history;
create policy "history_update_own" on public.translation_history
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "history_delete_own" on public.translation_history;
create policy "history_delete_own" on public.translation_history
  for delete using (auth.uid() = user_id);

-- saved_phrases ---------------------------------------------------------
drop policy if exists "phrases_select_own" on public.saved_phrases;
create policy "phrases_select_own" on public.saved_phrases
  for select using (auth.uid() = user_id);

drop policy if exists "phrases_insert_own" on public.saved_phrases;
create policy "phrases_insert_own" on public.saved_phrases
  for insert with check (auth.uid() = user_id);

drop policy if exists "phrases_update_own" on public.saved_phrases;
create policy "phrases_update_own" on public.saved_phrases
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "phrases_delete_own" on public.saved_phrases;
create policy "phrases_delete_own" on public.saved_phrases
  for delete using (auth.uid() = user_id);

-- favorites -------------------------------------------------------------
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- templates -------------------------------------------------------------
-- Anyone authenticated can read system templates; users can read/write
-- their own custom templates.
drop policy if exists "templates_select_visible" on public.templates;
create policy "templates_select_visible" on public.templates
  for select using (is_system = true or auth.uid() = user_id);

drop policy if exists "templates_insert_own" on public.templates;
create policy "templates_insert_own" on public.templates
  for insert with check (auth.uid() = user_id and is_system = false);

drop policy if exists "templates_update_own" on public.templates;
create policy "templates_update_own" on public.templates
  for update using (auth.uid() = user_id and is_system = false)
  with check (auth.uid() = user_id and is_system = false);

drop policy if exists "templates_delete_own" on public.templates;
create policy "templates_delete_own" on public.templates
  for delete using (auth.uid() = user_id and is_system = false);
