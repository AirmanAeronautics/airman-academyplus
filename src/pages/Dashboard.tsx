import { Users, Calendar, Plane, GraduationCap, AlertTriangle, TrendingUp } from "lucide-react"
import { KPICard } from "@/components/dashboard/KPICard"
import { AlertCard } from "@/components/dashboard/AlertCard"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { FleetStatus } from "@/components/dashboard/FleetStatus"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Flight training operations overview
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Students"
          value={156}
          change="+12%"
          changeType="positive"
          icon={Users}
          subtitle="vs last month"
        />
        <KPICard
          title="Today's Flights"
          value={24}
          change="+3"
          changeType="positive"
          icon={Calendar}
          subtitle="scheduled flights"
        />
        <KPICard
          title="Fleet Availability"
          value="87%"
          change="-2%"
          changeType="negative"
          icon={Plane}
          subtitle="8 of 9 aircraft"
        />
        <KPICard
          title="Course Completion"
          value="94%"
          change="+5%"
          changeType="positive"
          icon={GraduationCap}
          subtitle="this month"
        />
      </div>

      {/* AI Alerts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          AI Alerts & Notifications
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AlertCard
            type="warning"
            title="Maintenance Due"
            description="Aircraft N456CD requires 100-hour inspection in 5 flight hours"
            timestamp="30 minutes ago"
          />
          <AlertCard
            type="info"
            title="Training Milestone"
            description="Sarah Wilson is ready for her CPL checkride - schedule recommendation"
            timestamp="1 hour ago"
          />
          <AlertCard
            type="success"
            title="Compliance Update"
            description="All instructor certificates renewed successfully for Q1 2024"
            timestamp="2 hours ago"
          />
          <AlertCard
            type="error"
            title="Weather Alert"
            description="Training flights delayed due to low visibility conditions"
            timestamp="3 hours ago"
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <FleetStatus />
      </div>
    </div>
  )
}