-- Add category column to notifications table
alter table notifications
add column if not exists category text check (
  category in ('scheduler', 'maintenance', 'compliance', 'finance', 'support', 'marketing', 'system')
) default 'system';