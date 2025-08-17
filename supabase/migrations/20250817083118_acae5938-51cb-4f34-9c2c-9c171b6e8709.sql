-- Drop the existing FK constraint that's causing the issue
ALTER TABLE event_log DROP CONSTRAINT IF EXISTS event_log_user_id_fkey;

-- Replace it with a looser FK that references auth.users instead
ALTER TABLE event_log ADD CONSTRAINT event_log_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;