// AIRMAN Academy+ Types
// Core domain types for staff console

export interface BaseEntity {
  id: string;
  org_id: string;
  campus_id: string;
  created_at: string;
  updated_at: string;
}

// User & Authentication
import type { UserRole } from './auth';

export interface User extends BaseEntity {
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  department: string;
  status: "active" | "inactive";
}

// Student & Instructor (read-only from Captain/Maverick)
export interface Student extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  status: "active" | "suspended" | "graduated" | "withdrawn";
  course: "PPL" | "CPL" | "ATPL" | "IR" | "NIGHT";
  instructor_id: string;
  total_hours: number;
  stage: string;
  next_lesson?: string;
  medical_expiry?: string;
  notes: string[];
}

export interface Instructor extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  qualifications: string[];
  current_students: string[];
  total_hours: number;
  availability_status: "available" | "busy" | "off_duty";
  medical_expiry: string;
  license_expiry: string;
}

// Aircraft & Maintenance
export interface Aircraft extends BaseEntity {
  registration: string;
  type: "SEP" | "MEP" | "SIM";
  model: string;
  total_hours: number;
  hours_to_maintenance: number;
  maintenance_type: string;
  status: "available" | "in_flight" | "maintenance" | "grounded";
  location: string;
  last_inspection: string;
  next_inspection: string;
  defects: number;
  fuel_level: number;
}

export interface Defect extends BaseEntity {
  aircraft_id: string;
  description: string;
  severity: "minor" | "major" | "grounding";
  status: "open" | "deferred" | "rectified";
  reported_by: string;
  reported_date: string;
  due_date?: string;
}

// Schedule & Operations
export interface ScheduleEvent extends BaseEntity {
  student_id: string;
  instructor_id: string;
  aircraft_id: string;
  start_time: string;
  end_time: string;
  lesson_type: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  conflicts?: string[];
  notes?: string;
}

// Finance
export interface Invoice extends BaseEntity {
  student_id: string;
  amount: number;
  date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  items: InvoiceItem[];
  payment_method?: string;
  reference?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// Compliance
export interface ComplianceDoc extends BaseEntity {
  person_id: string;
  person_type: "student" | "instructor" | "staff";
  type: "medical" | "license" | "rating" | "recency" | "training";
  description: string;
  expiry_date: string;
  status: "current" | "expiring" | "expired";
  days_until_expiry: number;
  requirements?: string[];
}

// Marketing & CRM
export interface Lead extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  source: "website" | "referral" | "social" | "event" | "cold_call";
  goal: "ppl" | "cpl" | "atpl" | "ir" | "night" | "other";
  budget: number;
  value: number;
  location: string;
  owner_id: string;
  ai_score: number;
  segment?: "hot" | "warm" | "cold";
  last_contact?: string;
  notes?: string[];
}

export interface Campaign extends BaseEntity {
  name: string;
  type: "email" | "whatsapp" | "social";
  status: "draft" | "active" | "paused" | "completed";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
  start_date: string;
  end_date?: string;
}

// Support & Communications
export interface SupportTicket extends BaseEntity {
  customer: string;
  email: string;
  subject: string;
  channel: "email" | "chat" | "whatsapp";
  status: "new" | "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  messages: SupportMessage[];
  linked_record?: {
    type: "student" | "lead" | "invoice";
    id: string;
    name: string;
  };
  ai_suggestion?: string;
  assigned_to?: string;
}

export interface SupportMessage {
  id: string;
  from: string;
  type: "customer" | "agent";
  content: string;
  timestamp: string;
  attachments?: string[];
}

// Event Bus
export interface EventLog extends BaseEntity {
  type: string;
  summary: string;
  details: any;
  user_id?: string;
  role?: UserRole;
}

// AI Agent Responses
export interface AIScheduleChange {
  id: string;
  type: "reschedule" | "reassign_aircraft" | "reassign_instructor" | "cancel";
  event_id: string;
  reason: string;
  priority: "low" | "medium" | "high";
  original: {
    time?: string;
    aircraft?: string;
    instructor?: string;
  };
  proposed: {
    time?: string;
    aircraft?: string;
    instructor?: string;
  };
}

export interface AIFlightDebrief {
  metrics: {
    approach_stability: number;
    landing_rate: number;
    navigation_accuracy: number;
    radio_work: number;
  };
  strengths: string[];
  improvements: string[];
  next_lesson_focus: string[];
  generated_text: string;
}

// Conflict Rules
export type ConflictRule = 
  | "aircraft_grounded"
  | "instructor_duty_limit"
  | "daylight_window"
  | "vfr_minima"
  | "maintenance_due";

export interface ConflictCheck {
  rule: ConflictRule;
  violated: boolean;
  message: string;
  severity: "warning" | "error";
}