export const demoFlightSchools = [
  // FAA (United States)
  {
    id: "demo-faa-1",
    name: "American Aviation Academy",
    aviation_region: "FAA",
    country: "United States",
    location: "Phoenix, Arizona",
    aircraft_fleet: ["Cessna 152", "Cessna 172", "Piper Cherokee"],
    students: 150,
    instructors: 25
  },
  {
    id: "demo-faa-2", 
    name: "Pacific Flight Training Center",
    aviation_region: "FAA",
    country: "United States",
    location: "San Diego, California",
    aircraft_fleet: ["Cessna 172", "Piper Archer", "Cirrus SR20"],
    students: 200,
    instructors: 30
  },
  {
    id: "demo-faa-3",
    name: "East Coast Aviation Institute",
    aviation_region: "FAA",
    country: "United States", 
    location: "Miami, Florida",
    aircraft_fleet: ["Cessna 152", "Cessna 172", "Beechcraft Bonanza"],
    students: 120,
    instructors: 20
  },

  // EASA (Europe)
  {
    id: "demo-easa-1",
    name: "European Flight Academy",
    aviation_region: "EASA",
    country: "Germany",
    location: "Frankfurt, Germany",
    aircraft_fleet: ["Aquila AT01", "Diamond DA40", "Cessna 172"],
    students: 180,
    instructors: 28
  },
  {
    id: "demo-easa-2",
    name: "Nordic Aviation School",
    aviation_region: "EASA",
    country: "Sweden",
    location: "Stockholm, Sweden",
    aircraft_fleet: ["Tecnam P2008", "Diamond DA40", "Piper Archer"],
    students: 95,
    instructors: 18
  },
  {
    id: "demo-easa-3",
    name: "Mediterranean Flight Training",
    aviation_region: "EASA",
    country: "Spain",
    location: "Barcelona, Spain",
    aircraft_fleet: ["Cessna 152", "Tecnam P2008", "Diamond DA42"],
    students: 140,
    instructors: 22
  },

  // UK CAA (United Kingdom)
  {
    id: "demo-ukcaa-1",
    name: "British Airways Flight Training",
    aviation_region: "UK CAA",
    country: "United Kingdom",
    location: "London, England",
    aircraft_fleet: ["Piper Archer", "Cessna 172", "Diamond DA40"],
    students: 160,
    instructors: 24
  },
  {
    id: "demo-ukcaa-2",
    name: "Scottish Aviation Academy",
    aviation_region: "UK CAA",
    country: "United Kingdom",
    location: "Edinburgh, Scotland",
    aircraft_fleet: ["Cessna 152", "Piper Cherokee", "Grob G115"],
    students: 85,
    instructors: 16
  },

  // DGCA India
  {
    id: "demo-dgca-1",
    name: "Delhi Flying Club",
    aviation_region: "DGCA India",
    country: "India",
    location: "New Delhi, India",
    aircraft_fleet: ["Cessna 152", "Cessna 172", "Piper Cherokee"],
    students: 220,
    instructors: 35
  },
  {
    id: "demo-dgca-2",
    name: "Mumbai Aviation Institute",
    aviation_region: "DGCA India",
    country: "India",
    location: "Mumbai, India", 
    aircraft_fleet: ["Tecnam P2008", "Cessna 172", "Diamond DA40"],
    students: 190,
    instructors: 32
  },
  {
    id: "demo-dgca-3",
    name: "Bangalore Flight Academy",
    aviation_region: "DGCA India",
    country: "India",
    location: "Bangalore, India",
    aircraft_fleet: ["Cessna 152", "Piper Archer", "Aquila AT01"],
    students: 170,
    instructors: 28
  }
];

