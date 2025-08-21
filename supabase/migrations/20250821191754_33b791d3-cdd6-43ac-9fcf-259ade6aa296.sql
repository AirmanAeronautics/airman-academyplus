-- AIRMAN Academy+ Schema Upgrade: Phase 1 MVP (Joy & Stickiness)
-- Time-series telemetry, gamification, compliance, billing rules, CRM, AI event bus

-- ============================================================================
-- 1. TIME-SERIES TELEMETRY OPTIMIZATION
-- ============================================================================

-- Telemetry parameters lookup table
CREATE TABLE public.telemetry_parameters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parameter_name text NOT NULL UNIQUE,
  data_type text NOT NULL CHECK (data_type IN ('numeric', 'integer', 'boolean', 'text')),
  unit text,
  min_value numeric,
  max_value numeric,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert standard aviation parameters
INSERT INTO public.telemetry_parameters (parameter_name, data_type, unit, min_value, max_value, description) VALUES
('altitude_msl', 'integer', 'feet', -1000, 60000, 'Altitude Mean Sea Level'),
('altitude_agl', 'integer', 'feet', 0, 30000, 'Altitude Above Ground Level'),
('airspeed', 'integer', 'knots', 0, 500, 'Indicated Airspeed'),
('groundspeed', 'integer', 'knots', 0, 500, 'Ground Speed'),
('vertical_speed', 'integer', 'fpm', -6000, 6000, 'Vertical Speed'),
('heading', 'integer', 'degrees', 0, 359, 'Magnetic Heading'),
('track', 'integer', 'degrees', 0, 359, 'Ground Track'),
('engine_rpm', 'integer', 'rpm', 0, 5000, 'Engine RPM'),
('manifold_pressure', 'numeric', 'inHg', 10, 35, 'Manifold Pressure'),
('fuel_flow', 'numeric', 'gph', 0, 50, 'Fuel Flow Rate'),
('g_force_vertical', 'numeric', 'g', -10, 10, 'Vertical G Force'),
('g_force_lateral', 'numeric', 'g', -5, 5, 'Lateral G Force'),
('autopilot_engaged', 'boolean', null, null, null, 'Autopilot Status'),
('flight_phase', 'text', null, null, null, 'Current Flight Phase');

-- Normalized telemetry data points
CREATE TABLE public.telemetry_data_points (
  flight_session_id uuid NOT NULL,
  org_id uuid NOT NULL,
  parameter_id uuid NOT NULL REFERENCES public.telemetry_parameters(id),
  timestamp timestamptz NOT NULL,
  value_numeric numeric,
  value_integer integer,
  value_boolean boolean,
  value_text text,
  exceedance_flag boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Batch ingestion tracking
CREATE TABLE public.telemetry_batch_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flight_session_id uuid NOT NULL,
  org_id uuid NOT NULL,
  batch_size integer NOT NULL,
  ingestion_started_at timestamptz NOT NULL DEFAULT now(),
  ingestion_completed_at timestamptz,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_details text,
  source_system text NOT NULL DEFAULT 'xb70_maverick'
);

-- Time-series optimized indexes
CREATE INDEX idx_telemetry_session_time ON public.telemetry_data_points (flight_session_id, timestamp);
CREATE INDEX idx_telemetry_parameter_time ON public.telemetry_data_points (parameter_id, timestamp);
CREATE INDEX idx_telemetry_org_time ON public.telemetry_data_points (org_id, timestamp);
CREATE INDEX idx_telemetry_exceedance ON public.telemetry_data_points (exceedance_flag, timestamp) WHERE exceedance_flag = true;

-- ============================================================================
-- 2. ENHANCED GAMIFICATION SYSTEM
-- ============================================================================

-- Milestone templates for different course types
CREATE TABLE public.milestone_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_type text NOT NULL,
  milestone_id text NOT NULL,
  milestone_name text NOT NULL,
  description text,
  required_hours numeric NOT NULL DEFAULT 0,
  required_solo_hours numeric NOT NULL DEFAULT 0,
  required_cross_country_hours numeric NOT NULL DEFAULT 0,
  required_night_hours numeric NOT NULL DEFAULT 0,
  required_instrument_hours numeric NOT NULL DEFAULT 0,
  prerequisite_milestones text[],
  order_sequence integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Standard PPL milestones
