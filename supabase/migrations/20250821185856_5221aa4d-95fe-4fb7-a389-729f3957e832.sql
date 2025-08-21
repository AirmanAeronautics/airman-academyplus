-- AIRMAN Academy+ Schema Upgrade - Phase 2, 3, 4
-- Time-series telemetry, enhanced compliance, configurable billing

-- Enable TimescaleDB extension for time-series data
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- ====== ENHANCED AIRCRAFT & MAINTENANCE ======

-- Aircraft with enhanced tracking
CREATE TABLE IF NOT EXISTS public.aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  registration TEXT NOT NULL UNIQUE,
  aircraft_type TEXT NOT NULL, -- SEP, MEP, SIM, HELI
  make_model TEXT NOT NULL,
  year_manufactured INTEGER,
  total_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  hours_since_maintenance DECIMAL(8,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available', -- available, in_flight, maintenance, grounded, out_of_service
  location TEXT,
  fuel_capacity DECIMAL(6,2),
  current_fuel_level DECIMAL(6,2),
  insurance_expiry DATE,
  certificate_expiry DATE,
  last_inspection DATE,
  next_inspection DATE,
  maintenance_intervals JSONB, -- Different maintenance types and intervals
  avionics_config JSONB, -- Avionics equipment configuration
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maintenance events with enhanced tracking
CREATE TABLE IF NOT EXISTS public.maintenance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  aircraft_id UUID NOT NULL REFERENCES public.aircraft(id),
  event_type TEXT NOT NULL, -- scheduled, unscheduled, inspection, repair, modification
  maintenance_type TEXT NOT NULL, -- 50hr, 100hr, annual, progressive, ad, sb
  description TEXT NOT NULL,
  scheduled_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, deferred
  performed_by TEXT,
  cost DECIMAL(10,2),
  parts_used JSONB, -- Array of parts with costs
  hours_at_maintenance DECIMAL(8,2),
  next_due_hours DECIMAL(8,2),
  next_due_date DATE,
  certifying_signature TEXT,
  work_order_ref TEXT,
  regulatory_ref TEXT, -- AD number, SB number, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced defects tracking
CREATE TABLE IF NOT EXISTS public.aircraft_defects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  aircraft_id UUID NOT NULL REFERENCES public.aircraft(id),
  reported_by UUID REFERENCES public.profiles(id),
  description TEXT NOT NULL,
  severity TEXT NOT NULL, -- minor, major, grounding
  status TEXT NOT NULL DEFAULT 'open', -- open, deferred, rectified, cancelled
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date DATE,
  rectified_at TIMESTAMPTZ,
  rectified_by UUID REFERENCES public.profiles(id),
  maintenance_event_id UUID REFERENCES public.maintenance_events(id),
  mel_reference TEXT, -- Minimum Equipment List reference
  regulatory_action_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====== TIME-SERIES TELEMETRY SYSTEM ======

-- Flight sessions enhanced
CREATE TABLE IF NOT EXISTS public.flight_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  session_ref TEXT NOT NULL, -- External reference from XB70/Maverick
  student_id UUID REFERENCES public.profiles(id),
  instructor_id UUID REFERENCES public.profiles(id),
  aircraft_id UUID REFERENCES public.aircraft(id),
  flight_date DATE NOT NULL,
  scheduled_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  flight_time DECIMAL(4,2), -- Hobbs hours
  flight_type TEXT NOT NULL, -- training, solo, check_ride, cross_country, etc.
  lesson_plan TEXT,
  departure_airport TEXT,
  arrival_airport TEXT,
  route TEXT,
  flight_phases JSONB, -- Array of flight phases with timestamps
  weather_conditions JSONB, -- Weather at departure/arrival
  fuel_used DECIMAL(6,2),
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  telemetry_ingested BOOLEAN DEFAULT false,
  telemetry_ingested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Time-series telemetry data (Timescale hypertable)
CREATE TABLE IF NOT EXISTS public.flight_telemetry (
  time TIMESTAMPTZ NOT NULL,
  flight_session_id UUID NOT NULL REFERENCES public.flight_sessions(id),
  org_id UUID NOT NULL,
  -- Position data
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  altitude_msl INTEGER, -- Mean Sea Level altitude in feet
  altitude_agl INTEGER, -- Above Ground Level altitude in feet
  -- Flight dynamics
  airspeed INTEGER, -- Indicated airspeed in knots
  groundspeed INTEGER, -- Ground speed in knots
  vertical_speed INTEGER, -- Vertical speed in feet per minute
  heading INTEGER, -- Magnetic heading in degrees
  track INTEGER, -- Ground track in degrees
  -- Engine data
  engine_rpm INTEGER,
  manifold_pressure DECIMAL(4,2),
  fuel_flow DECIMAL(5,2),
  oil_pressure DECIMAL(4,1),
  oil_temperature DECIMAL(5,1),
  cylinder_head_temp DECIMAL(5,1),
  exhaust_gas_temp DECIMAL(6,1),
  -- Flight controls
  elevator_position DECIMAL(5,2),
  aileron_position DECIMAL(5,2),
  rudder_position DECIMAL(5,2),
  throttle_position DECIMAL(5,2),
  -- Navigation
  nav1_frequency DECIMAL(6,2),
  nav2_frequency DECIMAL(6,2),
  com1_frequency DECIMAL(6,3),
  com2_frequency DECIMAL(6,3),
  transponder_code INTEGER,
  autopilot_engaged BOOLEAN,
  -- Weather
  outside_air_temp DECIMAL(4,1),
  wind_speed INTEGER,
  wind_direction INTEGER,
  visibility DECIMAL(4,1),
  -- G-forces and exceedances
  g_force_vertical DECIMAL(4,2),
  g_force_lateral DECIMAL(4,2),
  g_force_longitudinal DECIMAL(4,2),
  -- Flags for analysis
  exceedance_flags JSONB, -- Array of exceedance types detected
  flight_phase TEXT -- takeoff, climb, cruise, descent, approach, landing, etc.
);

-- Create hypertable for time-series data
SELECT create_hypertable('public.flight_telemetry', 'time', if_not_exists => TRUE);

-- Telemetry batch ingestion log
CREATE TABLE IF NOT EXISTS public.telemetry_ingestion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_session_id UUID NOT NULL REFERENCES public.flight_sessions(id),
  org_id UUID NOT NULL,
  source_system TEXT NOT NULL, -- XB70, Maverick, Manual
  batch_size INTEGER NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processing_time_ms INTEGER,
  status TEXT NOT NULL, -- success, error, partial
  error_message TEXT,
  data_quality_score DECIMAL(3,2), -- 0.00 to 1.00
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====== ENHANCED COMPLIANCE SYSTEM ======

-- Compliance document types with recurrence rules
CREATE TABLE IF NOT EXISTS public.compliance_document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- medical, license, rating, currency, training, aircraft
  description TEXT,
  applicable_roles TEXT[], -- student, instructor, examiner, aircraft
  regulatory_authority TEXT, -- CAA, FAA, EASA, etc.
  recurrence_interval INTERVAL, -- 12 months, 6 months, etc.
  recurrence_type TEXT, -- fixed, rolling, calendar
  warning_days_before INTEGER DEFAULT 30,
  grace_period_days INTEGER DEFAULT 0,
  mandatory_for_operations BOOLEAN DEFAULT true,
  document_requirements JSONB, -- Required documents, forms, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced compliance documents
CREATE TABLE IF NOT EXISTS public.compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  document_type_id UUID NOT NULL REFERENCES public.compliance_document_types(id),
  person_id UUID NOT NULL REFERENCES public.profiles(id),
  aircraft_id UUID REFERENCES public.aircraft(id), -- For aircraft-specific documents
  document_number TEXT,
  issuing_authority TEXT,
  issued_date DATE,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  next_renewal_date DATE,
  status TEXT NOT NULL DEFAULT 'current', -- current, expiring, expired, suspended, revoked
  verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  document_file_path TEXT, -- S3/storage path
  notes TEXT,
  restrictions JSONB, -- Any restrictions or limitations
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Currency tracking for recurrent requirements
CREATE TABLE IF NOT EXISTS public.currency_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  person_id UUID NOT NULL REFERENCES public.profiles(id),
  currency_type TEXT NOT NULL, -- ifr_currency, night_currency, instructor_currency, etc.
  requirement_description TEXT NOT NULL,
  last_activity_date DATE,
  expiry_date DATE NOT NULL,
  activities_required INTEGER, -- Number of activities needed for currency
  activities_completed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'current', -- current, expiring, expired
  next_activity_due DATE,
  activities_log JSONB, -- Log of qualifying activities
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====== CONFIGURABLE BILLING SYSTEM ======

-- Billing rules engine
CREATE TABLE IF NOT EXISTS public.billing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL, -- aircraft_hourly, instructor_hourly, block_discount, surcharge, fee
  conditions JSONB NOT NULL, -- Conditions for rule application
  pricing_config JSONB NOT NULL, -- Pricing configuration
  effective_from DATE NOT NULL,
  effective_until DATE,
  priority INTEGER DEFAULT 0, -- For rule ordering
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  billing_period_start DATE,
  billing_period_end DATE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled, refunded
  payment_method TEXT,
  payment_reference TEXT,
  payment_date DATE,
  billing_address JSONB,
  notes TEXT,
  auto_generated BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Detailed billing line items
CREATE TABLE IF NOT EXISTS public.billing_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id),
  org_id UUID NOT NULL,
  item_type TEXT NOT NULL, -- flight_training, aircraft_rental, instructor_fee, fuel, exam_fee, etc.
  description TEXT NOT NULL,
  flight_session_id UUID REFERENCES public.flight_sessions(id),
  aircraft_id UUID REFERENCES public.aircraft(id),
  instructor_id UUID REFERENCES public.profiles(id),
  service_date DATE,
  quantity DECIMAL(8,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  line_total DECIMAL(10,2) NOT NULL,
  billing_rule_id UUID REFERENCES public.billing_rules(id), -- Which rule generated this
  metadata JSONB, -- Additional billing metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====== CRM & MARKETING INTEGRATION ======

-- Lead sources and campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL, -- email, social, ppc, referral, event
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, paused, completed, archived
  budget DECIMAL(10,2),
  spent DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  target_audience JSONB, -- Targeting criteria
  content_config JSONB, -- Campaign content and settings
  external_campaign_id TEXT, -- ID in external system (Facebook, Google, etc.)
  external_system TEXT, -- facebook, google_ads, hubspot, etc.
  sync_status TEXT DEFAULT 'manual', -- manual, synced, error
  last_sync_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced leads with conversion tracking
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  external_lead_id TEXT, -- ID from external CRM
  external_system TEXT, -- hubspot, pipedrive, etc.
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, qualified, trial_booked, trial_completed, enrolled, lost
  lead_source TEXT, -- website, referral, social, advertising, walk_in
  campaign_id UUID REFERENCES public.marketing_campaigns(id),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  interest_type TEXT, -- ppl, cpl, atpl, recreational, career_change
  budget_range TEXT, -- 0-10k, 10k-25k, 25k-50k, 50k+
  timeline TEXT, -- immediate, 3_months, 6_months, 12_months
  location TEXT,
  age_range TEXT,
  experience_level TEXT, -- none, some, experienced
  trial_flight_date DATE,
  trial_flight_completed BOOLEAN DEFAULT false,
  conversion_date DATE,
  assigned_to UUID REFERENCES public.profiles(id),
  ai_score DECIMAL(3,2), -- 0.00 to 1.00 conversion probability
  ai_insights JSONB, -- AI-generated insights about the lead
  last_contact_date DATE,
  next_follow_up_date DATE,
  notes TEXT,
  sync_status TEXT DEFAULT 'manual', -- manual, synced, error
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead activity tracking
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id),
  org_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- call, email, meeting, trial_flight, follow_up
  description TEXT,
  outcome TEXT, -- interested, not_interested, callback_requested, enrolled
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  performed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  external_activity_id TEXT, -- ID from external CRM
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====== ENHANCED NOTIFICATIONS & EVENT BUS ======

