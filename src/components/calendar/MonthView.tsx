import { useMemo } from "react"
import { FlightSession } from "@/data/schedule"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MonthViewProps {
  flights: FlightSession[]
  selectedDate: Date
  onFlightUpdate: (flight: FlightSession) => void
}

export function MonthView({ flights, selectedDate, onFlightUpdate }: MonthViewProps) {
  const monthData = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    
    // Get first day of month and calculate starting day
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    
    // Create array of all days to display (including prev/next month days)
    const days = []
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i)
      days.push({ date: day, isCurrentMonth: false })
    }
    
    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Next month days to complete the grid
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }, [selectedDate])

  const getFlightsForDay = (date: Date) => {
    // For demo purposes, distribute flights across the month
    const dayOfMonth = date.getDate()
    return flights.filter((_, index) => index % 30 === dayOfMonth % 30).slice(0, 3)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success"
      case "in-progress":
        return "bg-primary/10 text-primary"
      case "scheduled":
        return "bg-muted text-muted-foreground"
      case "cancelled":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="space-y-4">
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {monthData.map(({ date, isCurrentMonth }, index) => {
          const dayFlights = getFlightsForDay(date)
          
          return (
            <div
              key={index}
              className={cn(
                "bg-background p-2 min-h-[120px] flex flex-col",
                !isCurrentMonth && "opacity-50",
                isToday(date) && "bg-primary/5 ring-1 ring-primary/20"
              )}
            >
              {/* Date number */}
              <div className={cn(
                "text-sm font-medium mb-2",
                isToday(date) ? "text-primary" : "text-foreground"
              )}>
                {date.getDate()}
              </div>
              
              {/* Flight badges */}
              <div className="space-y-1 flex-1">
                {dayFlights.map((flight, flightIndex) => (
                  <div
                    key={flight.id}
                    className={cn(
                      "px-2 py-1 rounded text-xs truncate cursor-pointer hover:opacity-80 transition-opacity",
                      getStatusColor(flight.status)
                    )}
                    onClick={() => onFlightUpdate(flight)}
                    title={`${flight.student} - ${flight.time}`}
                  >
                    {flight.student.split(' ')[0]} • {flight.timeStart}
                  </div>
                ))}
                
                {dayFlights.length > 3 && (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    +{dayFlights.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}