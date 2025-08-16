-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_domain text;
  matching_org_id uuid;
  invite_record record;
  org_settings_record record;
BEGIN
  -- Get user email from the new auth user
  user_email := NEW.email;
  user_domain := split_part(user_email, '@', 2);
  
  -- Check for explicit invite first
  SELECT * INTO invite_record 
  FROM public.org_invites 
  WHERE email = user_email AND NOT used AND expires_at > now();
  
  IF FOUND THEN
    -- User was explicitly invited
    INSERT INTO public.profiles (user_id, email, full_name, org_id, role, status)
    VALUES (NEW.id, user_email, NEW.raw_user_meta_data->>'full_name', invite_record.org_id, invite_record.role, 'active');
    
    -- Mark invite as used
    UPDATE public.org_invites SET used = true WHERE id = invite_record.id;
    
    -- Send welcome notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (NEW.id, 'Welcome!', 'You have been successfully added to the organization.', 'success');
    
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
      INSERT INTO public.profiles (user_id, email, full_name, org_id, role, status)
      VALUES (NEW.id, user_email, NEW.raw_user_meta_data->>'full_name', matching_org_id, 'user', 'active');
      
      -- Send welcome notification
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (NEW.id, 'Welcome!', 'You have been automatically approved for the organization.', 'success');
    ELSE
      -- Create pending request
      INSERT INTO public.profiles (user_id, email, full_name, status)
      VALUES (NEW.id, user_email, NEW.raw_user_meta_data->>'full_name', 'pending');
      
      INSERT INTO public.org_pending_requests (user_id, email, org_id)
      VALUES (NEW.id, user_email, matching_org_id);
      
      -- Send pending notification to user
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (NEW.id, 'Access Request Pending', 'Your request to join the organization is pending admin approval.', 'info');
      
      -- Notify all admins
      INSERT INTO public.notifications (user_id, title, message, type)
      SELECT p.user_id, 'New Access Request', 'A new user has requested access to the organization.', 'info'
      FROM public.profiles p
      WHERE p.org_id = matching_org_id AND p.role IN ('admin', 'super_admin');
    END IF;
  ELSE
    -- No matching organization, create basic profile
    INSERT INTO public.profiles (user_id, email, full_name, status)
    VALUES (NEW.id, user_email, NEW.raw_user_meta_data->>'full_name', 'pending');
    
    -- Send notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (NEW.id, 'Account Created', 'Your account has been created. Contact an administrator for organization access.', 'info');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix update timestamp function search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;