export interface Invoice {
  id: string;
  student: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  items: {
    description: string;
    hours?: number;
    rate?: number;
    amount: number;
  }[];
  flightHours?: number;
  simHours?: number;
}

export const invoices: Invoice[] = [
  {
    id: "INV-001",
    student: "Alex Johnson",
    amount: 850.00,
    date: "2024-08-01",
    dueDate: "2024-08-15",
    status: "paid",
    items: [
      { description: "Flight Training - Dual", hours: 3.5, rate: 180, amount: 630.00 },
      { description: "Aircraft Rental - N123AB", hours: 3.5, rate: 65, amount: 227.50 },
      { description: "Landing Fees", amount: 25.00 }
    ],
    flightHours: 3.5
  },
  {
    id: "INV-002", 
    student: "Maria Garcia",
    amount: 1250.00,
    date: "2024-08-03",
    dueDate: "2024-08-17",
    status: "pending",
    items: [
      { description: "Flight Training - Solo", hours: 2.0, rate: 65, amount: 130.00 },
      { description: "Flight Training - Dual", hours: 4.0, rate: 180, amount: 720.00 },
      { description: "Aircraft Rental - N789EF", hours: 6.0, rate: 75, amount: 450.00 }
    ],
    flightHours: 6.0
  },
  {
    id: "INV-003",
    student: "James Wilson",
    amount: 2100.00,
    date: "2024-08-05",
    dueDate: "2024-08-19",
    status: "pending",
    items: [
      { description: "Flight Training - Dual MEP", hours: 5.0, rate: 220, amount: 1100.00 },
      { description: "Aircraft Rental - N789EF", hours: 5.0, rate: 120, amount: 600.00 },
      { description: "Cross Country Fees", amount: 150.00 },
      { description: "Chart Updates", amount: 35.00 }
    ],
    flightHours: 5.0
  },
  {
    id: "INV-004",
    student: "Emma Thompson", 
    amount: 425.00,
    date: "2024-08-02",
    dueDate: "2024-08-16",
    status: "overdue",
    items: [
      { description: "Flight Training - Dual", hours: 1.5, rate: 180, amount: 270.00 },
      { description: "Aircraft Rental - N654IJ", hours: 1.5, rate: 65, amount: 97.50 },
      { description: "Ground School", amount: 50.00 }
    ],
    flightHours: 1.5
  },
  {
    id: "INV-005",
    student: "Robert Chen",
    amount: 675.00,
    date: "2024-08-04",
    dueDate: "2024-08-18", 
    status: "paid",
    items: [
      { description: "Simulator Training", hours: 3.0, rate: 125, amount: 375.00 },
      { description: "Flight Training - Dual", hours: 2.0, rate: 180, amount: 360.00 },
      { description: "Materials Fee", amount: 40.00 }
    ],
    simHours: 3.0,
    flightHours: 2.0
  },
  {
    id: "INV-006",
    student: "Lisa Anderson",
    amount: 1520.00,
    date: "2024-08-06",
    dueDate: "2024-08-20",
    status: "pending",
    items: [
      { description: "Checkride Prep - Dual", hours: 4.0, rate: 180, amount: 720.00 },
      { description: "Aircraft Rental - N258OP", hours: 4.0, rate: 65, amount: 260.00 },
      { description: "Checkride Fee", amount: 500.00 },
      { description: "Exam Materials", amount: 40.00 }
    ],
    flightHours: 4.0
  },
  {
    id: "INV-007",
    student: "Michael Davis",
    amount: 320.00, 
    date: "2024-07-28",
    dueDate: "2024-08-11",
    status: "overdue",
    items: [
      { description: "Ground School", amount: 150.00 },
      { description: "Theory Materials", amount: 85.00 },
      { description: "Medical Renewal Consultation", amount: 85.00 }
    ]
  },
  {
    id: "INV-008",
    student: "Jennifer Lee",
    amount: 780.00,
    date: "2024-08-07",
    dueDate: "2024-08-21",
    status: "paid",
    items: [
      { description: "Advanced Training - Dual", hours: 2.5, rate: 200, amount: 500.00 },
      { description: "Aircraft Rental - N987KL", hours: 2.5, rate: 90, amount: 225.00 },
      { description: "Navigation Equipment", amount: 55.00 }
    ],
    flightHours: 2.5
  },
  {
    id: "INV-009",
    student: "Alex Johnson",
    amount: 950.00,
    date: "2024-08-08",
    dueDate: "2024-08-22",
    status: "pending",
    items: [
      { description: "Night Flying - Dual", hours: 3.0, rate: 200, amount: 600.00 },
      { description: "Aircraft Rental - N123AB", hours: 3.0, rate: 75, amount: 225.00 },
      { description: "Night Landing Fees", amount: 125.00 }
    ],
    flightHours: 3.0
  },
  {
    id: "INV-010",
    student: "Maria Garcia",
    amount: 1150.00,
    date: "2024-08-09",
    dueDate: "2024-08-23",
    status: "pending",
    items: [
      { description: "Commercial Maneuvers - Dual", hours: 4.0, rate: 220, amount: 880.00 },
      { description: "Aircraft Rental - N789EF", hours: 4.0, rate: 75, amount: 300.00 }
    ],
    flightHours: 4.0
  },
  {
    id: "INV-011", 
    student: "James Wilson",
    amount: 450.00,
    date: "2024-08-10",
    dueDate: "2024-08-24",
    status: "pending",
    items: [
      { description: "Simulator - IFR", hours: 2.0, rate: 150, amount: 300.00 },
      { description: "Ground Instruction", hours: 2.0, rate: 75, amount: 150.00 }
    ],
    simHours: 2.0
  },
  {
    id: "INV-012",
    student: "Emma Thompson",
    amount: 625.00,
    date: "2024-08-11",
    dueDate: "2024-08-25",
    status: "pending",
    items: [
      { description: "Solo Practice", hours: 2.5, rate: 65, amount: 162.50 },
      { description: "Flight Training - Dual", hours: 2.0, rate: 180, amount: 360.00 },
      { description: "Progress Check", amount: 102.50 }
    ],
    flightHours: 4.5
  },
  {
    id: "INV-013",
    student: "Robert Chen",
    amount: 875.00,
    date: "2024-08-12",
    dueDate: "2024-08-26",
    status: "pending",
    items: [
      { description: "Advanced Simulator", hours: 4.0, rate: 175, amount: 700.00 },
      { description: "Instructor Briefing", hours: 1.0, rate: 100, amount: 100.00 },
      { description: "Equipment Usage", amount: 75.00 }
    ],
    simHours: 4.0
  },
  {
    id: "INV-014",
    student: "Lisa Anderson",
    amount: 1200.00,
    date: "2024-08-13",
    dueDate: "2024-08-27",
    status: "pending",
    items: [
      { description: "Final Check Flight", hours: 3.0, rate: 250, amount: 750.00 },
      { description: "Aircraft Rental - N258OP", hours: 3.0, rate: 65, amount: 195.00 },
      { description: "Examiner Fee", amount: 255.00 }
    ],
    flightHours: 3.0
  },
  {
    id: "INV-015",
    student: "Michael Davis",
    amount: 380.00,
    date: "2024-08-14",
    dueDate: "2024-08-28",
    status: "overdue",
    items: [
      { description: "Theory Review", amount: 200.00 },
      { description: "Written Exam Fee", amount: 180.00 }
    ]
  }
];