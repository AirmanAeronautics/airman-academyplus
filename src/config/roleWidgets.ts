// AIRMAN Academy+ Role-based Dashboard Configuration
// Dynamic widget mapping for each user role

import type { AcademyRole } from "@/types"

interface DashboardWidget {
  id: string
  title: string
  component: string
  size: "small" | "medium" | "large" | "full"
  priority: number
  description?: string
}

interface RoleConfig {
  role: AcademyRole
  widgets: DashboardWidget[]
  aiAgents: string[]
  primaryMetrics: string[]
}

export const roleWidgets: Record<AcademyRole, RoleConfig> = {
  admin: {
    role: "admin",
    widgets: [
      {
        id: "org-overview",
        title: "Organization Overview",
        component: "OrgOverviewCard",
        size: "large",
        priority: 1,
        description: "High-level organizational metrics and health"
      },
      {
        id: "user-management",
        title: "User & Role Management",
        component: "UserManagementCard", 
        size: "medium",
        priority: 2
      },
      {
        id: "system-integrations",
        title: "System Integrations",
        component: "IntegrationsCard",
        size: "medium", 
        priority: 3
      },
      {
        id: "financial-summary",
        title: "Financial Summary",
        component: "FinancialSummaryCard",
        size: "medium",
        priority: 4
      },
      {
        id: "compliance-status",
        title: "Compliance Overview",
        component: "ComplianceStatusCard",
        size: "medium",
        priority: 5
      },
      {
        id: "event-log",
        title: "Recent System Events",
        component: "EventLogCard",
        size: "full",
        priority: 6
      }
    ],
    aiAgents: ["all"],
    primaryMetrics: ["total_revenue", "active_students", "compliance_score", "system_health"]
  },

  ops_manager: {
    role: "ops_manager",
    widgets: [
      {
        id: "todays-schedule",
        title: "Today's Flight Schedule",
        component: "TodaysScheduleCard",
        size: "large",
        priority: 1,
        description: "Live view of today's training flights and status"
      },
      {
        id: "fleet-status",
        title: "Fleet Availability",
        component: "FleetStatusCard", 
        size: "medium",
        priority: 2
      },
      {
        id: "schedule-conflicts",
        title: "Schedule Conflicts",
        component: "ConflictsCard",
        size: "medium",
        priority: 3
      },
      {
        id: "weather-alerts",
        title: "Weather & NOTAMs",
        component: "WeatherAlertsCard",
        size: "medium",
        priority: 4
      },
      {
        id: "instructor-availability", 
        title: "Instructor Availability",
        component: "InstructorAvailabilityCard",
        size: "medium",
        priority: 5
      },
      {
        id: "ai-schedule-alerts",
        title: "AI Schedule Recommendations",
        component: "AIScheduleAlertsCard",
        size: "full",
        priority: 6
      }
    ],
    aiAgents: ["scheduler", "instructor_copilot"],
    primaryMetrics: ["todays_flights", "available_aircraft", "active_conflicts", "instructor_utilization"]
  },

  maintenance_officer: {
    role: "maintenance_officer", 
    widgets: [
      {
        id: "grounded-aircraft",
        title: "Grounded Aircraft",
        component: "GroundedAircraftCard",
        size: "large",
        priority: 1,
        description: "Aircraft currently out of service and reasons"
      },
      {
        id: "maintenance-schedule",
        title: "Upcoming Maintenance",
        component: "MaintenanceScheduleCard",
        size: "medium", 
        priority: 2
      },
      {
        id: "open-defects",
        title: "Open Defects",
        component: "OpenDefectsCard",
        size: "medium",
        priority: 3
      },
      {
        id: "hours-to-maintenance",
        title: "Hours to Next Check",
        component: "HoursToMaintenanceCard",
        size: "medium",
        priority: 4
      },
      {
        id: "parts-inventory",
        title: "Parts Inventory Status",
        component: "PartsInventoryCard",
        size: "medium",
        priority: 5
      },
      {
        id: "ai-maintenance-tasks",
        title: "AI Maintenance Recommendations",
        component: "AIMaintenanceTasksCard",
        size: "full",
        priority: 6
      }
    ],
    aiAgents: ["maintenance_planner"],
    primaryMetrics: ["available_aircraft", "open_defects", "overdue_maintenance", "parts_shortage"]
  },

  compliance_officer: {
    role: "compliance_officer",
    widgets: [
      {
        id: "expiring-documents",
        title: "Expiring Documents",
        component: "ExpiringDocsCard", 
        size: "large",
        priority: 1,
        description: "Medical certificates, licenses, and ratings expiring soon"
      },
      {
        id: "currency-status",
        title: "Currency & Recency",
        component: "CurrencyStatusCard",
        size: "medium",
        priority: 2
      },
      {
        id: "training-hours-audit",
        title: "Training Hours Audit",
        component: "TrainingHoursAuditCard", 
        size: "medium",
        priority: 3
      },
      {
        id: "compliance-violations",
        title: "Compliance Violations",
        component: "ComplianceViolationsCard",
        size: "medium",
        priority: 4
      },
      {
        id: "regulator-reports",
        title: "Regulator Reporting",
        component: "RegulatorReportsCard",
        size: "medium", 
        priority: 5
      },
      {
        id: "ai-compliance-alerts",
        title: "AI Compliance Monitoring",
        component: "AIComplianceAlertsCard",
        size: "full",
        priority: 6
      }
    ],
    aiAgents: ["compliance_agent"],
    primaryMetrics: ["expiring_documents", "compliance_score", "training_hours_variance", "audit_items"]
  },

  accounts_officer: {
    role: "accounts_officer",
    widgets: [
      {
        id: "unpaid-invoices",
        title: "Unpaid Invoices",
        component: "UnpaidInvoicesCard",
        size: "large", 
        priority: 1,
        description: "Outstanding invoices and payment status"
      },
      {
        id: "ar-aging",
        title: "Accounts Receivable Aging",
        component: "ARAgingCard",
        size: "medium",
        priority: 2
      },
      {
        id: "todays-billables",
        title: "Today's Billable Hours",
        component: "TodaysBillablesCard",
        size: "medium",
        priority: 3
      },
      {
        id: "payment-methods",
        title: "Payment Method Usage",
        component: "PaymentMethodsCard", 
        size: "medium",
        priority: 4
      },
      {
        id: "revenue-projection",
        title: "Revenue Projection",
        component: "RevenueProjectionCard",
        size: "medium",
        priority: 5
      },
      {
        id: "ai-invoice-suggestions",
        title: "AI Invoice Automation",
        component: "AIInvoiceSuggestionsCard",
        size: "full",
        priority: 6
      }
    ],
    aiAgents: ["finance_agent"],
    primaryMetrics: ["outstanding_amount", "collection_rate", "monthly_revenue", "overdue_count"]
  },

  marketing_crm: {
    role: "marketing_crm",
    widgets: [
      {
        id: "lead-pipeline",
        title: "Lead Pipeline by Stage",
        component: "LeadPipelineCard",
        size: "large",
        priority: 1,
        description: "Lead progression through sales funnel"
      },
      {
        id: "campaign-performance",
        title: "Campaign Performance",
        component: "CampaignPerformanceCard",
        size: "medium",
        priority: 2
      },
      {
        id: "conversion-metrics",
        title: "Conversion Metrics",
        component: "ConversionMetricsCard",
        size: "medium", 
        priority: 3
      },
      {
        id: "lead-source-analysis",
        title: "Lead Source Analysis", 
        component: "LeadSourceAnalysisCard",
        size: "medium",
        priority: 4
      },
      {
        id: "upcoming-outreach",
        title: "Upcoming Outreach",
        component: "UpcomingOutreachCard",
        size: "medium",
        priority: 5
      },
      {
        id: "ai-lead-scoring",
        title: "AI Lead Scoring & Insights",
        component: "AILeadScoringCard", 
        size: "full",
        priority: 6
      }
    ],
    aiAgents: ["crm_agent"],
    primaryMetrics: ["new_leads", "conversion_rate", "pipeline_value", "cost_per_acquisition"]
  },

  support: {
    role: "support",
    widgets: [
      {
        id: "open-tickets",
        title: "Open Support Tickets",
        component: "OpenTicketsCard",
        size: "large",
        priority: 1,
        description: "Active customer support conversations"
      },
      {
        id: "sla-breaches",
        title: "SLA Breaches Today",
        component: "SLABreachesCard",
        size: "medium",
        priority: 2
      },
      {
        id: "channel-volume",
        title: "Channel Volume",
        component: "ChannelVolumeCard", 
        size: "medium",
        priority: 3
      },
      {
        id: "satisfaction-scores",
        title: "Customer Satisfaction",
        component: "SatisfactionScoresCard",
        size: "medium",
        priority: 4
      },
      {
        id: "escalation-queue",
        title: "Escalation Queue",
        component: "EscalationQueueCard",
        size: "medium",
        priority: 5
      },
      {
        id: "ai-suggested-replies",
        title: "AI Support Copilot",
        component: "AISuggestedRepliesCard",
        size: "full", 
        priority: 6
      }
    ],
    aiAgents: ["support_copilot"],
    primaryMetrics: ["open_tickets", "avg_response_time", "satisfaction_score", "resolution_rate"]
  }
}

// Helper functions
export const getWidgetsForRole = (role: AcademyRole): DashboardWidget[] => {
  return roleWidgets[role]?.widgets || []
}

export const getAIAgentsForRole = (role: AcademyRole): string[] => {
  return roleWidgets[role]?.aiAgents || []
}

export const getPrimaryMetricsForRole = (role: AcademyRole): string[] => {
  return roleWidgets[role]?.primaryMetrics || []
}

export const isWidgetAvailableForRole = (widgetId: string, role: AcademyRole): boolean => {
  const widgets = getWidgetsForRole(role)
  return widgets.some(widget => widget.id === widgetId)
}