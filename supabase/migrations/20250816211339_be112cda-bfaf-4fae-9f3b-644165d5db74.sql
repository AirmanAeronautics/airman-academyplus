-- Create organizations table
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  domain text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text NOT NULL,
  full_name text,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  role text DEFAULT 'user',
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'denied')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create org_invites table for explicit email invitations
CREATE TABLE public.org_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  used boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(org_id, email)
);

-- Create org_settings table
CREATE TABLE public.org_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  auto_approve_domain boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create org_pending_requests table
CREATE TABLE public.org_pending_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  processed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at timestamp with time zone,
  UNIQUE(user_id, org_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_pending_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
CREATE POLICY "Users can view their organization" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() AND profiles.org_id = organizations.id
    )
  );

-- Create RLS policies for profiles
CREATE POLICY "Users can view profiles in their organization" ON public.profiles
  FOR SELECT USING (
    profiles.user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles my_profile 
      WHERE my_profile.user_id = auth.uid() AND my_profile.org_id = profiles.org_id
    )
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (profiles.user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (profiles.user_id = auth.uid());

-- Create RLS policies for org_invites
CREATE POLICY "Admins can manage invites" ON public.org_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.org_id = org_invites.org_id 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Create RLS policies for org_settings
CREATE POLICY "Admins can manage org settings" ON public.org_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.org_id = org_settings.org_id 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Create RLS policies for org_pending_requests
CREATE POLICY "Users can view their own requests" ON public.org_pending_requests
  FOR SELECT USING (org_pending_requests.user_id = auth.uid());

CREATE POLICY "Admins can view all requests for their org" ON public.org_pending_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.org_id = org_pending_requests.org_id 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert their own requests" ON public.org_pending_requests
  FOR INSERT WITH CHECK (org_pending_requests.user_id = auth.uid());

CREATE POLICY "Admins can update requests for their org" ON public.org_pending_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.org_id = org_pending_requests.org_id 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (notifications.user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (notifications.user_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_settings_updated_at
    BEFORE UPDATE ON public.org_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();