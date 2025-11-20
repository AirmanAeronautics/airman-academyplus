-- Fix the remaining function security issue
CREATE OR REPLACE FUNCTION public.ensure_org_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.org_settings (org_id, auto_approve_domain)
  VALUES (NEW.id, false)
  ON CONFLICT (org_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;