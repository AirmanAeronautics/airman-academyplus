// Seed data for AI Roster System
// To be inserted into the database for demo/testing purposes

export const lessonCatalogSeeds = [
  {
    name: "First Solo",
    program: "PPL",
    stage: "Phase-2",
    duration_min: 60,
    requirements: {
      weather_minima: {
        ceiling_ft: 3000,
        vis_km: 8,
        wind_max_kts: 15,
        xwind_max_kts: 8,
        day_only: true
      },
      aircraft_req: ["Dual-controls"],
      instructor_req: [],
      airspace_req: ["Class G", "Training area"]
    },
    description: "Student's first solo flight in the pattern"
  },
  {
    name: "Stalls & Spins",
    program: "PPL",
    stage: "Phase-2",
    duration_min: 90,
    requirements: {
      weather_minima: {
        ceiling_ft: 4000,
        vis_km: 10,
        wind_max_kts: 20,
        xwind_max_kts: 12,
        day_only: true
      },
      aircraft_req: ["Spins", "Dual-controls"],
      instructor_req: ["Spin endorsement"],
      airspace_req: ["Class G", "Practice area"]
    },
    description: "Stall recovery and spin training"
  },
  {
    name: "Night Flying",
    program: "PPL",
    stage: "Phase-3",
    duration_min: 120,
    requirements: {
      weather_minima: {
        ceiling_ft: 3000,
        vis_km: 8,
        wind_max_kts: 15,
        xwind_max_kts: 10,
        day_only: false
      },
      aircraft_req: ["Night", "Dual-controls"],
      instructor_req: ["Night rating"],
      airspace_req: ["Class G", "Class E"]
    },
    description: "Night operations and navigation"
  },
  {
    name: "Cross Country",
    program: "PPL",
    stage: "Phase-3",
    duration_min: 180,
    requirements: {
      weather_minima: {
        ceiling_ft: 3000,
        vis_km: 8,
        wind_max_kts: 25,
        xwind_max_kts: 12,
        day_only: false
      },
      aircraft_req: ["Dual-controls"],
      instructor_req: [],
      airspace_req: ["Class G", "Class E", "Class D"]
    },
    description: "Long-distance navigation with multiple stops"
  },
  {
    name: "IFR Approaches",
    program: "IR",
    stage: "Phase-1",
    duration_min: 120,
    requirements: {
      weather_minima: {
        ceiling_ft: 1000,
        vis_km: 3,
        wind_max_kts: 25,
        xwind_max_kts: 15,
        day_only: false
      },
      aircraft_req: ["IFR", "Glass", "Dual-controls"],
      instructor_req: ["CFII"],
      airspace_req: ["Class E", "Class D"]
    },
    description: "Precision and non-precision approaches"
  },
  {
    name: "Emergency Procedures",
    program: "PPL",
    stage: "Phase-2",
    duration_min: 90,
    requirements: {
      weather_minima: {
        ceiling_ft: 3000,
        vis_km: 8,
        wind_max_kts: 20,
        xwind_max_kts: 10,
        day_only: true
      },
      aircraft_req: ["Dual-controls"],
      instructor_req: [],
      airspace_req: ["Practice area"]
    },
    description: "Engine failures, forced landings, emergency procedures"
  },
  {
    name: "Complex Aircraft Checkout",
    program: "CPL",
    stage: "Phase-1",
    duration_min: 120,
    requirements: {
      weather_minima: {
        ceiling_ft: 3000,
        vis_km: 8,
        wind_max_kts: 20,
        xwind_max_kts: 12,
        day_only: false
      },
      aircraft_req: ["Complex", "High-performance", "Dual-controls"],
      instructor_req: ["Complex endorsement"],
      airspace_req: ["Class G", "Class E"]
    },
    description: "Checkout on complex aircraft with retractable gear"
  },
  {
    name: "Tailwheel Transition",
    program: "PPL",
    stage: "Endorsement",
    duration_min: 90,
    requirements: {
      weather_minima: {
        ceiling_ft: 3000,
        vis_km: 8,
        wind_max_kts: 15,
        xwind_max_kts: 8,
        day_only: true
      },
      aircraft_req: ["Tailwheel", "Dual-controls"],
      instructor_req: ["Tailwheel endorsement"],
      airspace_req: ["Class G"]
    },
    description: "Tailwheel aircraft operations and ground handling"
  },
  {
    name: "Checkride Prep",
    program: "PPL",
    stage: "Phase-4",
    duration_min: 180,
    requirements: {
      weather_minima: {
        ceiling_ft: 3000,
        vis_km: 8,
        wind_max_kts: 20,
        xwind_max_kts: 12,
        day_only: false
      },
      aircraft_req: ["Dual-controls"],
      instructor_req: [],
      airspace_req: ["Class G", "Class E", "Class D"]
    },
    description: "Final preparation for practical test"
  },
  {
    name: "Instrument Holds & Tracking",
    program: "IR",
    stage: "Phase-2",
    duration_min: 120,
    requirements: {
      weather_minima: {
        ceiling_ft: 1000,
        vis_km: 3,
        wind_max_kts: 25,
        xwind_max_kts: 15,
        day_only: false
      },
      aircraft_req: ["IFR", "Glass", "Dual-controls"],
      instructor_req: ["CFII"],
      airspace_req: ["Class E"]
    },
    description: "Holding patterns and VOR/GPS tracking"
  }
];

export const aircraftCapabilitySeeds = [
  // Capabilities will be assigned based on aircraft type
  // This is a mapping template
  {
    capabilities: {
      "Cessna 172": ["IFR", "Night", "Dual-controls", "Glass"],
      "DA40": ["IFR", "Night", "Glass", "Dual-controls"],
      "PA-28": ["Night", "Dual-controls"],
      "Citabria": ["Spins", "Tailwheel", "Dual-controls"],
      "PA-44": ["IFR", "Night", "Complex", "High-performance", "Glass", "Dual-controls"],
      "Cessna 182": ["IFR", "Night", "Complex", "High-performance", "Dual-controls"]
    }
  }
];

export const constraintPolicySeeds = [
  {
    policy_type: "SchoolDuty",
    policy_json: {
      max_sorties_per_day_per_student: 2,
      min_turnaround_minutes: 30,
      max_instructor_block_hours_per_day: 6,
      min_rest_between_blocks_minutes: 45,
      night_training_allowed: true,
      curfew: {
        start_local: "22:00",
        end_local: "05:00"
      }
    },
    active: true
  },
  {
    policy_type: "LessonMinima",
    policy_json: {
      enforce_weather_minima: true,
      enforce_aircraft_requirements: true,
      enforce_instructor_requirements: true,
      allow_weather_waiver: false,
      min_fuel_reserve_minutes: 45
    },
    active: true
  },
  {
    policy_type: "AircraftPerformance",
    policy_json: {
      min_runway_length_ft: 2500,
      density_altitude_max_ft: 8000,
      require_performance_calc: true,
      weight_balance_required: true
    },
    active: true
  }
];
