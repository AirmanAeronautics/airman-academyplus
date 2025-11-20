-- Comprehensive RLS and Authentication Hardening Migration
-- This migration creates secure, org-scoped access with idempotent onboarding

-- First, ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_pending_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Org members can view event logs" ON public.event_log;
DROP POLICY IF EXISTS "notif_user_reads_self" ON public.notifications;
DROP POLICY IF EXISTS "notif_user_update_own" ON public.notifications;
DROP POLICY IF EXISTS "Org members can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "invites_invited_email_read" ON public.org_invites;
DROP POLICY IF EXISTS "pending_user_insert_own" ON public.org_pending_requests;
DROP POLICY IF EXISTS "pending_user_read_own" ON public.org_pending_requests;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND (org_uuid IS NULL OR org_id = org_uuid)
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- PROFILES TABLE POLICIES
-- Users can view and update their own profile
CREATE POLICY "profiles_user_own_access" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Org members can view basic identity fields of same org members
CREATE POLICY "profiles_org_member_view" ON public.profiles
  FOR SELECT USING (
    org_id IS NOT NULL AND 
    org_id = public.get_user_org_id() AND 
    auth.uid() != id
  );

-- Only org admins can update role/org_id of other users
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (
    auth.uid() != id AND 
    public.is_org_admin(org_id)
  );

-- ORGANIZATIONS TABLE POLICIES
-- Org members can view their organization
CREATE POLICY "organizations_member_view" ON public.organizations
  FOR SELECT USING (
    id = public.get_user_org_id()
  );

-- Only org admins can update organization settings
CREATE POLICY "organizations_admin_update" ON public.organizations
  FOR UPDATE USING (
    public.is_org_admin(id)
  );

-- ORG_SETTINGS TABLE POLICIES
-- Org members can view org settings
CREATE POLICY "org_settings_member_view" ON public.org_settings
  FOR SELECT USING (
    org_id = public.get_user_org_id()
  );

-- Only org admins can update org settings
CREATE POLICY "org_settings_admin_update" ON public.org_settings
  FOR UPDATE USING (
    public.is_org_admin(org_id)
  );

-- ORG_INVITES TABLE POLICIES
-- Users can view invites sent to their email
CREATE POLICY "org_invites_email_view" ON public.org_invites
  FOR SELECT USING (
    lower(email) = lower(auth.email())
  );

-- Org admins can manage invites for their org
CREATE POLICY "org_invites_admin_manage" ON public.org_invites
  FOR ALL USING (
    public.is_org_admin(org_id)
  );

-- ORG_PENDING_REQUESTS TABLE POLICIES
-- Users can view and create their own pending requests
CREATE POLICY "org_pending_requests_user_own" ON public.org_pending_requests
  FOR ALL USING (user_id = auth.uid());

-- Org admins can view and manage pending requests for their org
CREATE POLICY "org_pending_requests_admin_manage" ON public.org_pending_requests
  FOR ALL USING (
    org_id IS NOT NULL AND public.is_org_admin(org_id)
  );

-- NOTIFICATIONS TABLE POLICIES
-- Users can view and update their own notifications
CREATE POLICY "notifications_user_own" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- Org members can view org-scoped notifications
CREATE POLICY "notifications_org_view" ON public.notifications
  FOR SELECT USING (
    org_id IS NOT NULL AND 
    org_id = public.get_user_org_id()
  );

-- EVENT_LOG TABLE POLICIES
-- Org members can view event logs for their org
CREATE POLICY "event_log_org_view" ON public.event_log
  FOR SELECT USING (
    org_id = public.get_user_org_id()
  );

-- Enhanced user signup function with idempotent logic
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
  user_domain text;
  matching_org_id uuid;
  invite_record record;
  default_org_id uuid;
  target_org_id uuid;
  target_role text;
  auto_approve boolean := false;
  admin_count integer;
  new_org_id uuid;