INSERT INTO public.milestone_templates (course_type, milestone_id, milestone_name, description, required_hours, required_solo_hours, order_sequence) VALUES
('ppl', 'first_solo', 'First Solo Flight', 'Student completes first solo flight', 15, 1, 1),
('ppl', 'solo_cross_country', 'Solo Cross Country', 'Solo cross-country navigation', 25, 5, 2),
('ppl', 'night_flying', 'Night Flying Qualification', 'Night flying operations', 35, 0, 3),
('ppl', 'checkride_prep', 'Checkride Preparation', 'Ready for practical test', 40, 10, 4);

-- Achievement streaks for consistency tracking
CREATE TABLE public.achievement_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  org_id uuid NOT NULL,
  streak_type text NOT NULL CHECK (streak_type IN ('consistency', 'safety', 'performance', 'attendance')),
  current_count integer NOT NULL DEFAULT 0,
  best_count integer NOT NULL DEFAULT 0,
  last_activity_date date,
  streak_start_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, streak_type)
);

-- Badge unlock conditions
CREATE TABLE public.badge_unlock_conditions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_id text NOT NULL,
  badge_name text NOT NULL,
  description text,
  unlock_conditions jsonb NOT NULL,
  category text NOT NULL CHECK (category IN ('milestone', 'streak', 'performance', 'safety', 'hours')),
  points_awarded integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Standard badges
INSERT INTO public.badge_unlock_conditions (badge_id, badge_name, description, unlock_conditions, category, points_awarded) VALUES
('solo_pilot', 'Solo Pilot', 'Completed first solo flight', '{"milestone": "first_solo"}', 'milestone', 100),
('safety_streak_7', 'Safety Champion', '7 consecutive flights without incidents', '{"streak_type": "safety", "count": 7}', 'streak', 50),
('night_owl', 'Night Owl', 'Completed 10 night flights', '{"night_hours": 10}', 'hours', 75),
('cross_country_explorer', 'Explorer', 'Completed 5 cross-country flights', '{"cross_country_hours": 15}', 'hours', 60);

-- ============================================================================
-- 3. COMPLIANCE LAYER WITH RECURRENCE & BLOCKING
-- ============================================================================

-- Compliance types with recurrence rules
CREATE TABLE public.compliance_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type_name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('medical', 'license', 'rating', 'currency', 'training')),
  description text,
  recurrence_rules jsonb NOT NULL,
  warning_days_before integer NOT NULL DEFAULT 30,
  blocks_operations boolean NOT NULL DEFAULT true,
  applicable_roles text[] NOT NULL,
  aviation_region text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Standard compliance types
INSERT INTO public.compliance_types (type_name, category, description, recurrence_rules, warning_days_before, blocks_operations, applicable_roles) VALUES
('class1_medical', 'medical', 'Class 1 Medical Certificate', '{"months": 12}', 30, true, ARRAY['instructor', 'commercial_pilot']),
('class3_medical', 'medical', 'Class 3 Medical Certificate', '{"months": 24}', 60, true, ARRAY['student', 'private_pilot']),
('ifr_currency', 'currency', 'IFR Currency (6 approaches)', '{"months": 6}', 14, true, ARRAY['instructor', 'commercial_pilot']),
('bfr', 'training', 'Biennial Flight Review', '{"months": 24}', 60, true, ARRAY['private_pilot', 'commercial_pilot']),
('instructor_renewal', 'license', 'CFI Certificate Renewal', '{"months": 24}', 90, true, ARRAY['instructor']);

-- Individual compliance items
CREATE TABLE public.compliance_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  org_id uuid NOT NULL,
  compliance_type_id uuid NOT NULL REFERENCES public.compliance_types(id),
  issued_date date,
  expiry_date date NOT NULL,
  next_due_date date,
  status text NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'expiring', 'expired', 'suspended')),
  document_reference text,
  issuing_authority text,
  notes text,
  auto_renew_reminder boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Compliance blocks (prevents scheduling)
CREATE TABLE public.compliance_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  org_id uuid NOT NULL,
  compliance_item_id uuid NOT NULL REFERENCES public.compliance_items(id),
  block_type text NOT NULL CHECK (block_type IN ('expired', 'expiring', 'suspended')),
  blocked_operations text[] NOT NULL, -- ['instruction', 'solo', 'cross_country', 'ifr']
  block_start_date date NOT NULL,
  block_end_date date,
  is_active boolean NOT NULL DEFAULT true,
  override_reason text,
  overridden_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. CONFIGURABLE BILLING RULES ENGINE
-- ============================================================================

-- Billing rule sets per organization
CREATE TABLE public.billing_rule_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  rule_set_name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, rule_set_name)
);

