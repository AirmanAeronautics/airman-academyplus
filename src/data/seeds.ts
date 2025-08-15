// AIRMAN Academy+ Seed Data
// Comprehensive typed datasets for demo/development

import type {
  Student,
  Instructor,
  Aircraft,
  Defect,
  ScheduleEvent,
  Invoice,
  InvoiceItem,
  ComplianceDoc,
  Lead,
  Campaign,
  SupportTicket,
  SupportMessage,
  EventLog
} from "@/types";

const baseTimestamp = new Date().toISOString();
const orgId = "org_airman_academy";
const campusId = "campus_main";

// Students (read-only from Captain/Maverick)
export const students: Student[] = [
  {
    id: "student_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    name: "Sarah Mitchell",
    email: "sarah.mitchell@student.com",
    phone: "+44 7700 900001",
    status: "active",
    course: "PPL",
    instructor_id: "instructor_1",
    total_hours: 35.5,
    stage: "Cross Country",
    next_lesson: "Solo Navigation",
    medical_expiry: "2024-12-15",
    notes: ["Shows excellent airmanship", "Ready for solo cross country"]
  },
  {
    id: "student_2",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    name: "David Wilson",
    email: "david.wilson@student.com",
    phone: "+44 7700 900002",
    status: "active",
    course: "CPL",
    instructor_id: "instructor_2",
    total_hours: 185.2,
    stage: "Commercial Skills",
    next_lesson: "Multi-Engine Conversion",
    medical_expiry: "2025-03-20",
    notes: ["Exceptional navigation skills", "Recommended for IR training"]
  },
  {
    id: "student_3",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    name: "Emma Thompson",
    email: "emma.thompson@student.com",
    phone: "+44 7700 900003",
    status: "active",
    course: "ATPL",
    instructor_id: "instructor_1",
    total_hours: 95.8,
    stage: "Instrument Rating",
    next_lesson: "ILS Approach Practice",
    medical_expiry: "2024-11-30",
    notes: ["Strong technical understanding", "Progressing ahead of schedule"]
  }
];

// Instructors (read-only from Captain/Maverick)
export const instructors: Instructor[] = [
  {
    id: "instructor_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    name: "Capt. James Wilson",
    email: "james.wilson@airman.academy",
    phone: "+44 7700 800001",
    qualifications: ["CPL(A)", "IR", "FI", "CRI"],
    current_students: ["student_1", "student_3"],
    total_hours: 3500,
    availability_status: "available",
    medical_expiry: "2024-08-25",
    license_expiry: "2025-06-15"
  },
  {
    id: "instructor_2",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    name: "Capt. Sarah Johnson",
    email: "sarah.johnson@airman.academy",
    phone: "+44 7700 800002",
    qualifications: ["ATPL(A)", "IR", "FI", "CRI", "MEP"],
    current_students: ["student_2"],
    total_hours: 8200,
    availability_status: "available",
    medical_expiry: "2024-10-12",
    license_expiry: "2025-04-20"
  }
];

// Aircraft Fleet
export const aircraft: Aircraft[] = [
  {
    id: "aircraft_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    registration: "G-AIRM",
    type: "SEP",
    model: "Cessna 172",
    total_hours: 4250,
    hours_to_maintenance: 35,
    maintenance_type: "100hr Check",
    status: "available",
    location: "Hangar A",
    last_inspection: "2024-07-15",
    next_inspection: "2024-08-15",
    defects: 0,
    fuel_level: 95
  },
  {
    id: "aircraft_2",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    registration: "G-ACAD",
    type: "SEP",
    model: "Cessna 152",
    total_hours: 6820,
    hours_to_maintenance: 12,
    maintenance_type: "50hr Check",
    status: "in_flight",
    location: "Training Area",
    last_inspection: "2024-07-20",
    next_inspection: "2024-08-20",
    defects: 1,
    fuel_level: 60
  },
  {
    id: "aircraft_3",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    registration: "G-TWIN",
    type: "MEP",
    model: "Piper Seneca",
    total_hours: 8950,
    hours_to_maintenance: 85,
    maintenance_type: "Annual",
    status: "available",
    location: "Apron B",
    last_inspection: "2024-06-30",
    next_inspection: "2024-09-30",
    defects: 0,
    fuel_level: 80
  }
];

// Defects
export const defects: Defect[] = [
  {
    id: "defect_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    aircraft_id: "aircraft_2",
    description: "NAV1 radio intermittent reception",
    severity: "minor",
    status: "open",
    reported_by: "instructor_1",
    reported_date: "2024-08-10",
    due_date: "2024-08-25"
  }
];

