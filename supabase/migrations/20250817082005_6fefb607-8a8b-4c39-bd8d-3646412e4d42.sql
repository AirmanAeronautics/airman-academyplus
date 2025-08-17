-- Fix the trigger function to handle NULL org_id in initial logging
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email text;
  user_domain text;
  matching_org_id uuid;
  invite_record record;
  org_settings_record record;
  default_org_id uuid;
BEGIN
  -- Get user email from the new auth user
  user_email := NEW.email;
  user_domain := split_part(user_email, '@', 2);
  
  -- Get the default org ID first (we'll need it for logging)
  SELECT id INTO default_org_id FROM organizations WHERE is_default = true LIMIT 1;
  
  -- Log the signup attempt with default org
  INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
  VALUES ('user_signup', 'auth', 'User attempting signup', 
          jsonb_build_object('email', user_email, 'domain', user_domain), NEW.id, default_org_id);
  
  -- Check for explicit invite first
  SELECT * INTO invite_record 
  FROM public.org_invites 
  WHERE email = user_email AND NOT used AND expires_at > now();
  
  IF FOUND THEN
    -- User was explicitly invited
    INSERT INTO public.profiles (id, email, name, org_id, role)
    VALUES (NEW.id, user_email, NEW.raw_user_meta_data->>'full_name', invite_record.org_id, invite_record.role);
    
    -- Mark invite as used
    UPDATE public.org_invites SET used = true WHERE id = invite_record.id;
    
    -- Send welcome notification
    INSERT INTO public.notifications (user_id, title, message, type, org_id)
    VALUES (NEW.id, 'Welcome!', 'You have been successfully added to the organization.', 'success', invite_record.org_id);
    
    -- Log successful signup
    INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
    VALUES ('user_signup_success', 'auth', 'User successfully signed up via invite', 
            jsonb_build_object('email', user_email, 'org_id', invite_record.org_id), NEW.id, invite_record.org_id);
    
    RETURN NEW;
  END IF;
  
  -- Check for domain match
  SELECT o.id, os.auto_approve_domain 
  INTO matching_org_id, org_settings_record.auto_approve_domain
  FROM public.organizations o
  LEFT JOIN public.org_settings os ON o.id = os.org_id
  WHERE o.domain = user_domain;
  
  IF FOUND THEN
    IF COALESCE(org_settings_record.auto_approve_domain, false) THEN
      -- Auto-approve domain users
      INSERT INTO public.profiles (id, email, name, org_id, role)
      VALUES (NEW.id, user_email, NEW.raw_user_meta_data->>'full_name', matching_org_id, 'user');
      
      -- Send welcome notification
      INSERT INTO public.notifications (user_id, title, message, type, org_id)
      VALUES (NEW.id, 'Welcome!', 'You have been automatically approved for the organization.', 'success', matching_org_id);
      
      -- Log successful signup
      INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
      VALUES ('user_signup_success', 'auth', 'User successfully signed up via domain auto-approval', 
              jsonb_build_object('email', user_email, 'org_id', matching_org_id), NEW.id, matching_org_id);
    ELSE
      -- Create pending request
      INSERT INTO public.profiles (id, email, name, role)
      VALUES (NEW.id, user_email, NEW.raw_user_meta_data->>'full_name', 'pending');
      
      INSERT INTO public.org_pending_requests (user_id, email, org_id)
      VALUES (NEW.id, user_email, matching_org_id);
      
      -- Send pending notification to user
      INSERT INTO public.notifications (user_id, title, message, type, org_id)
      VALUES (NEW.id, 'Access Request Pending', 'Your request to join the organization is pending admin approval.', 'info', matching_org_id);
      
      -- Notify all admins
      INSERT INTO public.notifications (user_id, title, message, type, org_id)
      SELECT p.id, 'New Access Request', 'A new user has requested access to the organization.', 'info', matching_org_id
      FROM public.profiles p
      WHERE p.org_id = matching_org_id AND p.role IN ('admin', 'super_admin');
      
      -- Log pending signup
      INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
      VALUES ('user_signup_pending', 'auth', 'User signup pending admin approval', 
              jsonb_build_object('email', user_email, 'org_id', matching_org_id), NEW.id, matching_org_id);
    END IF;
  ELSE
    -- No matching organization, assign to default org
    INSERT INTO public.profiles (id, email, name, org_id, role)
    VALUES (NEW.id, user_email, NEW.raw_user_meta_data->>'full_name', default_org_id, 'user');
    
    -- Send notification
    INSERT INTO public.notifications (user_id, title, message, type, org_id)
    VALUES (NEW.id, 'Account Created', 'Your account has been created and you have been added to the default organization.', 'success', default_org_id);
    
    -- Log successful signup
    INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
    VALUES ('user_signup_success', 'auth', 'User successfully signed up to default org', 
            jsonb_build_object('email', user_email, 'org_id', default_org_id), NEW.id, default_org_id);
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error with default org_id
    INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
    VALUES ('user_signup_error', 'auth', 'Error during user signup', 
            jsonb_build_object('email', user_email, 'error', SQLERRM), NEW.id, 
            COALESCE(default_org_id, (SELECT id FROM organizations WHERE is_default = true LIMIT 1)));
    RAISE;
END;
$$;