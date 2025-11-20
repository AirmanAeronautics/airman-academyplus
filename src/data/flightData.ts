export interface FlightDataPoint {
  time: number;
  altitude: number;
  speed: number;
  heading: number;
  verticalSpeed: number;
}

export interface FlightSession {
  sessionId: string;
  aircraft: string;
  student: string;
  instructor: string;
  date: string;
  blockOut: string;
  blockIn: string;
  takeoff: string;
  landing: string;
  route: string;
  flightTime: number;
  phases: {
    phase: string;
    startTime: number;
    endTime: number;
    score?: number;
  }[];
  exceedances: {
    type: string;
    time: number;
    value: number;
    limit: number;
    severity: "minor" | "major" | "critical";
  }[];
  telemetry: FlightDataPoint[];
  scores: {
    approach: number;
    landing: number;
    circuitSpacing: number;
    overall: number;
  };
  aiDebrief?: string;
}

export const mockFlightSession: FlightSession = {
  sessionId: "FLT-2024-08-15-001",
  aircraft: "N123AB",
  student: "Alex Johnson",
  instructor: "Capt. Wilson",
  date: "2024-08-15",
  blockOut: "08:00",
  blockIn: "10:00",
  takeoff: "08:15",
  landing: "09:45",
  route: "KJFK-Training Area A-KJFK",
  flightTime: 1.5,
  phases: [
    { phase: "Taxi Out", startTime: 0, endTime: 900 },
    { phase: "Takeoff", startTime: 900, endTime: 1200 },
    { phase: "Climb", startTime: 1200, endTime: 1800 },
    { phase: "Cruise", startTime: 1800, endTime: 3600 },
    { phase: "Pattern Work", startTime: 3600, endTime: 5100 },
    { phase: "Approach", startTime: 5100, endTime: 5400, score: 85 },
    { phase: "Landing", startTime: 5400, endTime: 5700, score: 92 },
    { phase: "Taxi In", startTime: 5700, endTime: 5940 }
  ],
  exceedances: [
    {
      type: "Bank Angle", 
      time: 2340,
      value: 52,
      limit: 45,
      severity: "minor"
    },
    {
      type: "Approach Speed",
      time: 5220,
      value: 78,
      limit: 70,
      severity: "minor"
    }
  ],
  telemetry: [
    { time: 0, altitude: 45, speed: 0, heading: 90, verticalSpeed: 0 },
    { time: 300, altitude: 45, speed: 25, heading: 90, verticalSpeed: 0 },
    { time: 600, altitude: 45, speed: 35, heading: 120, verticalSpeed: 0 },
    { time: 900, altitude: 45, speed: 55, heading: 120, verticalSpeed: 0 },
    { time: 1200, altitude: 150, speed: 65, heading: 120, verticalSpeed: 800 },
    { time: 1500, altitude: 450, speed: 70, heading: 120, verticalSpeed: 600 },
    { time: 1800, altitude: 1000, speed: 85, heading: 120, verticalSpeed: 0 },
    { time: 2100, altitude: 1000, speed: 90, heading: 180, verticalSpeed: 0 },
    { time: 2400, altitude: 1000, speed: 85, heading: 270, verticalSpeed: 0 },
    { time: 2700, altitude: 1000, speed: 90, heading: 360, verticalSpeed: 0 },
    { time: 3000, altitude: 1000, speed: 85, heading: 90, verticalSpeed: 0 },
    { time: 3300, altitude: 1000, speed: 90, heading: 120, verticalSpeed: 0 },
    { time: 3600, altitude: 1000, speed: 85, heading: 120, verticalSpeed: 0 },
    { time: 3900, altitude: 800, speed: 75, heading: 270, verticalSpeed: -200 },
    { time: 4200, altitude: 600, speed: 70, heading: 270, verticalSpeed: -150 },
    { time: 4500, altitude: 400, speed: 65, heading: 90, verticalSpeed: -100 },
    { time: 4800, altitude: 200, speed: 60, heading: 90, verticalSpeed: -150 },
    { time: 5100, altitude: 100, speed: 65, heading: 90, verticalSpeed: -50 },
    { time: 5400, altitude: 45, speed: 55, heading: 90, verticalSpeed: -100 },
    { time: 5700, altitude: 45, speed: 25, heading: 90, verticalSpeed: 0 },
    { time: 5940, altitude: 45, speed: 0, heading: 90, verticalSpeed: 0 }
  ],
  scores: {
    approach: 85,
    landing: 92,
    circuitSpacing: 88,
    overall: 88
  }
};