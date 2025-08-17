import { useMemo } from "react"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { FlightSession } from "@/data/schedule"
import { FlightBlock } from "./FlightBlock"
import { Badge } from "@/components/ui/badge"

interface WeekViewProps {
  flights: FlightSession[]
  selectedDate: Date
  onFlightUpdate: (flight: FlightSession) => void
}

export function WeekView({ flights, selectedDate, onFlightUpdate }: WeekViewProps) {
  const weekData = useMemo(() => {
    // Get start of week (Sunday)
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    // Generate 7 days
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push(day)
    }
    
    return days
  }, [selectedDate])

  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 7 // Start at 7 AM
    return `${String(hour).padStart(2, '0')}:00`
  })

  const getFlightsForTimeSlot = (day: Date, time: string) => {
    const dayStr = day.toISOString().split('T')[0]
    return flights.filter(flight => {
      const flightStart = flight.timeStart
      const slotHour = parseInt(time.split(':')[0])
      const flightHour = parseInt(flightStart.split(':')[0])
      
      // Show flights that start within this hour slot
      return flightHour === slotHour
    })
  }

  const getDroppableId = (day: Date, time: string) => {
    const dayStr = day.toISOString().split('T')[0]
    return `timeSlot-${dayStr}-${time.replace(':', '-')}`
  }

  return (
    <div className="flex flex-col h-[600px] overflow-auto">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-10">
        <div className="p-2 text-sm font-medium text-muted-foreground border-r">
          Time
        </div>
        {weekData.map((day, dayIndex) => (
          <div key={dayIndex} className="p-2 text-center border-r last:border-r-0">
            <div className="text-sm font-medium">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="text-xs text-muted-foreground">
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots grid */}
      <div className="flex-1">
        {timeSlots.map((time, timeIndex) => (
          <div key={time} className="grid grid-cols-8 border-b min-h-[60px]">
            {/* Time label */}
            <div className="p-2 text-sm text-muted-foreground border-r bg-muted/30">
              {time}
            </div>
            
            {/* Day columns */}
            {weekData.map((day, dayIndex) => {
              const dayFlights = getFlightsForTimeSlot(day, time)
              const droppableId = getDroppableId(day, time)
              
              return (
                <Droppable key={`${dayIndex}-${timeIndex}`} droppableId={droppableId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-1 border-r last:border-r-0 min-h-[60px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary/10' : ''
                      }`}
                    >
                      {dayFlights.map((flight, flightIndex) => (
                        <Draggable
                          key={flight.id}
                          draggableId={flight.id}
                          index={flightIndex}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? 'opacity-50' : ''}
                            >
                              <FlightBlock 
                                flight={flight} 
                                onUpdate={onFlightUpdate}
                                compact={true}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}