// AIRMAN Academy+ Notification Center
// Connected to event bus for real-time notifications

import { useState, useEffect } from "react"
import { Bell, X, Clock, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { eventBus } from "@/lib/eventBus"
import type { EventLog } from "@/types"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: string
  read: boolean
  actionable?: boolean
  relatedEvent?: EventLog
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Subscribe to event bus
    const unsubscribe = eventBus.subscribe((event: EventLog) => {
      // Convert events to notifications based on type
      const notification = createNotificationFromEvent(event)
      if (notification) {
        setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep last 50
        setUnreadCount(prev => prev + 1)
      }
    })

    // Initialize with some demo notifications
    const initialNotifications: Notification[] = [
      {
        id: "notif_1",
        title: "Schedule Optimization Complete",
        message: "AI optimized today's schedule - 3 changes applied to resolve conflicts",
        type: "success",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        actionable: true
      },
      {
        id: "notif_2", 
        title: "Maintenance Due",
        message: "Aircraft N456CD requires 100-hour inspection in 5 flight hours",
        type: "warning",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: false,
        actionable: true
      },
      {
        id: "notif_3",
        title: "New Lead Scored",
        message: "High-value lead detected - immediate follow-up recommended",
        type: "info",
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        read: false,
        actionable: true
      }
    ]

    setNotifications(initialNotifications)
    setUnreadCount(initialNotifications.filter(n => !n.read).length)

    return unsubscribe
  }, [])

  const createNotificationFromEvent = (event: EventLog): Notification | null => {
    const notificationMap: Record<string, Partial<Notification>> = {
      "schedule.optimized": {
        title: "Schedule Optimized",
        message: event.summary,
        type: "success",
        actionable: true
      },
      "maintenance.planned": {
        title: "Maintenance Scheduled",
        message: event.summary,
        type: "info",
        actionable: true
      },
      "compliance.report.generated": {
        title: "Compliance Report Ready",
        message: event.summary,
        type: "warning",
        actionable: true
      },
      "invoice.created": {
        title: "Invoice Generated",
        message: event.summary,
        type: "success",
        actionable: false
      },
      "crm.lead.scored": {
        title: "Leads Scored",
        message: event.summary,
        type: "info",
        actionable: true
      },
      "debrief.created": {
        title: "Flight Debrief Generated",
        message: event.summary,
        type: "success",
        actionable: false
      },
      "aircraft.grounded": {
        title: "Aircraft Grounded",
        message: event.summary,
        type: "error",
        actionable: true
      },
      "conflict.detected": {
        title: "Schedule Conflict",
        message: event.summary,
        type: "warning",
        actionable: true
      }
    }

    const template = notificationMap[event.type]
    if (!template) return null

    return {
      id: `notif_${event.id}`,
      title: template.title!,
      message: template.message!,
      type: template.type!,
      timestamp: event.created_at,
      read: false,
      actionable: template.actionable,
      relatedEvent: event
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
    const wasUnread = notifications.find(n => n.id === notificationId)?.read === false
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "info": 
      default: return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="relative"
          data-testid="notification-center"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map(notification => (
                <Card 
                  key={notification.id}
                  className={`mb-2 cursor-pointer transition-all hover:bg-accent ${
                    !notification.read ? "border-primary/50 bg-primary/5" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h5 className="font-medium text-sm truncate">
                            {notification.title}
                          </h5>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(notification.timestamp)}
                          </div>
                          
                          {notification.actionable && (
                            <Badge variant="outline" className="text-xs">
                              Action available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t p-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-sm"
              onClick={() => {
                setIsOpen(false)
                // Navigate to event log or notifications page
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}