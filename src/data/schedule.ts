export interface FlightSession {
  id: string;
  time: string;
  timeStart: string;
  timeEnd: string;
  student: string;
  instructor: string;
  aircraft: string;
  type: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  location?: string;
  notes?: string;
  conflicts?: string[];
}

export const todaysFlights: FlightSession[] = [
  {
    id: "1",
    time: "08:00 - 10:00",
    timeStart: "08:00",
    timeEnd: "10:00", 
    student: "Alex Johnson",
    instructor: "Capt. Wilson",
    aircraft: "N123AB",
    type: "Solo Flight",
    status: "completed",
    location: "Training Area A"
  },
  {
    id: "2",
    time: "08:30 - 10:30", 
    timeStart: "08:30",
    timeEnd: "10:30",
    student: "Maria Garcia",
    instructor: "Capt. Smith",
    aircraft: "N789EF",
    type: "IFR Training",
    status: "completed",
    location: "Training Area B"
  },
  {
    id: "3",
    time: "09:00 - 11:00",
    timeStart: "09:00",
    timeEnd: "11:00",
    student: "James Wilson", 
    instructor: "Capt. Johnson",
    aircraft: "N456CD",
    type: "Cross Country",
    status: "in-progress",
    location: "En Route KJFK"
  },
  {
    id: "4",
    time: "10:30 - 12:30",
    timeStart: "10:30", 
    timeEnd: "12:30",
    student: "Emma Thompson",
    instructor: "Capt. Wilson",
    aircraft: "N654IJ",
    type: "Pattern Work",
    status: "scheduled",
    location: "Pattern"
  },
  {
    id: "5",
    time: "11:00 - 13:00",
    timeStart: "11:00",
    timeEnd: "13:00",
    student: "Robert Chen",
    instructor: "Capt. Smith", 
    aircraft: "N147MN",
    type: "Navigation",
    status: "scheduled",
    location: "Training Area A"
  },
  {
    id: "6",
    time: "12:00 - 14:00",
    timeStart: "12:00",
    timeEnd: "14:00",
    student: "Lisa Anderson",
    instructor: "Capt. Johnson",
    aircraft: "N258OP",
    type: "Checkride Prep",
    status: "scheduled",
    location: "Training Area B"
  },
  {
    id: "7",
    time: "13:30 - 15:30",
    timeStart: "13:30",
    timeEnd: "15:30", 
    student: "Michael Davis",
    instructor: "Capt. Wilson",
    aircraft: "N321GH",
    type: "Instrument Training",
    status: "cancelled",
    location: "Training Area A",
    conflicts: ["Aircraft Grounded"],
    notes: "Aircraft N321GH has unresolved defects"
  },
  {
    id: "8",
    time: "14:00 - 16:00",
    timeStart: "14:00",
    timeEnd: "16:00",
    student: "Jennifer Lee",
    instructor: "Capt. Smith", 
    aircraft: "N369QR",
    type: "Simulator",
    status: "scheduled",
    location: "Sim Center"
  },
  {
    id: "9",
    time: "15:00 - 17:00",
    timeStart: "15:00",
    timeEnd: "17:00",
    student: "Alex Johnson",
    instructor: "Capt. Johnson",
    aircraft: "N123AB",
    type: "Night Prep",
    status: "scheduled", 
    location: "Training Area B"
  },
  {
    id: "10",
    time: "16:30 - 18:30",
    timeStart: "16:30",
    timeEnd: "18:30",
    student: "Maria Garcia",
    instructor: "Capt. Wilson",
    aircraft: "N789EF",
    type: "Commercial Maneuvers",
    status: "scheduled",
    location: "Training Area A"
  },
  {
    id: "11",
    time: "17:00 - 19:00", 
    timeStart: "17:00",
    timeEnd: "19:00",
    student: "James Wilson",
    instructor: "Capt. Smith",
    aircraft: "N654IJ",
    type: "Night Flying",
    status: "scheduled",
    location: "Pattern"
  },
  {
    id: "12",
    time: "18:00 - 20:00",
    timeStart: "18:00",
    timeEnd: "20:00",
    student: "Emma Thompson",
    instructor: "Capt. Johnson", 
    aircraft: "N147MN",
    type: "Solo Practice",
    status: "scheduled",
    location: "Training Area B"
  }
];

export const weeklyFlights = todaysFlights; // Simplified for demo