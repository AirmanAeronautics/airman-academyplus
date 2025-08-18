-- Add new columns to profiles table for enhanced user journey
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS aviation_region text,
ADD COLUMN IF NOT EXISTS flight_school_id uuid,
ADD COLUMN IF NOT EXISTS trial_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create flight schools table
CREATE TABLE IF NOT EXISTS public.flight_schools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  aviation_region text NOT NULL,
  country text NOT NULL,
  admin_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on flight_schools
ALTER TABLE public.flight_schools ENABLE ROW LEVEL SECURITY;

-- Create school join requests table
CREATE TABLE IF NOT EXISTS public.school_join_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  flight_school_id uuid NOT NULL,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  processed_by uuid,
  status text NOT NULL DEFAULT 'pending',
  message text,
  org_id uuid NOT NULL,
  FOREIGN KEY (flight_school_id) REFERENCES public.flight_schools(id) ON DELETE CASCADE
);

-- Enable RLS on school_join_requests
ALTER TABLE public.school_join_requests ENABLE ROW LEVEL SECURITY;

-- Create direct messages table for individual messaging
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  message text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone,
  org_id uuid NOT NULL,
  thread_id uuid
);

-- Enable RLS on direct_messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Create message threads table
CREATE TABLE IF NOT EXISTS public.message_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participants uuid[] NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  org_id uuid NOT NULL,
  thread_type text DEFAULT 'direct'
);

-- Enable RLS on message_threads
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Add foreign key for flight_school_id in profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_flight_school_fk 
FOREIGN KEY (flight_school_id) REFERENCES public.flight_schools(id);

-- Create updated_at trigger for flight_schools
CREATE TRIGGER update_flight_schools_updated_at
  BEFORE UPDATE ON public.flight_schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for message_threads
CREATE TRIGGER update_message_threads_updated_at
  BEFORE UPDATE ON public.message_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for flight_schools
CREATE POLICY "Users can view all flight schools" 
  ON public.flight_schools 
  FOR SELECT 
  USING (true);

CREATE POLICY "School admins can manage their schools" 
  ON public.flight_schools 
  FOR ALL 
  USING (admin_user_id = auth.uid() OR is_org_admin(get_user_org_id()));

-- RLS Policies for school_join_requests
CREATE POLICY "Users can view their own join requests" 
  ON public.school_join_requests 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create join requests" 
  ON public.school_join_requests 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "School admins can manage join requests" 
  ON public.school_join_requests 
  FOR ALL 
  USING (
    flight_school_id IN (
      SELECT id FROM public.flight_schools 
      WHERE admin_user_id = auth.uid()
    ) OR is_org_admin(get_user_org_id())
  );

-- RLS Policies for direct_messages
CREATE POLICY "Users can view their own messages" 
  ON public.direct_messages 
  FOR SELECT 
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" 
  ON public.direct_messages 
  FOR INSERT 
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update read status of their received messages" 
  ON public.direct_messages 
  FOR UPDATE 
  USING (recipient_id = auth.uid());

-- RLS Policies for message_threads
CREATE POLICY "Users can view threads they participate in" 
  ON public.message_threads 
  FOR SELECT 
  USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create threads" 
  ON public.message_threads 
  FOR INSERT 
  WITH CHECK (auth.uid() = ANY(participants));

-- Create function to set trial expiry
CREATE OR REPLACE FUNCTION public.set_trial_expiry()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for trial expiry
CREATE TRIGGER set_trial_expiry_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_trial_expiry();

-- Update existing role enum to include super_admin
-- (Note: This may need to be done carefully depending on existing data)