export const demoStudents = [
  {
    id: "demo-student-1",
    name: "Alex Johnson",
    email: "alex.johnson@student.demo",
    course: "Private Pilot License",
    progress: 65,
    hours: { total: 35, solo: 8, dual: 27 },
    nextLesson: "Cross Country Navigation",
    instructor: "Sarah Wilson"
  },
  {
    id: "demo-student-2", 
    name: "Maria Garcia",
    email: "maria.garcia@student.demo",
    course: "Commercial Pilot License",
    progress: 45,
    hours: { total: 120, solo: 45, dual: 75 },
    nextLesson: "Instrument Approach Procedures",
    instructor: "Sarah Wilson"
  },
  {
    id: "demo-student-3",
    name: "David Chen",
    email: "david.chen@student.demo", 
    course: "Instrument Rating",
    progress: 80,
    hours: { total: 55, solo: 15, dual: 40 },
    nextLesson: "IFR Cross Country",
    instructor: "Sarah Wilson"
  }
];

export const demoAircraft = [
  {
    id: "demo-aircraft-1",
    registration: "N123AB",
    type: "Cessna 172",
    status: "Available",
    nextMaintenance: "2024-02-15",
    totalHours: 5420,
    location: "Hangar A"
  },
  {
    id: "demo-aircraft-2",
    registration: "N456CD", 
    type: "Piper Cherokee",
    status: "In Maintenance",
    nextMaintenance: "2024-01-20",
    totalHours: 3850,
    location: "Maintenance Bay"
  },
  {
    id: "demo-aircraft-3",
    registration: "N789EF",
    type: "Cessna 152",
    status: "Available",
    nextMaintenance: "2024-03-01",
    totalHours: 4200,
    location: "Ramp"
  }
];

export const demoNotifications = [
  {
    id: "demo-notif-1",
    title: "Lesson Scheduled",
    message: "Your next flight lesson is scheduled for tomorrow at 10:00 AM",
    type: "info",
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: "demo-notif-2",
    title: "Weather Alert",
    message: "Strong winds forecasted for this afternoon. Check with your instructor before flying.",
    type: "warning", 
    read: false,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    id: "demo-notif-3",
    title: "Progress Update",
    message: "Congratulations! You've completed 50% of your training program.",
    type: "success",
    read: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  }
];

export const getRoleFeatures = (role: string) => {
  const features = {
    student: [
      "View personal progress and milestones",
      "Schedule and manage flight lessons", 
      "Access training materials and resources",
      "Track flight hours and achievements",
      "Communicate with instructors",
      "View weather and safety alerts"
    ],
    super_admin: [
      "Complete system administration",
      "Manage all users and permissions",
      "Access all reports and analytics",
      "Configure system settings",
      "Oversee compliance and safety",
      "Full financial and operational control"
    ],
    ops_manager: [
      "Flight operations management",
      "Aircraft scheduling and dispatch",
      "Safety oversight and reporting",
      "Weather monitoring and alerts",
      "Operational analytics and KPIs",
      "Coordination with maintenance and training"
    ],
    maintenance_officer: [
      "Aircraft maintenance scheduling",
      "Safety inspections and compliance",
      "Parts inventory management", 
      "Maintenance records and logs",
      "Airworthiness monitoring",
      "Technical bulletins and updates"
    ],
    compliance_officer: [
      "Regulatory compliance monitoring",
      "Audit preparation and management",
      "Safety management system oversight",
      "Risk assessment and mitigation",
      "Documentation and record keeping",
      "Training standards enforcement"
    ],
    accounts_officer: [
      "Financial management and reporting",
      "Student billing and payments",
      "Budget planning and tracking",
      "Invoice management",
      "Financial analytics and insights",
      "Payment processing and reconciliation"
    ],
    marketing_crm: [
      "Lead generation and management",
      "Customer relationship management", 
      "Marketing campaign creation",
      "Student recruitment analytics",
      "Social media and communications",
      "Event planning and coordination"
    ],
    support: [
      "Customer support and helpdesk",
      "User assistance and training",
      "Technical issue resolution",
      "Documentation and knowledge base",
      "User feedback collection",
      "System support and maintenance"
    ]
  };
  
  return features[role as keyof typeof features] || [];
};