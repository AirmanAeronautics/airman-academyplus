interface Aircraft {
  id: string
  registration: string
  type: string
  status: "active" | "maintenance" | "grounded"
  location: string
  hoursToMaintenance: number
}

const aircraftFleet: Aircraft[] = [
  {
    id: "1",
    registration: "N123AB",
    type: "Cessna 172",
    status: "active",
    location: "Hangar A",
    hoursToMaintenance: 45,
  },
  {
    id: "2",
    registration: "N456CD", 
    type: "Piper PA-28",
    status: "maintenance",
    location: "Maintenance Bay",
    hoursToMaintenance: 0,
  },
  {
    id: "3",
    registration: "N789EF",
    type: "Cessna 152",
    status: "active",
    location: "Flight Line",
    hoursToMaintenance: 120,
  },
  {
    id: "4",
    registration: "N321GH",
    type: "Diamond DA40",
    status: "grounded",
    location: "Hangar B",
    hoursToMaintenance: 25,
  },
]

export function FleetStatus() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <div className="status-active" />
      case "maintenance":
        return <div className="status-warning" />
      case "grounded":
        return <div className="status-inactive" />
      default:
        return <div className="status-inactive" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active"
      case "maintenance":
        return "Maintenance"
      case "grounded":
        return "Grounded"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="aviation-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Fleet Status</h3>
      
      <div className="space-y-3">
        {aircraftFleet.map((aircraft) => (
          <div key={aircraft.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(aircraft.status)}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{aircraft.registration}</span>
                  <span className="text-sm text-muted-foreground">({aircraft.type})</span>
                </div>
                <p className="text-xs text-muted-foreground">{aircraft.location}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{getStatusText(aircraft.status)}</p>
              <p className="text-xs text-muted-foreground">
                {aircraft.hoursToMaintenance > 0 
                  ? `${aircraft.hoursToMaintenance}h to maintenance`
                  : "Maintenance required"
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}