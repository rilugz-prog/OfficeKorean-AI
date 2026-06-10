-- =====================================================================
-- SeoroAI — Phase 2 schema
-- Migration 0002: functions & triggers
-- =====================================================================

-- updated_at maintenance ------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists saved_phrases_set_updated_at on public.saved_phrases;
create trigger saved_phrases_set_updated_at
  before update on public.saved_phrases
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user is created -------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic usage increment ------------------------------------------------
-- Upserts the (user, feature, today) row and returns the new count.
-- SECURITY DEFINER so it can run under RLS while still scoping to the
-- authenticated caller (auth.uid()).
create or replace function public.increment_usage(p_feature feature_type)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.usage_tracking (user_id, feature_type, usage_count, usage_date)
  values (v_uid, p_feature, 1, current_date)
  on conflict (user_id, feature_type, usage_date)
  do update set usage_count = public.usage_tracking.usage_count + 1
  returning usage_count into v_count;

  return v_count;
end;
$$;

-- Today's usage count for a feature ------------------------------------
create or replace function public.usage_today(p_feature feature_type)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select usage_count
       from public.usage_tracking
      where user_id = auth.uid()
        and feature_type = p_feature
        and usage_date = current_date),
    0);
$$;

-- This month's usage count for a feature (used for explain_korean) ------
create or replace function public.usage_this_month(p_feature feature_type)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(sum(usage_count), 0)::integer
    from public.usage_tracking
   where user_id = auth.uid()
     and feature_type = p_feature
     and usage_date >= date_trunc('month', current_date)::date;
$$;
