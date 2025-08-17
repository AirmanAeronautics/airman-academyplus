import { useMemo } from "react"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { FlightSession } from "@/data/schedule"
import { FlightBlock } from "./FlightBlock"

interface DayViewProps {
  flights: FlightSession[]
  selectedDate: Date
  onFlightUpdate: (flight: FlightSession) => void
}

export function DayView({ flights, selectedDate, onFlightUpdate }: DayViewProps) {
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 6 // Start at 6 AM
    return `${String(hour).padStart(2, '0')}:00`
  })

  const dayFlights = useMemo(() => {
    // For demo purposes, showing all flights for the selected day
    return flights
  }, [flights, selectedDate])

  const getFlightsForTimeSlot = (time: string) => {
    return dayFlights.filter(flight => {
      const flightStart = flight.timeStart
      const slotHour = parseInt(time.split(':')[0])
      const flightHour = parseInt(flightStart.split(':')[0])
      
      return flightHour === slotHour
    })
  }

  const getDroppableId = (time: string) => {
    const dayStr = selectedDate.toISOString().split('T')[0]
    return `timeSlot-${dayStr}-${time.replace(':', '-')}`
  }

  return (
    <div className="space-y-2 h-[600px] overflow-auto">
      {timeSlots.map((time, index) => {
        const slotFlights = getFlightsForTimeSlot(time)
        const droppableId = getDroppableId(time)
        
        return (
          <Droppable key={time} droppableId={droppableId}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex items-center gap-4 p-3 border rounded-lg min-h-[80px] transition-colors ${
                  snapshot.isDraggingOver ? 'bg-primary/10' : 'bg-muted/30'
                }`}
              >
                {/* Time label */}
                <div className="w-20 text-sm font-medium text-muted-foreground">
                  {time}
                </div>
                
                {/* Flight blocks */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {slotFlights.map((flight, flightIndex) => (
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
                            compact={false}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        )
      })}
    </div>
  )
}