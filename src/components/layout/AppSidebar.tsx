import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Calendar,
  Users,
  Plane,
  FileText,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  Search
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Training Calendar", url: "/calendar", icon: Calendar },
  { title: "Students", url: "/students", icon: Users },
  { title: "Fleet & Maintenance", url: "/fleet", icon: Plane },
  { title: "Compliance", url: "/compliance", icon: FileText },
  { title: "Finance", url: "/finance", icon: DollarSign },
  { title: "Messages", url: "/messages", icon: MessageSquare },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true
    if (path !== "/" && currentPath.startsWith(path)) return true
    return false
  }

  const getNavClassNames = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground shadow-sm`
    }
    return `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-accent`
  }

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border bg-gradient-to-r from-primary to-primary-light">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary font-bold">
            A+
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-white font-semibold text-lg">AIRMAN</span>
              <span className="text-white/80 text-xs font-medium">Academy+</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        {!collapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0">
                    <NavLink
                      to={item.url}
                      className={getNavClassNames(item.url)}
                    >
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
                <span className="text-primary font-medium text-sm">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">John Doe</div>
                <div className="text-xs text-muted-foreground truncate">Flight Instructor</div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}