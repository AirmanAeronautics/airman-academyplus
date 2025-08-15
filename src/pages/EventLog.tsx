// AIRMAN Academy+ Event Log
// Real-time system events and AI actions log

import { useState, useEffect } from "react";
import { Activity, Bot, User, Calendar, Plane, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { eventBus } from "@/lib/eventBus";
import type { EventLog } from "@/types";

export default function EventLog() {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Load initial events
    setEvents(eventBus.getEvents());

    // Subscribe to new events
    const unsubscribe = eventBus.subscribe((newEvent) => {
      setEvents(prev => [newEvent, ...prev]);
    });

    return unsubscribe;
  }, []);

  const filteredEvents = events.filter(event =>
    event.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventIcon = (type: string) => {
    if (type.includes("schedule")) return Calendar;
    if (type.includes("aircraft") || type.includes("maintenance")) return Plane;
    if (type.includes("debrief") || type.includes("compliance")) return FileText;
    if (type.includes("ai") || type.includes("crm") || type.includes("support")) return Bot;
    return Activity;
  };

  const getEventColor = (type: string) => {
    if (type.includes("error") || type.includes("conflict")) return "destructive";
    if (type.includes("warning") || type.includes("grounded")) return "warning";
    if (type.includes("optimized") || type.includes("created")) return "success";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Log</h1>
          <p className="text-muted-foreground mt-1">System events and AI actions</p>
        </div>
        <div className="w-64">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredEvents.map((event) => {
          const EventIcon = getEventIcon(event.type);
          return (
            <Card key={event.id} className="aviation-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <EventIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{event.summary}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={getEventColor(event.type) as any}>
                          {event.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {event.user_id && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{event.role} • {event.user_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredEvents.length === 0 && (
          <Card className="aviation-card">
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events found matching your search.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}