// Today's Schedule
export const scheduleEvents: ScheduleEvent[] = [
  {
    id: "event_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    student_id: "student_1",
    instructor_id: "instructor_1",
    aircraft_id: "aircraft_1",
    start_time: "2024-08-15T09:00:00Z",
    end_time: "2024-08-15T11:00:00Z",
    lesson_type: "General Handling",
    status: "scheduled",
    notes: "Focus on steep turns and stalls"
  },
  {
    id: "event_2",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    student_id: "student_2",
    instructor_id: "instructor_2",
    aircraft_id: "aircraft_3",
    start_time: "2024-08-15T13:30:00Z",
    end_time: "2024-08-15T15:30:00Z",
    lesson_type: "Multi-Engine Training",
    status: "scheduled",
    conflicts: ["weather_risk"]
  }
];

// Invoices
const invoiceItems: InvoiceItem[] = [
  { description: "Dual Flying Instruction", quantity: 2, rate: 45, amount: 90 },
  { description: "Aircraft Hire (C172)", quantity: 2, rate: 165, amount: 330 },
  { description: "Landing Fees", quantity: 2, rate: 8, amount: 16 }
];

export const invoices: Invoice[] = [
  {
    id: "invoice_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    student_id: "student_1",
    amount: 436,
    date: "2024-08-10",
    due_date: "2024-08-25",
    status: "sent",
    items: invoiceItems,
    reference: "INV-2024-001"
  }
];

// Compliance Documents
export const expiringDocs: ComplianceDoc[] = [
  {
    id: "doc_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    person_id: "instructor_1",
    person_type: "instructor",
    type: "medical",
    description: "Class 1 Medical Certificate",
    expiry_date: "2024-08-25",
    status: "expiring",
    days_until_expiry: 10,
    requirements: ["AME Examination", "ECG", "Vision Test"]
  }
];

// Marketing Leads
export const leads: Lead[] = [
  {
    id: "lead_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    name: "Michael Roberts",
    email: "michael.roberts@email.com",
    phone: "+44 7700 700001",
    status: "qualified",
    source: "website",
    goal: "ppl",
    budget: 12000,
    value: 12000,
    location: "London",
    owner_id: "user_marketing",
    ai_score: 92,
    segment: "hot",
    last_contact: "2024-08-14",
    notes: ["High motivation", "Flexible schedule"]
  }
];

// Marketing Campaigns
export const campaigns: Campaign[] = [
  {
    id: "campaign_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    name: "Weekend Warrior PPL",
    type: "email",
    status: "active",
    budget: 5000,
    spent: 2340,
    impressions: 45600,
    clicks: 567,
    conversions: 23,
    leads: 18,
    start_date: "2024-08-01",
    end_date: "2024-08-31"
  }
];

// Support Messages
const supportMessages: SupportMessage[] = [
  {
    id: "msg_1",
    from: "Michael Roberts",
    type: "customer",
    content: "Hi, I'm interested in starting PPL training. Do you have weekend availability?",
    timestamp: "2024-08-14T10:30:00Z"
  },
  {
    id: "msg_2",
    from: "Support Team",
    type: "agent",
    content: "Thank you for your interest! Yes, we offer flexible weekend training. I'll send you our Weekend Warrior PPL package details.",
    timestamp: "2024-08-14T11:15:00Z"
  }
];

// Support Tickets
export const supportThreads: SupportTicket[] = [
  {
    id: "ticket_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    customer: "Michael Roberts",
    email: "michael.roberts@email.com",
    subject: "Weekend PPL Training Inquiry",
    channel: "email",
    status: "open",
    priority: "medium",
    messages: supportMessages,
    linked_record: {
      type: "lead",
      id: "lead_1",
      name: "Michael Roberts"
    },
    ai_suggestion: "Based on this inquiry, I recommend highlighting our Weekend Warrior PPL package (£11,500) and scheduling a discovery call. The customer shows high intent with flexible availability."
  }
];

// Event Log (will be populated by AI actions)
export const eventLogs: EventLog[] = [
  {
    id: "log_1",
    org_id: orgId,
    campus_id: campusId,
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    type: "system.startup",
    summary: "Academy+ Console Initialized",
    details: { version: "1.0.0", mode: "demo" },
    user_id: "system",
    role: "admin"
  }
];