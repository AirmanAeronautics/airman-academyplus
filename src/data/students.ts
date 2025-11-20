export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  instructor: string;
  progress: number;
  hoursFlown: number;
  totalHours: number;
  status: "active" | "on_hold" | "graduated" | "dropped";
  nextLesson: string;
  avatar?: string;
  joinDate: string;
  phone: string;
  address: string;
  medicalExpiry: string;
  licenseNumber?: string;
}

export const students: Student[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "a.johnson@student.airman.academy",
    course: "PPL",
    instructor: "Capt. Wilson",
    progress: 75,
    hoursFlown: 35,
    totalHours: 45,
    status: "active",
    nextLesson: "Cross Country Navigation",
    joinDate: "2024-06-15",
    phone: "+1 555-0123",
    address: "123 Aviation St, Sky City, SC 12345",
    medicalExpiry: "2025-06-14"
  },
  {
    id: "2", 
    name: "Maria Garcia",
    email: "m.garcia@student.airman.academy",
    course: "CPL",
    instructor: "Capt. Smith",
    progress: 45,
    hoursFlown: 120,
    totalHours: 150,
    status: "active",
    nextLesson: "Instrument Approach",
    joinDate: "2024-03-20",
    phone: "+1 555-0124",
    address: "456 Pilot Ave, Air Town, AT 67890",
    medicalExpiry: "2025-03-19"
  },
  {
    id: "3",
    name: "James Wilson",
    email: "j.wilson@student.airman.academy", 
    course: "ATPL",
    instructor: "Capt. Johnson",
    progress: 90,
    hoursFlown: 180,
    totalHours: 200,
    status: "active",
    nextLesson: "Checkride Prep",
    joinDate: "2024-01-10",
    phone: "+1 555-0125",
    address: "789 Flight Blvd, Aviator City, AC 13579",
    medicalExpiry: "2025-01-09"
  },
  {
    id: "4",
    name: "Emma Thompson",
    email: "e.thompson@student.airman.academy",
    course: "PPL",
    instructor: "Capt. Wilson", 
    progress: 25,
    hoursFlown: 12,
    totalHours: 15,
    status: "active",
    nextLesson: "Solo Flight Prep",
    joinDate: "2024-07-01",
    phone: "+1 555-0126", 
    address: "321 Runway Dr, Sky Harbor, SH 24680",
    medicalExpiry: "2025-06-30"
  },
  {
    id: "5",
    name: "Robert Chen",
    email: "r.chen@student.airman.academy",
    course: "CPL",
    instructor: "Capt. Smith",
    progress: 65,
    hoursFlown: 95,
    totalHours: 120,
    status: "active", 
    nextLesson: "Night Flying",
    joinDate: "2024-04-15",
    phone: "+1 555-0127",
    address: "654 Propeller St, Flight City, FC 97531",
    medicalExpiry: "2025-04-14"
  },
  {
    id: "6",
    name: "Lisa Anderson", 
    email: "l.anderson@student.airman.academy",
    course: "PPL",
    instructor: "Capt. Johnson",
    progress: 95,
    hoursFlown: 42,
    totalHours: 45,
    status: "active",
    nextLesson: "Final Checkride",
    joinDate: "2024-05-20",
    phone: "+1 555-0128",
    address: "987 Hangar Rd, Airport City, AC 86420",
    medicalExpiry: "2025-05-19"
  },
  {
    id: "7",
    name: "Michael Davis",
    email: "m.davis@student.airman.academy",
    course: "ATPL", 
    instructor: "Capt. Wilson",
    progress: 30,
    hoursFlown: 60,
    totalHours: 80,
    status: "on_hold",
    nextLesson: "Medical Renewal Required",
    joinDate: "2024-02-28",
    phone: "+1 555-0129",
    address: "147 Terminal Way, Skyport, SP 75319",
    medicalExpiry: "2024-12-27"
  },
  {
    id: "8",
    name: "Jennifer Lee",
    email: "j.lee@student.airman.academy", 
    course: "CPL",
    instructor: "Capt. Smith",
    progress: 100,
    hoursFlown: 200,
    totalHours: 250,
    status: "graduated",
    nextLesson: "Course Complete",
    joinDate: "2023-09-15",
    phone: "+1 555-0130",
    address: "258 Control Tower Ln, Avionics, AV 95173",
    medicalExpiry: "2025-09-14"
  }
];