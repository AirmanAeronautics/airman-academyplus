import { NavLink, useLocation } from "react-router-dom"
import {
  Calendar,
  Users,
  Plane,
  FileText,
  DollarSign,
  MessageSquare,
  BarChart3,
  Headset,
  Megaphone,
  Settings,
  Cloud,
  Radio,
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
import { useAuthBackend } from "@/hooks/useAuthBackend"
import type { UserRole } from "@/types/auth"

// ---- ROLE → NAVIGATION MAPPING ---------------------------------------------

export const NAV_BY_ROLE: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['dashboard','training','roster','ops','fleet','finance','crm','support','compliance','messaging'],
  ADMIN:       ['dashboard','training','roster','ops','fleet','finance','crm','support','compliance','messaging'],
  OPS_MANAGER: ['dashboard','training','roster','ops','fleet','environment','dispatch','support'],
  MAINTENANCE_OFFICER: ['fleet','compliance'],
  COMPLIANCE_OFFICER:  ['compliance','ops'],
  ACCOUNTS_OFFICER:    ['finance'],
  MARKETING_CRM:       ['crm'],
  SUPPORT_STAFF:       ['support','messaging'],
  INSTRUCTOR:          ['roster','training','messages','support'],
  STUDENT:             ['training','support']
};

// ---- NAVIGATION ITEMS -------------------------------------------------------

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  navKey: string // key that matches NAV_BY_ROLE values
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
    navKey: "dashboard",
  },
  {
    title: "Training",
    url: "/calendar",
    icon: Calendar,
    navKey: "training",
  },
  {
    title: "Roster",
    url: "/calendar", // TODO: Update to /roster when route exists
    icon: Users,
    navKey: "roster",
  },
  {
    title: "Ops Overview",
    url: "/", // TODO: Update to /ops when route exists
    icon: BarChart3,
    navKey: "ops",
  },
  {
    title: "Fleet",
    url: "/fleet",
    icon: Plane,
    navKey: "fleet",
  },
  {
    title: "Environment",
    url: "/", // TODO: Update to /environment when route exists
    icon: Cloud,
    navKey: "environment",
  },
  {
    title: "Dispatch",
    url: "/", // TODO: Update to /dispatch when route exists
    icon: Radio,
    navKey: "dispatch",
  },
  {
    title: "Finance",
    url: "/finance",
    icon: DollarSign,
    navKey: "finance",
  },
  {
    title: "CRM",
    url: "/marketing",
    icon: Megaphone,
    navKey: "crm",
  },
  {
    title: "Support",
    url: "/support",
    icon: Headset,
    navKey: "support",
  },
  {
    title: "Compliance",
    url: "/compliance",
    icon: FileText,
    navKey: "compliance",
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
    navKey: "messaging",
  },
  {
    title: "Admin Settings",
    url: "/admin/settings",
    icon: Settings,
    navKey: "dashboard", // Only SUPER_ADMIN and ADMIN can access
  },
]

// ---- COMPONENT --------------------------------------------------------------

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  const { user } = useAuthBackend()

  // Get allowed navigation keys for current user role
  const allowedNavKeys = user?.role ? NAV_BY_ROLE[user.role] || [] : []
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isAdmin = user?.role === 'ADMIN'

  // Filter navigation items based on role
  const visibleItems = navigationItems.filter((item) => {
    // Admin Settings only for SUPER_ADMIN and ADMIN
    if (item.navKey === "dashboard" && item.url === "/admin/settings") {
      return isSuperAdmin || isAdmin
    }
    // Check if user's role allows this nav key
    return allowedNavKeys.includes(item.navKey)
  })

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
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "A+"

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
              {visibleItems.map((item) => (
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
                  {user?.fullName ?? "AIRMAN User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.role ? user.role.replace(/_/g, ' ') : "Operations"}
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}