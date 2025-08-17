-- 1. Add org_id column with foreign key reference
alter table notifications
add column org_id uuid references organizations(id) on delete cascade;

-- 2. Make sure existing rows don't break
-- (optional: set org_id = null for past notifications)
update notifications set org_id = null where org_id is null;

-- 3. Enable Row Level Security
alter table notifications enable row level security;

-- 4. Drop old policies if any
drop policy if exists "notif_user_reads_self" on notifications;
drop policy if exists "notif_admin_reads_org" on notifications;
drop policy if exists "notif_user_read_own" on notifications;
drop policy if exists "notif_admin_read_org" on notifications;
drop policy if exists "notif_user_update_own" on notifications;

-- 5. Recreate policies

-- Users can only read their own personal notifications
create policy "notif_user_reads_self"
on notifications for select
using (user_id = auth.uid());

-- Admins can read all notifications for their organization
create policy "notif_admin_reads_org"
on notifications for select
using (
  exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and p.org_id = notifications.org_id
      and p.role in ('admin','super_admin')
  )
);

-- Users can update their own notifications (mark as read)
create policy "notif_user_update_own"
on notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Insert policy: allow backend functions / service role only
-- (clients shouldn't directly insert notifications)
revoke insert on notifications from anon;
revoke insert on notifications from authenticated;