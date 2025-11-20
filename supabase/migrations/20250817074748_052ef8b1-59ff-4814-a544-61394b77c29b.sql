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

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

-- Ensure at least one default org exists
insert into organizations (name, domain, is_default)
values ('Default Org', null, true)
on conflict (is_default) do nothing;

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

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  user_id uuid references profiles(id) on delete set null,
  org_id uuid references organizations(id) on delete cascade,
  category text check (category in ('scheduler','maintenance','compliance','finance','support','marketing','system')) default 'system',
  read boolean default false,
  created_at timestamp with time zone default now()
);

alter table notifications enable row level security;

-- Allow org members to see their org's notifications
drop policy if exists "Org members can view notifications" on notifications;
create policy "Org members can view notifications"
on notifications for select
using (org_id in (select org_id from profiles where id = auth.uid()));

-- ===============================
-- 5. Event Log Setup
-- ===============================

create table if not exists event_log (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  message text,
  metadata jsonb default '{}'::jsonb,
  user_id uuid references profiles(id) on delete set null,
  org_id uuid references organizations(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table event_log enable row level security;

drop policy if exists "Org members can view event logs" on event_log;
create policy "Org members can view event logs"
on event_log for select
using (org_id in (select org_id from profiles where id = auth.uid()));