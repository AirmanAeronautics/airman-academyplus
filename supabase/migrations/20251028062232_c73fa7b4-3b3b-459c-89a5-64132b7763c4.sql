-- Create org_integrations table
CREATE TABLE public.org_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  credentials JSONB,
  settings JSONB,
  webhook_url TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(org_id, integration_type)
);

CREATE INDEX idx_org_integrations_org_id ON public.org_integrations(org_id);
CREATE INDEX idx_org_integrations_status ON public.org_integrations(status);

-- Enable RLS
ALTER TABLE public.org_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view integrations in their org"
  ON public.org_integrations FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage integrations"
  ON public.org_integrations FOR ALL
  USING (is_org_admin(org_id));

-- Create integration_events table
CREATE TABLE public.integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.org_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_integration_events_org_id ON public.integration_events(org_id);
CREATE INDEX idx_integration_events_created_at ON public.integration_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view integration events in their org"
  ON public.integration_events FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage integration events"
  ON public.integration_events FOR ALL
  USING (is_org_admin(org_id));

-- Extend roster_assignment table
ALTER TABLE public.roster_assignment 
ADD COLUMN meeting_url TEXT,
ADD COLUMN meeting_platform TEXT,
ADD COLUMN meeting_id TEXT,
ADD COLUMN recording_url TEXT;

-- Create meeting_recordings table
CREATE TABLE public.meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.roster_assignment(id) ON DELETE SET NULL,
  meeting_platform TEXT NOT NULL,
  meeting_id TEXT NOT NULL,
  recording_url TEXT,
  cloud_storage_url TEXT,
  duration_minutes INT,
  file_size_mb DECIMAL,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  uploaded_at TIMESTAMPTZ
);

CREATE INDEX idx_meeting_recordings_org_id ON public.meeting_recordings(org_id);
CREATE INDEX idx_meeting_recordings_meeting_id ON public.meeting_recordings(meeting_id);

-- Enable RLS
ALTER TABLE public.meeting_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recordings in their org"
  ON public.meeting_recordings FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage recordings"
  ON public.meeting_recordings FOR ALL
  USING (is_org_admin(org_id));

-- Add updated_at trigger to org_integrations
CREATE TRIGGER update_org_integrations_updated_at
  BEFORE UPDATE ON public.org_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();