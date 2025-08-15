// AIRMAN Academy+ Event Bus
// Simple in-memory event system for AI actions and state changes

import type { EventLog, AcademyRole } from "@/types";

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