-- Individual billing rules with conditions
CREATE TABLE public.billing_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_set_id uuid NOT NULL REFERENCES public.billing_rule_sets(id),
  rule_name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('hourly_rate', 'block_discount', 'surcharge', 'membership_discount')),
  conditions jsonb NOT NULL,
  actions jsonb NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Billing calculations tracking
CREATE TABLE public.billing_calculations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  flight_session_id uuid,
  student_id uuid NOT NULL,
  calculation_date timestamptz NOT NULL DEFAULT now(),
  base_amount numeric NOT NULL,
  applied_rules jsonb NOT NULL,
  discounts_applied numeric DEFAULT 0,
  surcharges_applied numeric DEFAULT 0,
  final_amount numeric NOT NULL,
  invoice_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. CRM PIPELINE ENHANCEMENT
-- ============================================================================

-- Enhanced leads with pipeline stages
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'inquiry';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_temperature text DEFAULT 'cold' CHECK (lead_temperature IN ('hot', 'warm', 'cold'));
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS conversion_probability integer CHECK (conversion_probability >= 0 AND conversion_probability <= 100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS expected_start_date date;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS marketing_source text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referral_source text;

-- Lead activities for touchpoint tracking
CREATE TABLE public.lead_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL,
  org_id uuid NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'demo_flight', 'follow_up', 'proposal')),
  activity_date timestamptz NOT NULL DEFAULT now(),
  duration_minutes integer,
  outcome text,
  notes text,
  next_action text,
  next_action_date date,
  performed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trial flights linking leads to sessions
CREATE TABLE public.trial_flights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL,
  flight_session_id uuid,
  org_id uuid NOT NULL,
  scheduled_date timestamptz,
  instructor_id uuid,
  aircraft_id uuid,
  flight_type text NOT NULL DEFAULT 'trial' CHECK (flight_type IN ('trial', 'demo', 'evaluation')),
  duration_planned numeric,
  duration_actual numeric,
  student_feedback text,
  instructor_notes text,
  conversion_outcome text CHECK (conversion_outcome IN ('enrolled', 'considering', 'declined', 'reschedule')),
  follow_up_scheduled date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- External CRM sync tracking
CREATE TABLE public.external_crm_sync (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  lead_id uuid,
  external_crm_type text NOT NULL CHECK (external_crm_type IN ('hubspot', 'pipedrive', 'salesforce')),
  external_id text NOT NULL,
  sync_direction text NOT NULL CHECK (sync_direction IN ('import', 'export', 'bidirectional')),
  last_sync_at timestamptz,
  sync_status text NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'failed')),
  error_details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, external_crm_type, external_id)
);

-- ============================================================================
-- 6. AI-ENHANCED EVENT BUS
-- ============================================================================

-- AI actions and recommendations
CREATE TABLE public.ai_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('schedule_optimization', 'maintenance_prediction', 'compliance_alert', 'billing_adjustment', 'student_intervention')),
  target_entity_type text NOT NULL,
  target_entity_id uuid NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ai_confidence numeric CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  recommendation_text text NOT NULL,
  recommended_action jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AI learning feedback loop
CREATE TABLE public.ai_learning_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_action_id uuid REFERENCES public.ai_actions(id),
  org_id uuid NOT NULL,
  feedback_type text NOT NULL CHECK (feedback_type IN ('outcome', 'accuracy', 'relevance', 'timing')),
  feedback_score integer CHECK (feedback_score >= 1 AND feedback_score <= 5),
  actual_outcome text,
  feedback_notes text,
  provided_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enhanced event log with AI context
ALTER TABLE public.event_log ADD COLUMN IF NOT EXISTS ai_action_id uuid REFERENCES public.ai_actions(id);
ALTER TABLE public.event_log ADD COLUMN IF NOT EXISTS confidence_score numeric;
ALTER TABLE public.event_log ADD COLUMN IF NOT EXISTS decision_context jsonb;

-- ============================================================================
-- 7. DOCUMENT STORAGE OPTIMIZATION
-- ============================================================================

