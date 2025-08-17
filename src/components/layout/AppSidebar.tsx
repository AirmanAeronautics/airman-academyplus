import { NavLink, useLocation } from "react-router-dom"
import {
  Calendar,
  Users,
  Plane,
  FileText,
  DollarSign,
  MessageSquare,
  BarChart3,
  Headset, // for Support
  Megaphone, // for Marketing & CRM
  Settings,
  UserCheck,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { type User } from "@/data/users"
import { useAuth } from "@/hooks/useAuth"

// ---- ROLE MODEL -------------------------------------------------------------

// Only Academy staff roles (no student/instructor logins here)
export type AcademyRole =
  | "admin"
  | "ops_manager"
  | "maintenance_officer"
  | "compliance_officer"
  | "accounts_officer"
  | "marketing_crm"
  | "support"

// If your User.type doesn't yet reflect these, ensure `role` is a string
// and maps to one of the above. Example (in @/data/users):
// export type User = { id: string; name: string; department?: string; role: AcademyRole }

// Utility to guard unknown roles in dev/demo data
const isAcademyRole = (r: string | undefined): r is AcademyRole =>
  !!r &&
  [
    "admin",
    "ops_manager",
    "maintenance_officer",
    "compliance_officer",
    "accounts_officer",
    "marketing_crm",
    "support",
  ].includes(r)

// ---- NAVIGATION MODEL -------------------------------------------------------

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  roles: AcademyRole[] // which roles can see this
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
    roles: [
      "admin",
      "ops_manager",
      "maintenance_officer",
      "compliance_officer",
      "accounts_officer",
      "marketing_crm",
      "support",
    ],
  },
  {
    title: "Admin Settings",
    url: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
  },
  {
    title: "Pending Requests",
    url: "/admin/pending-requests",
    icon: UserCheck,
    roles: ["admin"],
  },
  {
    title: "Training Calendar",
    url: "/calendar",
    icon: Calendar,
    roles: ["admin", "ops_manager"],
  },
  {
    title: "Pilots",
    url: "/people",
    icon: Users,
    roles: ["admin", "ops_manager", "compliance_officer", "accounts_officer", "marketing_crm", "support"],
  },
  {
    title: "Fleet & Maintenance",
    url: "/fleet",
    icon: Plane,
    roles: ["admin", "ops_manager", "maintenance_officer"],
  },
  {
    title: "Compliance",
    url: "/compliance",
    icon: FileText,
    roles: ["admin", "ops_manager", "compliance_officer"],
  },
  {
    title: "Finance",
    url: "/finance",
    icon: DollarSign,
    roles: ["admin", "accounts_officer"],
  },
  {
    title: "Marketing & CRM",
    url: "/marketing",
    icon: Megaphone,
    roles: ["admin", "marketing_crm"],
  },
  {
    title: "Support",
    url: "/support",
    icon: Headset,
    roles: ["admin", "support", "ops_manager", "marketing_crm"],
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
    roles: [
      "admin",
      "ops_manager",
      "maintenance_officer",
      "compliance_officer",
      "accounts_officer",
      "marketing_crm",
      "support",
    ],
  },
]

// ---- COMPONENT --------------------------------------------------------------

interface AppSidebarProps {
  currentUser?: User
}

export function AppSidebar({ currentUser }: AppSidebarProps) {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const role: AcademyRole = isAcademyRole(currentUser?.role) ? currentUser!.role : "ops_manager" // sensible default for demo

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true
    if (path !== "/" && currentPath.startsWith(path)) return true
    return false
  }

  const getNavClassNames = (path: string) => {
    const base =
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
    return isActive(path)
      ? `${base} bg-primary text-primary-foreground shadow-sm`
      : `${base} text-muted-foreground hover:text-foreground hover:bg-accent`
  }

  const initials =
    currentUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) ?? "A+"

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border bg-gradient-to-r from-primary to-primary/70">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary font-bold">
            A+
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-white font-semibold text-lg">AIRMAN</span>
              <span className="text-white/80 text-xs font-medium">Academy</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        {!collapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              {/* Search */}
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
              <Input
                placeholder="Search…"
                className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {collapsed ? "MENU" : "NAVIGATION"}
          </SidebarGroupLabel>

          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {navigationItems
                .filter((item) => item.roles.includes(role))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-auto p-0">
                      <NavLink to={item.url} className={getNavClassNames(item.url)}>
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto px-4 py-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium text-sm">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {currentUser?.name ?? "AIRMAN User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {currentUser?.department ?? "Operations"}
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}