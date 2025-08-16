-- Migration: Complete authentication security hardening

-- First, create event_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.event_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  user_id uuid,
  category text NOT NULL,
  action text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add org_id column to notifications if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'notifications' AND column_name = 'org_id') THEN
    ALTER TABLE public.notifications ADD COLUMN org_id uuid;
  END IF;
END $$;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage invites" ON public.org_invites;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can manage org settings" ON public.org_settings;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all requests for their org" ON public.org_pending_requests;
DROP POLICY IF EXISTS "Admins can update requests for their org" ON public.org_pending_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.org_pending_requests;
DROP POLICY IF EXISTS "Users can insert their own requests" ON public.org_pending_requests;

-- ORGANIZATIONS: Only admin/super_admin can SELECT/UPDATE their org
CREATE POLICY "org_admin_read" 
ON public.organizations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
      AND p.org_id = organizations.id
      AND p.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "org_admin_update" 
ON public.organizations FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
      AND p.org_id = organizations.id
      AND p.role IN ('admin', 'super_admin')
  )
);

-- ORG_SETTINGS: Same as organizations
CREATE POLICY "org_settings_admin_read" 
ON public.org_settings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
      AND p.org_id = org_settings.org_id
      AND p.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "org_settings_admin_update" 
ON public.org_settings FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
      AND p.org_id = org_settings.org_id
      AND p.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "org_settings_admin_insert" 
ON public.org_settings FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
      AND p.org_id = org_settings.org_id
      AND p.role IN ('admin', 'super_admin')
  )
);

-- PROFILES: User can SELECT/UPDATE own; admin can SELECT all in org
CREATE POLICY "profiles_self_read" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "profiles_self_update" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_self_insert" 
ON public.profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_admin_read_org" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2
    WHERE p2.user_id = auth.uid()
      AND p2.org_id = profiles.org_id
      AND p2.role IN ('admin', 'super_admin')
  )
);

-- ORG_INVITES: Admin can INSERT/SELECT/DELETE; invited email can SELECT
CREATE POLICY "invites_admin_manage" 
ON public.org_invites FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.org_id = org_invites.org_id
      AND p.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "invites_invited_email_read" 
ON public.org_invites FOR SELECT 
USING (lower(email) = lower(auth.email()));

-- ORG_PENDING_REQUESTS: Admin can SELECT/UPDATE/DELETE; user can SELECT own
CREATE POLICY "pending_admin_manage" 
ON public.org_pending_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.org_id = org_pending_requests.org_id
      AND p.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "pending_admin_update" 
ON public.org_pending_requests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.org_id = org_pending_requests.org_id
      AND p.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "pending_admin_delete" 
ON public.org_pending_requests FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.org_id = org_pending_requests.org_id
      AND p.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "pending_user_read_own" 
ON public.org_pending_requests FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "pending_user_insert_own" 
ON public.org_pending_requests FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- NOTIFICATIONS: User can SELECT own; admin can SELECT org notifications
CREATE POLICY "notif_user_read_own" 
ON public.notifications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "notif_user_update_own" 
ON public.notifications FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "notif_admin_read_org" 
ON public.notifications FOR SELECT 
USING (
  org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.org_id = notifications.org_id
      AND p.role IN ('admin', 'super_admin')
  )
);

-- EVENT_LOG: Only admin can SELECT; prevent client inserts
ALTER TABLE public.event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eventlog_admin_read_org" 
ON public.event_log FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.org_id = event_log.org_id
      AND p.role IN ('admin', 'super_admin')
  )
);

-- Prevent client-side inserts to event_log and notifications
REVOKE INSERT ON public.event_log FROM anon, authenticated;
REVOKE INSERT ON public.notifications FROM anon;