// AIRMAN Academy+ Event Bus
// Event system for AI actions with Supabase integration

import type { EventLog, AcademyRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export type NotificationCategory = "scheduler" | "maintenance" | "compliance" | "finance" | "support" | "marketing" | "system";

export type Event = {
  id?: string;
  type: string;
  message: string;
  metadata?: Record<string, any>;
  user_id?: string;
  org_id: string;
  category: NotificationCategory;
  created_at?: string;
};

interface EventBusPayload {
  [key: string]: any;
}

type EventListener = (event: EventLog) => void;

class EventBus {
  private listeners: EventListener[] = [];
  private events: EventLog[] = [];

  subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  push(type: string, payload: EventBusPayload, userId?: string, role?: AcademyRole): void {
    const event: EventLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      org_id: "org_airman_academy",
      campus_id: "campus_main",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type,
      summary: this.generateSummary(type, payload),
      details: payload,
      user_id: userId,
      role
    };

    this.events.push(event);
    this.listeners.forEach(listener => listener(event));
  }

  getEvents(): EventLog[] {
    return [...this.events].reverse(); // Most recent first
  }

  notifyListeners(event: EventLog): void {
    this.listeners.forEach(listener => listener(event));
  }

  private generateSummary(type: string, payload: EventBusPayload): string {
    switch (type) {
      case "schedule.optimized":
        return `AI optimized schedule: ${payload.changesApplied || 0} changes applied`;
      case "debrief.created":
        return `Flight debrief generated for ${payload.student || "student"}`;
      case "maintenance.planned":
        return `Maintenance planned for ${payload.aircraft || "aircraft"}`;
      case "compliance.report.generated":
        return `Compliance report generated: ${payload.issues || 0} issues found`;
      case "invoice.created":
        return `Invoice generated: £${payload.amount || 0} for ${payload.student || "student"}`;
      case "crm.lead.scored":
        return `AI scored ${payload.leadsCount || 0} leads`;
      case "crm.outreach.drafted":
        return `Outreach campaign drafted for ${payload.segment || "leads"}`;
      case "support.reply.suggested":
        return `AI suggested reply for ticket #${payload.ticketId || "unknown"}`;
      case "notice.sent":
        return `Notice sent to Captain: ${payload.subject || "Update"}`;
      case "aircraft.grounded":
        return `Aircraft ${payload.registration || "unknown"} grounded`;
      case "conflict.detected":
        return `Schedule conflict detected: ${payload.rule || "unknown rule"}`;
      default:
        return `Event: ${type}`;
    }
  }
}

// Global event bus instance
export const eventBus = new EventBus();

// Helper function to log AI actions
export const logAIAction = (
  type: string, 
  payload: EventBusPayload, 
  userId?: string, 
  role?: AcademyRole
) => {
  eventBus.push(type, payload, userId, role);
};

// New publish function for Supabase integration
export async function publish(event: Event) {
  // Notify in-memory handlers
  const eventLog: EventLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    org_id: event.org_id,
    campus_id: "campus_main",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: event.type,
    summary: event.message,
    details: event.metadata || {},
    user_id: event.user_id,
    role: undefined
  };
  
  eventBus.notifyListeners(eventLog);

  try {
    // Insert into event_log
    await supabase.from("event_log").insert({
      type: event.type,
      category: event.category,
      message: event.message,
      metadata: event.metadata ?? {},
      user_id: event.user_id ?? null,
      org_id: event.org_id,
    });

    // Insert into notifications with category
    await supabase.from("notifications").insert({
      title: `AI Agent: ${event.type}`,
      message: event.message,
      user_id: event.user_id ?? null,
      org_id: event.org_id,
      category: event.category,
      read: false,
      type: "info"
    });
  } catch (error) {
    console.error("Failed to publish event:", error);
  }
}