-- Document metadata (files stored in S3/Blob)
CREATE TABLE public.document_metadata (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  document_name text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('medical', 'license', 'certificate', 'maintenance', 'training', 'invoice', 'contract')),
  file_size_bytes bigint,
  mime_type text,
  file_extension text,
  storage_url text NOT NULL,
  storage_bucket text NOT NULL,
  storage_path text NOT NULL,
  uploaded_by uuid,
  related_entity_type text,
  related_entity_id uuid,
  compliance_item_id uuid REFERENCES public.compliance_items(id),
  version_number integer NOT NULL DEFAULT 1,
  is_current_version boolean NOT NULL DEFAULT true,
  retention_policy_days integer,
  access_level text NOT NULL DEFAULT 'org' CHECK (access_level IN ('public', 'org', 'restricted', 'private')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. INTEGRATION HOOKS ARCHITECTURE
-- ============================================================================

-- Integration configurations per org
CREATE TABLE public.integration_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  integration_type text NOT NULL CHECK (integration_type IN ('weather', 'notam', 'caa_database', 'faa_database', 'mro_software', 'crm', 'accounting')),
  provider_name text NOT NULL,
  api_endpoint text,
  auth_config jsonb,
  sync_frequency text CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  last_sync_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, integration_type, provider_name)
);

-- Sync operation logs
CREATE TABLE public.sync_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_config_id uuid NOT NULL REFERENCES public.integration_configs(id),
  org_id uuid NOT NULL,
  sync_started_at timestamptz NOT NULL DEFAULT now(),
  sync_completed_at timestamptz,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  records_processed integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_summary text,
  detailed_log jsonb
);

-- Weather and NOTAM cache
CREATE TABLE public.weather_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  airport_code text NOT NULL,
  data_type text NOT NULL CHECK (data_type IN ('metar', 'taf', 'notam')),
  raw_data text NOT NULL,
  parsed_data jsonb,
  valid_from timestamptz,
  valid_to timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  is_current boolean NOT NULL DEFAULT true
);

-- AI maintenance predictions
CREATE TABLE public.maintenance_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aircraft_id uuid NOT NULL,
  org_id uuid NOT NULL,
  prediction_type text NOT NULL CHECK (prediction_type IN ('component_failure', 'scheduled_maintenance', 'performance_degradation')),
  component_name text,
  predicted_date date NOT NULL,
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  reasoning text,
  model_version text,
  training_data_cutoff timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Telemetry parameters (read-only for all authenticated users)
ALTER TABLE public.telemetry_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "telemetry_parameters_read" ON public.telemetry_parameters FOR SELECT USING (true);

-- Telemetry data points
ALTER TABLE public.telemetry_data_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "telemetry_data_org_access" ON public.telemetry_data_points FOR ALL USING (org_id = get_user_org_id());

-- Telemetry batch logs
ALTER TABLE public.telemetry_batch_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "telemetry_batch_org_access" ON public.telemetry_batch_logs FOR ALL USING (org_id = get_user_org_id());

-- Milestone templates (read-only for all)
ALTER TABLE public.milestone_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestone_templates_read" ON public.milestone_templates FOR SELECT USING (true);

-- Achievement streaks
ALTER TABLE public.achievement_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streaks_student_own" ON public.achievement_streaks FOR ALL USING (student_id = auth.uid());
CREATE POLICY "streaks_instructor_view" ON public.achievement_streaks FOR SELECT USING (
  student_id IN (
    SELECT student_id FROM student_assignments 
    WHERE instructor_id = auth.uid() AND active = true
  )
);
CREATE POLICY "streaks_admin_manage" ON public.achievement_streaks FOR ALL USING (is_org_admin(get_user_org_id()));

-- Badge unlock conditions (read-only for all)
ALTER TABLE public.badge_unlock_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badge_conditions_read" ON public.badge_unlock_conditions FOR SELECT USING (true);

-- Compliance types (read-only for all)
ALTER TABLE public.compliance_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compliance_types_read" ON public.compliance_types FOR SELECT USING (true);

-- Compliance items
ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compliance_items_user_own" ON public.compliance_items FOR ALL USING (user_id = auth.uid());
CREATE POLICY "compliance_items_admin_manage" ON public.compliance_items FOR ALL USING (is_org_admin(org_id));

-- Compliance blocks
ALTER TABLE public.compliance_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compliance_blocks_user_view" ON public.compliance_blocks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "compliance_blocks_admin_manage" ON public.compliance_blocks FOR ALL USING (is_org_admin(org_id));

-- Billing rule sets
ALTER TABLE public.billing_rule_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_rules_org_manage" ON public.billing_rule_sets FOR ALL USING (is_org_admin(org_id));

-- Billing rules
ALTER TABLE public.billing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_rules_org_access" ON public.billing_rules FOR SELECT USING (
  rule_set_id IN (SELECT id FROM billing_rule_sets WHERE org_id = get_user_org_id())
);
CREATE POLICY "billing_rules_admin_manage" ON public.billing_rules FOR ALL USING (
  rule_set_id IN (SELECT id FROM billing_rule_sets WHERE is_org_admin(org_id))
);