BEGIN
  -- Get user email from the new auth user
  user_email := NEW.email;
  user_domain := split_part(user_email, '@', 2);
  
  -- Check if this is the first user in the system
  SELECT COUNT(*) INTO admin_count 
  FROM public.profiles 
  WHERE role IN ('admin', 'super_admin');
  
  -- If no admins exist, create default org and make user admin
  IF admin_count = 0 THEN
    -- Create default organization
    INSERT INTO public.organizations (name, domain, is_default)
    VALUES ('AIRMAN Academy (Demo)', user_domain, true)
    RETURNING id INTO new_org_id;
    
    -- Create org settings with auto-approve enabled for demo
    INSERT INTO public.org_settings (org_id, auto_approve_domain)
    VALUES (new_org_id, true);
    
    target_org_id := new_org_id;
    target_role := 'admin';
    
    -- Log first user setup
    INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
    VALUES ('first_user_setup', 'auth', 'First user created with default organization', 
            jsonb_build_object('email', user_email, 'org_created', true), NEW.id, target_org_id);
  ELSE
    -- Get the default org ID
    SELECT id INTO default_org_id FROM public.organizations WHERE is_default = true LIMIT 1;
    
    -- Check for explicit invite first
    SELECT * INTO invite_record 
    FROM public.org_invites 
    WHERE email = user_email AND NOT used AND expires_at > now();
    
    IF FOUND THEN
      target_org_id := invite_record.org_id;
      target_role := invite_record.role;
      
      -- Mark invite as used
      UPDATE public.org_invites SET used = true WHERE id = invite_record.id;
      
      -- Log invite acceptance
      INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
      VALUES ('invite_accepted', 'auth', 'User joined via invite', 
              jsonb_build_object('email', user_email, 'invite_id', invite_record.id), NEW.id, target_org_id);
    ELSE
      -- Check for domain-based auto-approval
      SELECT o.id, COALESCE(os.auto_approve_domain, false) 
      INTO matching_org_id, auto_approve
      FROM public.organizations o
      LEFT JOIN public.org_settings os ON o.id = os.org_id
      WHERE o.domain = user_domain;
      
      IF FOUND AND auto_approve THEN
        target_org_id := matching_org_id;
        target_role := 'user';
        
        -- Log auto-approval
        INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
        VALUES ('domain_auto_approved', 'auth', 'User auto-approved by domain', 
                jsonb_build_object('email', user_email, 'domain', user_domain), NEW.id, target_org_id);
      ELSE
        -- Create pending request
        target_org_id := COALESCE(matching_org_id, default_org_id);
        target_role := 'pending';
        
        -- Insert pending request
        INSERT INTO public.org_pending_requests (user_id, email, org_id, status)
        VALUES (NEW.id, user_email, target_org_id, 'pending')
        ON CONFLICT (user_id, org_id) DO NOTHING;
        
        -- Log pending request
        INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
        VALUES ('pending_approval', 'auth', 'User requires manual approval', 
                jsonb_build_object('email', user_email, 'domain', user_domain), NEW.id, target_org_id);
      END IF;
    END IF;
  END IF;
  
  -- Create or update profile (idempotent)
  INSERT INTO public.profiles (id, email, name, org_id, role)
  VALUES (NEW.id, user_email, NEW.raw_user_meta_data->>'full_name', target_org_id, target_role)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    org_id = COALESCE(EXCLUDED.org_id, profiles.org_id),
    role = CASE 
      WHEN profiles.role = 'pending' THEN EXCLUDED.role 
      ELSE profiles.role 
    END;
  
  -- Send welcome notification
  INSERT INTO public.notifications (user_id, title, message, type, org_id)
  VALUES (NEW.id, 'Welcome to AIRMAN Academy+!', 
          CASE 
            WHEN target_role = 'pending' THEN 'Your account is pending approval. You''ll be notified once approved.'
            ELSE 'Your account has been activated and you can now access the platform.'
          END, 
          CASE WHEN target_role = 'pending' THEN 'info' ELSE 'success' END, 
          target_org_id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block signup
    INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
    VALUES ('signup_error', 'auth', 'Error during user signup', 
            jsonb_build_object('email', user_email, 'error', SQLERRM), NEW.id, 
            COALESCE(target_org_id, (SELECT id FROM public.organizations WHERE is_default = true LIMIT 1)));
    
    -- Create minimal profile to prevent auth blocking
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, user_email, 'pending')
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Function to ensure org settings exist
CREATE OR REPLACE FUNCTION public.ensure_org_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.org_settings (org_id, auto_approve_domain)
  VALUES (NEW.id, false)
  ON CONFLICT (org_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Trigger to auto-create org settings
DROP TRIGGER IF EXISTS ensure_org_settings_trigger ON public.organizations;
CREATE TRIGGER ensure_org_settings_trigger
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.ensure_org_settings();