-- Enhanced notifications with categories and actions
CREATE TABLE IF NOT EXISTS public.notifications_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  notification_type TEXT NOT NULL, -- compliance_alert, maintenance_due, ai_recommendation, system_alert
  category TEXT NOT NULL, -- safety, compliance, finance, operations, marketing
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_required BOOLEAN DEFAULT false,
  action_type TEXT, -- approve_request, schedule_maintenance, renew_document, etc.
  action_data JSONB, -- Data needed for the action
  related_entity_type TEXT, -- aircraft, student, instructor, invoice, etc.
  related_entity_id UUID,
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2), -- Confidence score for AI recommendations
  read_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI action log for audit trail
CREATE TABLE IF NOT EXISTS public.ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- schedule_optimization, maintenance_prediction, compliance_alert
  action_description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  input_data JSONB NOT NULL, -- Data that triggered the action
  output_data JSONB, -- AI recommendation/decision
  human_review_required BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES public.profiles(id),
  review_status TEXT DEFAULT 'pending', -- pending, approved, rejected, modified
  review_notes TEXT,
  implemented BOOLEAN DEFAULT false,
  implemented_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====== WEATHER & EXTERNAL DATA ======

-- Weather conditions storage
CREATE TABLE IF NOT EXISTS public.weather_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_code TEXT NOT NULL,
  observation_time TIMESTAMPTZ NOT NULL,
  visibility DECIMAL(4,1), -- in statute miles
  wind_direction INTEGER, -- degrees
  wind_speed INTEGER, -- knots
  wind_gust INTEGER, -- knots
  temperature INTEGER, -- celsius
  dew_point INTEGER, -- celsius
  altimeter DECIMAL(5,2), -- inches Hg
  weather_phenomena TEXT[], -- rain, snow, fog, etc.
  cloud_layers JSONB, -- Array of cloud layer data
  flight_category TEXT, -- VFR, MVFR, IFR, LIFR
  raw_metar TEXT,
  source TEXT DEFAULT 'aviation_weather_api',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NOTAMs (Notice to Airmen)
CREATE TABLE IF NOT EXISTS public.notams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notam_id TEXT NOT NULL UNIQUE,
  airport_code TEXT,
  facility_type TEXT, -- airport, navaid, airspace
  notam_type TEXT, -- runway, taxiway, approach, navaid, etc.
  condition TEXT NOT NULL, -- closed, restricted, out_of_service, etc.
  effective_start TIMESTAMPTZ NOT NULL,
  effective_end TIMESTAMPTZ,
  description TEXT NOT NULL,
  raw_notam TEXT,
  source TEXT DEFAULT 'faa_notam_api',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====== ENABLE RLS ON ALL TABLES ======

ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aircraft_defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_ingestion_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notams ENABLE ROW LEVEL SECURITY;