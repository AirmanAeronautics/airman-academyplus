-- Fix remaining function security issues
CREATE OR REPLACE FUNCTION public.set_trial_expiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Set 2-week trial for pending users
  IF NEW.approval_status = 'pending' AND NEW.trial_expires_at IS NULL THEN
    NEW.trial_expires_at := now() + interval '14 days';
  END IF;
  
  -- Clear trial expiry for approved users
  IF NEW.approval_status = 'approved' THEN
    NEW.trial_expires_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;