-- Billing calculations
ALTER TABLE public.billing_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_calc_student_own" ON public.billing_calculations FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "billing_calc_org_manage" ON public.billing_calculations FOR ALL USING (is_org_admin(org_id));

-- Lead activities
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_activities_org_access" ON public.lead_activities FOR ALL USING (org_id = get_user_org_id());

-- Trial flights
ALTER TABLE public.trial_flights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trial_flights_org_access" ON public.trial_flights FOR ALL USING (org_id = get_user_org_id());

-- External CRM sync
ALTER TABLE public.external_crm_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_sync_org_access" ON public.external_crm_sync FOR ALL USING (org_id = get_user_org_id());

-- AI actions
ALTER TABLE public.ai_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_actions_org_access" ON public.ai_actions FOR SELECT USING (org_id = get_user_org_id());
CREATE POLICY "ai_actions_admin_manage" ON public.ai_actions FOR ALL USING (is_org_admin(org_id));

-- AI learning feedback
ALTER TABLE public.ai_learning_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_feedback_org_access" ON public.ai_learning_feedback FOR ALL USING (org_id = get_user_org_id());

-- Document metadata
ALTER TABLE public.document_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_org_access" ON public.document_metadata FOR ALL USING (org_id = get_user_org_id());

-- Integration configs (admin only)
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integration_configs_admin" ON public.integration_configs FOR ALL USING (is_org_admin(org_id));

-- Sync logs (admin only)
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sync_logs_admin" ON public.sync_logs FOR ALL USING (is_org_admin(org_id));

-- Weather cache (read-only for all org members)
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weather_cache_read" ON public.weather_cache FOR SELECT USING (true);

-- Maintenance predictions
ALTER TABLE public.maintenance_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maintenance_pred_org_access" ON public.maintenance_predictions FOR ALL USING (org_id = get_user_org_id());

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update streaks automatically
CREATE OR REPLACE FUNCTION update_achievement_streaks()
RETURNS TRIGGER AS $$
BEGIN
  -- Update consistency streak based on flight frequency
  INSERT INTO achievement_streaks (student_id, org_id, streak_type, current_count, last_activity_date)
  VALUES (NEW.student_id, NEW.org_id, 'consistency', 1, NEW.flight_date::date)
  ON CONFLICT (student_id, streak_type)
  DO UPDATE SET
    current_count = CASE 
      WHEN achievement_streaks.last_activity_date = NEW.flight_date::date - INTERVAL '1 day' 
      THEN achievement_streaks.current_count + 1
      ELSE 1
    END,
    best_count = GREATEST(achievement_streaks.best_count, 
      CASE 
        WHEN achievement_streaks.last_activity_date = NEW.flight_date::date - INTERVAL '1 day' 
        THEN achievement_streaks.current_count + 1
        ELSE 1
      END),
    last_activity_date = NEW.flight_date::date,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flight_session_streak_update
  AFTER INSERT ON flight_sessions
  FOR EACH ROW EXECUTE FUNCTION update_achievement_streaks();

-- Auto-calculate compliance expiry
CREATE OR REPLACE FUNCTION calculate_compliance_expiry()
RETURNS TRIGGER AS $$
DECLARE
  recurrence_rules jsonb;
  months_to_add integer;
BEGIN
  -- Get recurrence rules from compliance type
  SELECT ct.recurrence_rules INTO recurrence_rules
  FROM compliance_types ct
  WHERE ct.id = NEW.compliance_type_id;
  
  -- Calculate next due date based on rules
  months_to_add := (recurrence_rules->>'months')::integer;
  
  IF months_to_add IS NOT NULL THEN
    NEW.next_due_date := NEW.expiry_date + (months_to_add || ' months')::interval;
  END IF;
  
  -- Set status based on expiry
  NEW.status := CASE
    WHEN NEW.expiry_date < CURRENT_DATE THEN 'expired'
    WHEN NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring'
    ELSE 'current'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compliance_item_expiry_calc
  BEFORE INSERT OR UPDATE ON compliance_items
  FOR EACH ROW EXECUTE FUNCTION calculate_compliance_expiry();

-- Add updated_at triggers for tables that need it
CREATE TRIGGER update_achievement_streaks_updated_at
  BEFORE UPDATE ON achievement_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_rule_sets_updated_at
  BEFORE UPDATE ON billing_rule_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_items_updated_at
  BEFORE UPDATE ON compliance_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trial_flights_updated_at
  BEFORE UPDATE ON trial_flights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON integration_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_metadata_updated_at
  BEFORE UPDATE ON document_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();