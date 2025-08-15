export interface ComplianceItem {
  id: string;
  type: "medical" | "license" | "rating" | "recency" | "training";
  person: string;
  description: string;
  expiryDate: string;
  status: "current" | "expiring" | "expired";
  daysUntilExpiry: number;
  requirements?: string[];
}

export const complianceItems: ComplianceItem[] = [
  {
    id: "1",
    type: "medical",
    person: "Capt. Wilson",
    description: "Class 1 Medical Certificate",
    expiryDate: "2024-08-25",
    status: "expiring",
    daysUntilExpiry: 10,
    requirements: ["AME Examination", "ECG", "Vision Test"]
  },
  {
    id: "2",
    type: "license", 
    person: "Capt. Smith",
    description: "CPL License Renewal",
    expiryDate: "2024-09-15",
    status: "expiring",
    daysUntilExpiry: 31,
    requirements: ["Flight Review", "Medical Currency"]
  },
  {
    id: "3",
    type: "recency",
    person: "Capt. Johnson", 
    description: "IFR Currency (6 approaches)",
    expiryDate: "2024-08-20",
    status: "expiring",
    daysUntilExpiry: 5,
    requirements: ["6 Instrument Approaches", "Holding Procedures", "Intercepting Courses"]
  },
  {
    id: "4",
    type: "training",
    person: "Michael Davis",
    description: "Student Medical Expired",
    expiryDate: "2024-07-30",
    status: "expired", 
    daysUntilExpiry: -16,
    requirements: ["AME Examination", "Student Medical Certificate"]
  },
  {
    id: "5",
    type: "medical",
    person: "Alex Johnson",
    description: "Student Medical Certificate",
    expiryDate: "2024-09-01",
    status: "expiring",
    daysUntilExpiry: 17,
    requirements: ["AME Examination"]
  },
  {
    id: "6",
    type: "license",
    person: "Robert Chen", 
    description: "PPL Theory Exam",
    expiryDate: "2024-08-30",
    status: "expiring", 
    daysUntilExpiry: 15,
    requirements: ["Written Examination", "Theory Review"]
  }
];