import { Users, Calendar, Plane, GraduationCap, AlertTriangle, Bot, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "@/components/dashboard/KPICard"
import { AlertCard } from "@/components/dashboard/AlertCard"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { FleetStatus } from "@/components/dashboard/FleetStatus"
import { CRMAgent } from "@/components/ai/CRMAgent"
import { ComplianceAgent } from "@/components/ai/ComplianceAgent"
import { FinanceAgent } from "@/components/ai/FinanceAgent"
import { SupportCopilot } from "@/components/ai/SupportCopilot"

import { getWidgetsForRole, getAIAgentsForRole, getPrimaryMetricsForRole } from "@/config/roleWidgets"
import type { UserRole } from "@/types/auth"
import { useAuthBackend } from "@/hooks/useAuthBackend"
import { Skeleton } from "@/components/ui/skeleton"
import { NAV_BY_ROLE } from "@/components/layout/AppSidebar"
import { useOpsOverview } from "@/hooks/useOpsOverview"
import { useEffect, useState } from "react"

interface DashboardProps {
  currentUserRole?: UserRole;
}

// Role-specific KPI configurations (using backend UserRole)
const roleKPIs: Partial<Record<UserRole, Array<{
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: any;
  subtitle: string;
}>>> = {
  ADMIN: [
    { title: "Total Revenue", value: "£2.4M", change: "+8%", changeType: "positive", icon: GraduationCap, subtitle: "this year" },
    { title: "Active Students", value: 156, change: "+12%", changeType: "positive", icon: Users, subtitle: "vs last month" },
    { title: "Compliance Score", value: "94%", change: "+2%", changeType: "positive", icon: AlertTriangle, subtitle: "regulatory audit" },
    { title: "System Health", value: "99.2%", change: "0%", changeType: "neutral", icon: Plane, subtitle: "uptime" }
  ],
  OPS_MANAGER: [
    { title: "Today's Flights", value: 24, change: "+3", changeType: "positive", icon: Calendar, subtitle: "scheduled flights" },
    { title: "Fleet Availability", value: "87%", change: "-2%", changeType: "negative", icon: Plane, subtitle: "8 of 9 aircraft" },
    { title: "Active Conflicts", value: 3, change: "-2", changeType: "positive", icon: AlertTriangle, subtitle: "resolved today" },
    { title: "Instructor Utilization", value: "76%", change: "+4%", changeType: "positive", icon: Users, subtitle: "weekly average" }
  ],
  MAINTENANCE_OFFICER: [
    { title: "Available Aircraft", value: 8, change: "-1", changeType: "negative", icon: Plane, subtitle: "of 9 total" },
    { title: "Open Defects", value: 12, change: "+2", changeType: "negative", icon: AlertTriangle, subtitle: "across fleet" },
    { title: "Overdue Maintenance", value: 0, change: "0", changeType: "positive", icon: Calendar, subtitle: "items" },
    { title: "Parts in Stock", value: "92%", change: "+3%", changeType: "positive", icon: GraduationCap, subtitle: "critical items" }
  ],
  COMPLIANCE_OFFICER: [
    { title: "Expiring Documents", value: 8, change: "-3", changeType: "positive", icon: AlertTriangle, subtitle: "next 30 days" },
    { title: "Compliance Score", value: "94%", change: "+2%", changeType: "positive", icon: GraduationCap, subtitle: "overall rating" },
    { title: "Training Hours Variance", value: "2.1%", change: "-0.5%", changeType: "positive", icon: Calendar, subtitle: "vs regulation" },
    { title: "Audit Items", value: 3, change: "-5", changeType: "positive", icon: Users, subtitle: "open items" }
  ],
  ACCOUNTS_OFFICER: [
    { title: "Outstanding Amount", value: "£84K", change: "-12%", changeType: "positive", icon: GraduationCap, subtitle: "vs last month" },
    { title: "Collection Rate", value: "94%", change: "+3%", changeType: "positive", icon: Calendar, subtitle: "30-day average" },
    { title: "Monthly Revenue", value: "£180K", change: "+7%", changeType: "positive", icon: Plane, subtitle: "vs target" },
    { title: "Overdue Count", value: 12, change: "-4", changeType: "positive", icon: AlertTriangle, subtitle: "invoices" }
  ],
  MARKETING_CRM: [
    { title: "New Leads", value: 42, change: "+18", changeType: "positive", icon: Users, subtitle: "this month" },
    { title: "Conversion Rate", value: "24%", change: "+3%", changeType: "positive", icon: GraduationCap, subtitle: "lead to student" },
    { title: "Pipeline Value", value: "£340K", change: "+12%", changeType: "positive", icon: Plane, subtitle: "potential revenue" },
    { title: "Cost per Acquisition", value: "£280", change: "-8%", changeType: "positive", icon: Calendar, subtitle: "marketing spend" }
  ],
  SUPPORT_STAFF: [
    { title: "Open Tickets", value: 12, change: "-3", changeType: "positive", icon: AlertTriangle, subtitle: "active conversations" },
    { title: "Avg Response Time", value: "1.2h", change: "-20m", changeType: "positive", icon: Calendar, subtitle: "vs SLA target" },
    { title: "Satisfaction Score", value: "4.8", change: "+0.2", changeType: "positive", icon: GraduationCap, subtitle: "out of 5.0" },
    { title: "Resolution Rate", value: "89%", change: "+5%", changeType: "positive", icon: Users, subtitle: "first contact" }
  ],
}

export default function Dashboard({ currentUserRole }: DashboardProps) {
  const { user, loading } = useAuthBackend();
  const { getDailySummary, loading: opsLoading } = useOpsOverview();
  const [opsData, setOpsData] = useState<any>(null);
  
  // Fetch ops data for today
  useEffect(() => {
    if (user?.role && NAV_BY_ROLE[user.role]?.includes('dashboard')) {
      const today = new Date().toISOString().split('T')[0];
      getDailySummary(today).then(setOpsData);
    }
  }, [user, getDailySummary]);
  
  // Check if user has access to dashboard
  const userRole = user?.role || currentUserRole;
  if (userRole && !NAV_BY_ROLE[userRole]?.includes('dashboard')) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">You don't have access to the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Use user role if available, otherwise use prop or default
  const effectiveRole = userRole || currentUserRole || "OPS_MANAGER";
  const widgets = getWidgetsForRole(effectiveRole as UserRole);
  const aiAgents = getAIAgentsForRole(effectiveRole as UserRole);
  
  // Use real ops data if available, otherwise fall back to mock KPIs
  const kpis = opsData && effectiveRole === 'OPS_MANAGER' ? [
    { 
      title: "Today's Flights", 
      value: opsData.totalSorties || 0, 
      change: `+${opsData.scheduled || 0}`, 
      changeType: "positive" as const, 
      icon: Calendar, 
      subtitle: "scheduled flights" 
    },
    { 
      title: "Fleet Utilization", 
      value: `${opsData.aircraftUtilization?.toFixed(0) || 0}%`, 
      change: opsData.aircraftUtilization ? `${opsData.aircraftUtilization > 50 ? '+' : '-'}${Math.abs(opsData.aircraftUtilization - 50).toFixed(0)}%` : "0%", 
      changeType: opsData.aircraftUtilization > 50 ? "positive" as const : "negative" as const, 
      icon: Plane, 
      subtitle: "aircraft utilization" 
    },
    { 
      title: "Completed", 
      value: opsData.completed || 0, 
      change: `-${opsData.cancelled || 0}`, 
      changeType: opsData.cancelled === 0 ? "positive" as const : "negative" as const, 
      icon: AlertTriangle, 
      subtitle: "cancelled today" 
    },
    { 
      title: "Instructor Utilization", 
      value: `${opsData.instructorUtilization?.toFixed(0) || 0}%`, 
      change: "+4%", 
      changeType: "positive" as const, 
      icon: Users, 
      subtitle: "weekly average" 
    },
  ] : (roleKPIs[effectiveRole as UserRole] || roleKPIs.OPS_MANAGER || []);

  const renderAIAgent = (agent: string) => {
    switch (agent) {
      case "crm_agent":
        return <CRMAgent key="crm" currentUserRole={effectiveRole as UserRole} />
      case "compliance_agent":
        return <ComplianceAgent key="compliance" currentUserRole={effectiveRole as UserRole} />
      case "finance_agent":
        return <FinanceAgent key="finance" currentUserRole={effectiveRole as UserRole} />
      case "support_copilot":
        return <SupportCopilot key="support" currentUserRole={effectiveRole as UserRole} />
      case "maintenance_planner":
        return null // MaintenancePlanner is context-specific and used in Fleet page
      default:
        return null
    }
  }
  
  if (loading || opsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN" ? "Admin Dashboard" :
             effectiveRole === "OPS_MANAGER" ? "Operations Dashboard" :
             effectiveRole === "MAINTENANCE_OFFICER" ? "Maintenance Dashboard" :
             effectiveRole === "COMPLIANCE_OFFICER" ? "Compliance Dashboard" :
             effectiveRole === "ACCOUNTS_OFFICER" ? "Finance Dashboard" :
             effectiveRole === "MARKETING_CRM" ? "Marketing & CRM Dashboard" :
             effectiveRole === "SUPPORT_STAFF" ? "Support Dashboard" :
             "Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {user ? `Welcome back, ${user.fullName || user.email?.split('@')[0] || 'User'}!` : 'Flight training operations overview'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* AI Agents for current role */}
          {aiAgents.includes("all") || aiAgents.includes("crm_agent") ? renderAIAgent("crm_agent") : null}
          {aiAgents.includes("all") || aiAgents.includes("compliance_agent") ? renderAIAgent("compliance_agent") : null}
          {aiAgents.includes("all") || aiAgents.includes("finance_agent") ? renderAIAgent("finance_agent") : null}
          {aiAgents.includes("all") || aiAgents.includes("support_copilot") ? renderAIAgent("support_copilot") : null}
          {aiAgents.includes("all") || aiAgents.includes("maintenance_planner") ? renderAIAgent("maintenance_planner") : null}
          
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Role-specific KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>

      {/* Role-specific AI Alerts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Insights & Alerts
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {effectiveRole === "ops_manager" && (
            <>
              <AlertCard
                type="warning"
                title="Schedule Optimization Available"
                description="3 potential conflicts detected for tomorrow's schedule"
                timestamp="15 minutes ago"
              />
              <AlertCard
                type="info"
                title="Weather Impact"
                description="Morning flights may be delayed due to low cloud base"
                timestamp="30 minutes ago"
              />
            </>
          )}
          
          {effectiveRole === "maintenance_officer" && (
            <>
              <AlertCard
                type="warning"
                title="Maintenance Due"
                description="Aircraft N456CD requires 100-hour inspection in 5 flight hours"
                timestamp="30 minutes ago"
              />
              <AlertCard
                type="info"
                title="Parts Order Suggested"
                description="AI recommends ordering spark plugs based on usage patterns"
                timestamp="1 hour ago"
              />
            </>
          )}
          
          {effectiveRole === "compliance_officer" && (
            <>
              <AlertCard
                type="warning"
                title="Documents Expiring"
                description="3 instructor medicals expire within 14 days"
                timestamp="20 minutes ago"
              />
              <AlertCard
                type="success"
                title="Audit Report Ready"
                description="Q1 compliance report generated successfully"
                timestamp="45 minutes ago"
              />
            </>
          )}
          
          {effectiveRole === "accounts_officer" && (
            <>
              <AlertCard
                type="warning"
                title="Overdue Invoices"
                description="£12,400 in invoices now 30+ days overdue"
                timestamp="10 minutes ago"
              />
              <AlertCard
                type="info"
                title="Invoice Generation"
                description="15 new invoices ready for review from completed flights"
                timestamp="25 minutes ago"
              />
            </>
          )}
          
          {effectiveRole === "marketing_crm" && (
            <>
              <AlertCard
                type="success"
                title="High-Value Lead"
                description="New ATPL inquiry with £100K+ training budget detected"
                timestamp="5 minutes ago"
              />
              <AlertCard
                type="info"
                title="Campaign Performance"
                description="Weekend training campaign achieving 32% conversion rate"
                timestamp="35 minutes ago"
              />
            </>
          )}
          
          {effectiveRole === "support" && (
            <>
              <AlertCard
                type="warning"
                title="SLA Breach Risk"
                description="2 tickets approaching 4-hour response deadline"
                timestamp="12 minutes ago"
              />
              <AlertCard
                type="success"
                title="AI Response Ready"
                description="Suggested reply generated for billing inquiry"
                timestamp="18 minutes ago"
              />
            </>
          )}
          
          {effectiveRole === "admin" && (
            <>
              <AlertCard
                type="success"
                title="System Health"
                description="All integrations operational - 99.2% uptime this month"
                timestamp="2 hours ago"
              />
              <AlertCard
                type="info"
                title="Monthly Summary"
                description="£180K revenue, 156 active students, 94% compliance score"
                timestamp="3 hours ago"
              />
            </>
          )}
        </div>
      </div>

      {/* Usage Analytics - Admin Only */}
      {(effectiveRole === "admin" || effectiveRole === "ops_manager") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-sm text-muted-foreground">Total Flight Hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">89%</div>
                  <p className="text-sm text-muted-foreground">Aircraft Utilization</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">34</div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-muted-foreground">Pending Items</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Section - role-specific widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <FleetStatus />
      </div>
    </div>
  )
}