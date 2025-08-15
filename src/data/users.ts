export interface User {
  id: string;
  name: string;
  role: "ops_manager" | "flight_instructor" | "maintenance_officer" | "compliance_officer" | "accounts_officer" | "student";
  email: string;
  avatar?: string;
  department: string;
}

export const users: User[] = [
  {
    id: "1",
    name: "John Henderson",
    role: "ops_manager",
    email: "j.henderson@airman.academy",
    department: "Operations"
  },
  {
    id: "2", 
    name: "Sarah Wilson",
    role: "flight_instructor",
    email: "s.wilson@airman.academy",
    department: "Training"
  },
  {
    id: "3",
    name: "Mike Chen",
    role: "maintenance_officer", 
    email: "m.chen@airman.academy",
    department: "Maintenance"
  },
  {
    id: "4",
    name: "Emma Davis",
    role: "compliance_officer",
    email: "e.davis@airman.academy", 
    department: "Compliance"
  },
  {
    id: "5",
    name: "David Brown",
    role: "accounts_officer",
    email: "d.brown@airman.academy",
    department: "Finance"
  },
  {
    id: "6",
    name: "Alex Johnson",
    role: "student",
    email: "a.johnson@student.airman.academy",
    department: "Training"
  }
];

export const currentUser = users[0]; // Default to Ops Manager