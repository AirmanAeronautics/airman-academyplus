export interface Aircraft {
  id: string;
  registration: string;
  type: string;
  model: string;
  totalHours: number;
  hoursToMaintenance: number;
  maintenanceType: string;
  status: "available" | "in_flight" | "maintenance" | "grounded";
  location: string;
  lastInspection: string;
  nextInspection: string;
  defects: number;
  fuelLevel: number;
}

export const aircraft: Aircraft[] = [
  {
    id: "1",
    registration: "N123AB",
    type: "SEP",
    model: "Cessna 172",
    totalHours: 4250,
    hoursToMaintenance: 35,
    maintenanceType: "100hr Check",
    status: "available",
    location: "Hangar A",
    lastInspection: "2024-07-15",
    nextInspection: "2024-08-15",
    defects: 0,
    fuelLevel: 95
  },
  {
    id: "2", 
    registration: "N456CD",
    type: "SEP",
    model: "Cessna 152",
    totalHours: 6820,
    hoursToMaintenance: 12,
    maintenanceType: "50hr Check",
    status: "in_flight",
    location: "Training Area",
    lastInspection: "2024-07-20",
    nextInspection: "2024-08-20",
    defects: 1,
    fuelLevel: 60
  },
  {
    id: "3",
    registration: "N789EF", 
    type: "MEP",
    model: "Piper Seneca",
    totalHours: 8950,
    hoursToMaintenance: 85,
    maintenanceType: "Annual",
    status: "available",
    location: "Apron B",
    lastInspection: "2024-06-30",
    nextInspection: "2024-09-30",
    defects: 0,
    fuelLevel: 80
  },
  {
    id: "4",
    registration: "N321GH",
    type: "SEP",
    model: "Cessna 172",
    totalHours: 3150,
    hoursToMaintenance: 5,
    maintenanceType: "50hr Check", 
    status: "grounded",
    location: "Maintenance Hangar",
    lastInspection: "2024-07-10",
    nextInspection: "2024-08-10",
    defects: 3,
    fuelLevel: 25
  },
  {
    id: "5",
    registration: "N654IJ",
    type: "SEP",
    model: "Piper Cherokee",
    totalHours: 5670,
    hoursToMaintenance: 45,
    maintenanceType: "100hr Check",
    status: "available",
    location: "Hangar B",
    lastInspection: "2024-07-25",
    nextInspection: "2024-08-25", 
    defects: 0,
    fuelLevel: 75
  },
  {
    id: "6",
    registration: "N987KL",
    type: "MEP", 
    model: "Beechcraft Baron",
    totalHours: 7230,
    hoursToMaintenance: 155,
    maintenanceType: "Annual",
    status: "maintenance", 
    location: "Maintenance Hangar",
    lastInspection: "2024-05-15",
    nextInspection: "2024-11-15",
    defects: 2,
    fuelLevel: 40
  },
  {
    id: "7",
    registration: "N147MN",
    type: "SEP",
    model: "Cessna 152",
    totalHours: 4890,
    hoursToMaintenance: 25,
    maintenanceType: "50hr Check",
    status: "available",
    location: "Apron A",
    lastInspection: "2024-07-18",
    nextInspection: "2024-08-18",
    defects: 1,
    fuelLevel: 90
  },
  {
    id: "8", 
    registration: "N258OP",
    type: "SEP",
    model: "Cessna 172",
    totalHours: 6120,
    hoursToMaintenance: 65,
    maintenanceType: "100hr Check",
    status: "in_flight",
    location: "Cross Country",
    lastInspection: "2024-07-12",
    nextInspection: "2024-08-12",
    defects: 0,
    fuelLevel: 55
  },
  {
    id: "9",
    registration: "N369QR",
    type: "SIM",
    model: "Redbird FMX",
    totalHours: 2890,
    hoursToMaintenance: 110,
    maintenanceType: "Software Update",
    status: "available", 
    location: "Sim Center",
    lastInspection: "2024-07-01",
    nextInspection: "2024-10-01",
    defects: 0,
    fuelLevel: 100
  }
];