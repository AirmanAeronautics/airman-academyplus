import { Clock, User, Plane, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FlightSession } from "@/data/schedule"
import { cn } from "@/lib/utils"

interface FlightBlockProps {
  flight: FlightSession
  onUpdate: (flight: FlightSession) => void
  compact?: boolean
}

export function FlightBlock({ flight, onUpdate, compact = false }: FlightBlockProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-success bg-success/10"
      case "in-progress":
        return "border-primary bg-primary/10"
      case "scheduled":
        return "border-border bg-background"
      case "cancelled":
        return "border-destructive bg-destructive/10"
      default:
        return "border-border bg-background"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-success/10 text-success text-xs">Done</Badge>
      case "in-progress":
        return <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">Active</Badge>
      case "scheduled":
        return <Badge variant="outline" className="text-xs">Scheduled</Badge>
      case "cancelled":
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive text-xs">Cancelled</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  if (compact) {
    return (
      <div
        className={cn(
          "p-2 rounded border-l-2 cursor-grab active:cursor-grabbing bg-background shadow-sm hover:shadow-md transition-shadow",
          getStatusColor(flight.status)
        )}
        onClick={() => onUpdate(flight)}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium truncate">
              {flight.student.split(' ')[0]}
            </div>
            {getStatusBadge(flight.status)}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {flight.timeStart} • {flight.aircraft}
          </div>
          
          {flight.conflicts && flight.conflicts.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <span className="text-xs text-destructive">Conflict</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
        getStatusColor(flight.status)
      )}
      onClick={() => onUpdate(flight)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{flight.time}</span>
          </div>
          {getStatusBadge(flight.status)}
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{flight.student}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            with {flight.instructor}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{flight.aircraft} • {flight.type}</span>
        </div>
        
        {flight.location && (
          <div className="text-xs text-muted-foreground">
            📍 {flight.location}
          </div>
        )}
        
        {flight.conflicts && flight.conflicts.length > 0 && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 rounded border">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-destructive">
              {flight.conflicts.join(", ")}
            </span>
          </div>
        )}
        
        {flight.notes && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            {flight.notes}
          </div>
        )}
      </div>
    </div>
  )
}