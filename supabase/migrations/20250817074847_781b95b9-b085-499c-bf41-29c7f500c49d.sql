-- ===============================
-- 1. Profiles Table Setup
-- ===============================

-- Ensure profiles table exists
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  role text default 'pending',
  org_id uuid references organizations(id),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies: allow users to manage their own profile
drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

-- ===============================
-- 2. Organizations Table Setup
-- ===============================

-- Add missing column to existing organizations table
alter table organizations add column if not exists is_default boolean default false;

-- Ensure at least one default org exists
insert into organizations (name, domain, is_default)
values ('Default Org', null, true)
on conflict do nothing;

-- ===============================
-- 3. Trigger to Sync auth.users → profiles
-- ===============================

create or replace function handle_new_user()
returns trigger as $$
declare
  default_org uuid;
begin
  -- get default org
  select id into default_org from organizations where is_default = true limit 1;

  -- insert profile
  insert into profiles (id, email, org_id)
  values (new.id, new.email, default_org);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ===============================
-- 4. Notifications Table Setup
-- ===============================

-- Update existing notifications table
alter table notifications add column if not exists body text;
alter table notifications alter column user_id drop not null;

-- Add category constraint if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.check_constraints 
                 where constraint_name = 'notifications_category_check') then
    alter table notifications add constraint notifications_category_check 
      check (category in ('scheduler','maintenance','compliance','finance','support','marketing','system'));
  end if;
end $$;

-- Update RLS policies
drop policy if exists "Org members can view notifications" on notifications;
create policy "Org members can view notifications"
on notifications for select
using (org_id in (select org_id from profiles where id = auth.uid()));

-- ===============================
-- 5. Event Log Setup
-- ===============================

-- Update existing event_log table columns safely
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'event_log' and column_name = 'action') then
    alter table event_log rename column action to type;
  end if;
  
  if exists (select 1 from information_schema.columns where table_name = 'event_log' and column_name = 'description') then
    alter table event_log rename column description to message;
  end if;
end $$;

alter table event_log alter column user_id drop not null;

-- Update RLS policies
drop policy if exists "Org members can view event logs" on event_log;
create policy "Org members can view event logs"
on event_log for select
using (org_id in (select org_id from profiles where id = auth.uid()));