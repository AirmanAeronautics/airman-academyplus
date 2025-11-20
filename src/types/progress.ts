export interface StudentMilestone {
  id: string;
  name: string;
  description: string;
  category: "solo" | "cross_country" | "night" | "instrument" | "checkride";
  requirements: string[];
  completed: boolean;
  dateCompleted?: string;
  hoursRequired: number;
  order: number;
}

export interface StudentProgress {
  studentId: string;
  milestones: StudentMilestone[];
  badges: Badge[];
  streaks: StreakRecord[];
  totalHours: number;
  soloHours: number;
  dualHours: number;
  crossCountryHours: number;
  nightHours: number;
  instrumentHours: number;
  overallScore: number;
  readinessLevel: "not_ready" | "approaching" | "ready" | "overdue";
  nextCheckride?: string;
  weakAreas: string[];
  strongAreas: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "skill" | "safety" | "milestone" | "special";
  dateEarned: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

export interface StreakRecord {
  type: "consistency" | "improvement" | "safety" | "attendance";
  currentStreak: number;
  bestStreak: number;
  lastActivity: string;
}

export interface FlightDebrief {
  sessionId: string;
  studentId: string;
  instructorId: string;
  date: string;
  aircraft: string;
  flightTime: number;
  maneuvers: ManeuverScore[];
  overallScore: number;
  aiSummary: string;
  improvementAreas: string[];
  strengths: string[];
  studyRecommendations: string[];
  nextSteps: string[];
  exceedances: Array<{
    type: string;
    severity: "minor" | "major" | "critical";
    description: string;
  }>;
}

export interface ManeuverScore {
  name: string;
  category: "takeoff" | "landing" | "navigation" | "maneuvers" | "communication" | "emergency";
  score: number;
  maxScore: number;
  notes: string;
  improvement?: string;
}

export const MILESTONES_PPL: StudentMilestone[] = [
  {
    id: "first_solo",
    name: "First Solo",
    description: "Complete first solo flight",
    category: "solo",
    requirements: ["Pass pre-solo written exam", "Demonstrate takeoffs and landings", "Radio communications"],
    completed: false,
    hoursRequired: 8,
    order: 1
  },
  {
    id: "solo_cross_country",
    name: "Solo Cross Country",
    description: "Complete first solo cross-country flight",
    category: "cross_country",
    requirements: ["First solo completed", "Navigation planning", "Weather briefing"],
    completed: false,
    hoursRequired: 15,
    order: 2
  },
  {
    id: "night_rating",
    name: "Night Rating",
    description: "Complete night flying requirements",
    category: "night",
    requirements: ["3 hours night dual", "10 night takeoffs and landings", "Night solo"],
    completed: false,
    hoursRequired: 20,
    order: 3
  },
  {
    id: "checkride_prep",
    name: "Checkride Ready",
    description: "Ready for practical exam",
    category: "checkride",
    requirements: ["40 hours total time", "All maneuvers proficient", "Mock checkride passed"],
    completed: false,
    hoursRequired: 40,
    order: 4
  }
];

export const AVAILABLE_BADGES: Badge[] = [
  {
    id: "crosswind_master",
    name: "Crosswind Master",
    description: "Successfully land in crosswinds >15 knots",
    icon: "🌪️",
    category: "skill",
    dateEarned: "",
    rarity: "uncommon"
  },
  {
    id: "perfect_approach",
    name: "Perfect Approach",
    description: "Execute 5 consecutive stabilized approaches",
    icon: "🎯",
    category: "skill",
    dateEarned: "",
    rarity: "rare"
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete 10 flights before 8 AM",
    icon: "🌅",
    category: "special",
    dateEarned: "",
    rarity: "common"
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Complete first night solo",
    icon: "🦉",
    category: "milestone",
    dateEarned: "",
    rarity: "uncommon"
  },
  {
    id: "safety_first",
    name: "Safety First",
    description: "25 flights without safety incidents",
    icon: "🛡️",
    category: "safety",
    dateEarned: "",
    rarity: "rare"
  },
  {
    id: "weather_wizard",
    name: "Weather Wizard",
    description: "Successfully navigate complex weather scenarios",
    icon: "⛈️",
    category: "skill",
    dateEarned: "",
    rarity: "legendary"
  }
];