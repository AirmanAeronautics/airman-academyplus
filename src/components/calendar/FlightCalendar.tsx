import { useState, useMemo } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Upload, Plus, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { WeekView } from "./WeekView"
import { DayView } from "./DayView"
import { MonthView } from "./MonthView"
import { DragDropContext, DropResult } from "@hello-pangea/dnd"
import { FlightSession } from "@/data/schedule"
import { SchedulerAgent } from "@/components/ai/SchedulerAgent"
import { ExportDialog } from "./ExportDialog"
import { useToast } from "@/hooks/use-toast"
import { eventBus } from "@/lib/eventBus"
import { useAuthBackend } from "@/hooks/useAuthBackend"
import { updateRosterEntry, deleteRosterEntry } from "@/lib/api/roster"
import { format } from "date-fns"

type CalendarView = "month" | "week" | "day"

interface FlightCalendarProps {
  flights: FlightSession[]
  onFlightsChange: (flights: FlightSession[]) => void
  onScheduleOptimize?: (changes: any[]) => void
  selectedDate?: Date
  onDateChange?: (date: Date) => void
  onRefresh?: () => void
  isLoading?: boolean
  instituteId?: string
  isAdminOrOps?: boolean
}

export function FlightCalendar({ 
  flights, 
  onFlightsChange, 
  onScheduleOptimize,
  selectedDate: externalSelectedDate,
  onDateChange: externalOnDateChange,
  onRefresh,
  isLoading = false,
  instituteId,
  isAdminOrOps = false,
}: FlightCalendarProps) {
  const [view, setView] = useState<CalendarView>("week")
  const [internalSelectedDate, setInternalSelectedDate] = useState(new Date())
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [updatingFlightId, setUpdatingFlightId] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuthBackend()
  
  // Use external date if provided, otherwise use internal state
  const selectedDate = externalSelectedDate || internalSelectedDate;
  const setSelectedDate = externalOnDateChange || setInternalSelectedDate;

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    const flightId = draggableId

    // Find the flight being moved
    const flight = flights.find(f => f.id === flightId)
    if (!flight) return

    // Parse destination (format: "timeSlot-YYYY-MM-DD-HH:mm")
    const destParts = destination.droppableId.split('-')
    if (destParts.length < 4) return

    const newDate = destParts[1]
    const newTime = `${destParts[2]}:${destParts[3]}`
    
    // Calculate new end time (assuming 2-hour duration)
    const startHour = parseInt(destParts[2])
    const endTime = `${String(startHour + 2).padStart(2, '0')}:${destParts[3]}`

    const updatedFlight: FlightSession = {
      ...flight,
      timeStart: newTime,
      timeEnd: endTime,
      time: `${newTime} - ${endTime}`,
      status: "scheduled"
    }

    // Optimistically update UI
    const updatedFlights = flights.map(f => 
      f.id === flightId ? updatedFlight : f
    )
    onFlightsChange(updatedFlights)

    // Update via API if user has permission
    if (isAdminOrOps && flightId) {
      setUpdatingFlightId(flightId);
      try {
        await updateRosterEntry(flightId, {
          date: newDate,
          startTime: newTime,
          endTime: endTime,
        });
        toast({
          title: "Flight Rescheduled",
          description: `${flight.student}'s flight moved to ${updatedFlight.time}`,
        });
      } catch (error: any) {
        // Revert on error
        onFlightsChange(flights);
        const errorMessage = error.errorCode === 'CONFLICT' 
          ? 'Time conflict with existing slot.'
          : error.message || 'Failed to update flight';
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setUpdatingFlightId(null);
      }
    } else {
      // Just show toast for non-admin users
      toast({
        title: "Flight Rescheduled",
        description: `${flight.student}'s flight moved to ${updatedFlight.time}`,
      });
    }

    // Log the schedule change to event bus
    eventBus.push('flight_rescheduled', {
      flightId,
      student: flight.student,
      oldTime: flight.time,
      newTime: updatedFlight.time,
      aircraft: flight.aircraft,
      instructor: flight.instructor
    }, user?.id, user?.role)
  }

  const handleScheduleChanges = (changes: any[]) => {
    if (onScheduleOptimize) {
      onScheduleOptimize(changes)
    }

    // Log AI optimization to event bus
    eventBus.push('ai_schedule_optimization', {
      changesCount: changes.length,
      changes: changes.map(c => ({
        type: c.type,
        student: c.student,
        reason: c.reason
      }))
    }, user?.id, user?.role)
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case "week":
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
    }
    setSelectedDate(newDate)
  }

  const getDateRangeText = () => {
    switch (view) {
      case "day":
        return selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      case "week":
        const weekStart = new Date(selectedDate)
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
      case "month":
        return selectedDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })
      default:
        return ""
    }
  }

  const handleFlightUpdate = async (updatedFlight: FlightSession) => {
    // Optimistically update UI
    const updatedFlights = flights.map(f => 
      f.id === updatedFlight.id ? updatedFlight : f
    )
    onFlightsChange(updatedFlights)

    // Update via API if user has permission
    if (isAdminOrOps && updatedFlight.id) {
      setUpdatingFlightId(updatedFlight.id);
      try {
        // Convert FlightSession back to RosterEntry format for API
        const statusMap: Record<string, 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'> = {
          'scheduled': 'SCHEDULED',
          'cancelled': 'CANCELLED',
          'completed': 'COMPLETED',
          'in-progress': 'SCHEDULED',
        };
        
        const typeMap: Record<string, 'GROUND' | 'FLIGHT' | 'SIM'> = {
          'Flight': 'FLIGHT',
          'Simulator': 'SIM',
          'Ground': 'GROUND',
        };

        await updateRosterEntry(updatedFlight.id, {
          startTime: updatedFlight.timeStart,
          endTime: updatedFlight.timeEnd,
          status: statusMap[updatedFlight.status] || 'SCHEDULED',
          type: typeMap[updatedFlight.type] || 'FLIGHT',
          notes: updatedFlight.notes || null,
        });
      } catch (error: any) {
        // Revert on error
        onFlightsChange(flights);
        const errorMessage = error.errorCode === 'CONFLICT' 
          ? 'Time conflict with existing slot.'
          : error.message || 'Failed to update flight';
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setUpdatingFlightId(null);
      }
    }
  }

  const renderCalendarView = () => {
    const commonProps = {
      flights,
      selectedDate,
      onFlightUpdate: handleFlightUpdate,
    }

    switch (view) {
      case "day":
        return <DayView {...commonProps} />
      case "week":
        return <WeekView {...commonProps} />
      case "month":
        return <MonthView {...commonProps} />
      default:
        return <WeekView {...commonProps} />
    }
  }

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Card className="aviation-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CalendarIcon className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Flight Schedule</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getDateRangeText()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}

                {isAdminOrOps && (
                  <SchedulerAgent 
                    onApplyChanges={handleScheduleChanges}
                    instituteId={instituteId}
                    startDate={format(selectedDate, 'yyyy-MM-dd')}
                    endDate={format(selectedDate, 'yyyy-MM-dd')}
                  />
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportDialog(true)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {renderCalendarView()}
          </CardContent>
        </Card>
      </DragDropContext>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        flights={flights}
        dateRange={getDateRangeText()}
      />
    </div>
  )
}