-- Create roster_alternative_solutions table for replanning system
CREATE TABLE IF NOT EXISTS public.roster_alternative_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_assignment_id UUID REFERENCES roster_assignment(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('weather', 'notam', 'availability', 'aircraft')),
  trigger_details JSONB NOT NULL DEFAULT '{}',
  alternative_assignment JSONB NOT NULL DEFAULT '{}',
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roster_alternative_solutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view alternatives in their org"
ON public.roster_alternative_solutions
FOR SELECT
TO authenticated
USING (org_id = get_user_org_id());

CREATE POLICY "Users can update alternatives in their org"
ON public.roster_alternative_solutions
FOR UPDATE
TO authenticated
USING (org_id = get_user_org_id());

CREATE POLICY "System can insert alternatives"
ON public.roster_alternative_solutions
FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id());

-- Add indexes for performance
CREATE INDEX idx_roster_alternatives_original ON public.roster_alternative_solutions(original_assignment_id);
CREATE INDEX idx_roster_alternatives_org ON public.roster_alternative_solutions(org_id);
CREATE INDEX idx_roster_alternatives_status ON public.roster_alternative_solutions(status);
CREATE INDEX idx_roster_alternatives_generated ON public.roster_alternative_solutions(generated_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_roster_alternatives_updated_at
BEFORE UPDATE ON public.roster_alternative_solutions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();