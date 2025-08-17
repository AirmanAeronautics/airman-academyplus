-- Update the handle_new_user_signup function to auto-approve all users
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
  default_org_id uuid;
  target_org_id uuid;
  target_role text;
BEGIN
  RAISE NOTICE 'DEBUG: Auto-approval trigger started for user %', NEW.id;
  
  -- Get user email from the new auth user
  user_email := NEW.email;
  user_domain := split_part(user_email, '@', 2);
  
  RAISE NOTICE 'DEBUG: Email=%, Domain=%', user_email, user_domain;
  
  -- Get the default org ID first
  SELECT id INTO default_org_id FROM organizations WHERE is_default = true LIMIT 1;
  
  RAISE NOTICE 'DEBUG: Default org ID=%', default_org_id;
  
  -- Log the signup attempt with default org
  INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
  VALUES ('user_signup', 'auth', 'User attempting auto-approval signup', 
          jsonb_build_object('email', user_email, 'domain', user_domain), NEW.id, default_org_id);
  
  -- Check for explicit invite first (still honor invites for role assignment)
  SELECT * INTO invite_record 
  FROM public.org_invites 
  WHERE email = user_email AND NOT used AND expires_at > now();
  
  IF FOUND THEN
    RAISE NOTICE 'DEBUG: User has invite, using invite settings';
    target_org_id := invite_record.org_id;
    target_role := invite_record.role;
    
    -- Mark invite as used
    UPDATE public.org_invites SET used = true WHERE id = invite_record.id;
  ELSE
    RAISE NOTICE 'DEBUG: No invite found, checking for domain match';
    
    -- Check for domain match for org assignment (but auto-approve regardless)
    SELECT o.id INTO matching_org_id
    FROM public.organizations o
    WHERE o.domain = user_domain;
    
    IF FOUND THEN
      RAISE NOTICE 'DEBUG: Domain match found, assigning to org %', matching_org_id;
      target_org_id := matching_org_id;
    ELSE
      RAISE NOTICE 'DEBUG: No domain match, assigning to default org';
      target_org_id := default_org_id;
    END IF;
    
    -- Always assign 'user' role for auto-approval
    target_role := 'user';
  END IF;
  
  -- AUTO-APPROVE: Create profile with org assignment immediately
  INSERT INTO public.profiles (id, email, name, org_id, role)
  VALUES (NEW.id, user_email, NEW.raw_user_meta_data->>'full_name', target_org_id, target_role);
  
  RAISE NOTICE 'DEBUG: Profile created with org_id=%, role=%', target_org_id, target_role;
  
  -- Send welcome notification
  INSERT INTO public.notifications (user_id, title, message, type, org_id)
  VALUES (NEW.id, 'Welcome to AIRMAN Academy+!', 'Your account has been automatically approved and you can now access the platform.', 'success', target_org_id);
  
  -- Log successful signup
  INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
  VALUES ('user_signup_success', 'auth', 'User automatically approved on signup', 
          jsonb_build_object('email', user_email, 'org_id', target_org_id, 'role', target_role), NEW.id, target_org_id);
  
  RAISE NOTICE 'DEBUG: Auto-approval signup completed successfully';
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'DEBUG: Auto-approval trigger failed with error: %', SQLERRM;
    -- Log the error with default org_id
    INSERT INTO public.event_log (type, category, message, metadata, user_id, org_id)
    VALUES ('user_signup_error', 'auth', 'Error during auto-approval signup', 
            jsonb_build_object('email', user_email, 'error', SQLERRM), NEW.id, 
            COALESCE(default_org_id, (SELECT id FROM organizations WHERE is_default = true LIMIT 1)));
    RAISE;
END;
$$;