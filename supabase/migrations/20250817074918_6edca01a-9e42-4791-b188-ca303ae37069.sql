-- ===============================
-- 1. Profiles Table Setup
-- ===============================

-- Create new profiles table (different from existing one)
drop table if exists profiles cascade;
create table profiles (
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
create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

-- ===============================
-- 2. Organizations Table Setup
-- ===============================

-- Make domain nullable and add is_default column
alter table organizations alter column domain drop not null;
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
-- 4. Notifications Table Update
-- ===============================

-- Update notifications to reference new profiles table
alter table notifications drop constraint if exists notifications_user_id_fkey;
alter table notifications add constraint notifications_user_id_fkey 
  foreign key (user_id) references profiles(id) on delete set null;

-- Add body column and update category constraint
alter table notifications add column if not exists body text;
alter table notifications alter column user_id drop not null;

-- Update RLS policies
drop policy if exists "Org members can view notifications" on notifications;
create policy "Org members can view notifications"
on notifications for select
using (org_id in (select org_id from profiles where id = auth.uid()));

-- ===============================
-- 5. Event Log Table Update
-- ===============================

-- Update event_log to reference new profiles table
alter table event_log drop constraint if exists event_log_user_id_fkey;
alter table event_log add constraint event_log_user_id_fkey 
  foreign key (user_id) references profiles(id) on delete set null;

-- Rename columns safely
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