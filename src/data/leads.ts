export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: "website" | "referral" | "social" | "event" | "cold_call";
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  owner: string;
  value: number;
  goal: "ppl" | "cpl" | "atpl" | "ifr" | "other";
  budget: number;
  location: string;
  created: string;
  lastContact: string;
  aiScore: number;
  notes: string;
}

export const leads: Lead[] = [
  {
    id: "1",
    name: "James Mitchell",
    email: "j.mitchell@email.com",
    phone: "+44 7123 456789",
    source: "website",
    status: "new",
    owner: "Marketing Team",
    value: 12000,
    goal: "ppl",
    budget: 15000,
    location: "London",
    created: "2024-01-15T09:00:00Z",
    lastContact: "2024-01-15T09:00:00Z",
    aiScore: 87,
    notes: "Interested in weekend training schedule"
  },
  {
    id: "2",
    name: "Sarah Connor",
    email: "s.connor@email.com",
    phone: "+44 7234 567890",
    source: "referral",
    status: "contacted",
    owner: "Marketing Team",
    value: 25000,
    goal: "cpl",
    budget: 30000,
    location: "Manchester",
    created: "2024-01-14T14:30:00Z",
    lastContact: "2024-01-15T10:30:00Z",
    aiScore: 92,
    notes: "Former military pilot, very serious about commercial training"
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+44 7345 678901",
    source: "social",
    status: "qualified",
    owner: "Marketing Team",
    value: 8000,
    goal: "ppl",
    budget: 12000,
    location: "Birmingham",
    created: "2024-01-13T11:15:00Z",
    lastContact: "2024-01-14T16:00:00Z",
    aiScore: 78,
    notes: "Looking for flexible part-time training options"
  },
  {
    id: "4",
    name: "Emma Thompson",
    email: "e.thompson@email.com",
    phone: "+44 7456 789012",
    source: "event",
    status: "proposal",
    owner: "Marketing Team",
    value: 18000,
    goal: "ifr",
    budget: 20000,
    location: "Bristol",
    created: "2024-01-12T16:45:00Z",
    lastContact: "2024-01-15T09:15:00Z",
    aiScore: 85,
    notes: "Already has PPL, wants to add instrument rating"
  },
  {
    id: "5",
    name: "David Wilson",
    email: "d.wilson@email.com",
    phone: "+44 7567 890123",
    source: "referral",
    status: "negotiation",
    owner: "Marketing Team",
    value: 35000,
    goal: "atpl",
    budget: 40000,
    location: "Edinburgh",
    created: "2024-01-11T08:30:00Z",
    lastContact: "2024-01-15T11:00:00Z",
    aiScore: 95,
    notes: "Airline career goal, considering full-time integrated course"
  }
];

export interface Campaign {
  id: string;
  name: string;
  type: "email" | "whatsapp" | "social";
  status: "draft" | "active" | "paused" | "completed";
  startDate: string;
  endDate?: string;
  targetAudience: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
}

export const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Winter PPL Promotion",
    type: "email",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-02-29",
    targetAudience: "Newsletter subscribers",
    budget: 2000,
    spent: 1200,
    impressions: 15000,
    clicks: 450,
    conversions: 12,
    leads: 8
  },
  {
    id: "2",
    name: "CPL Career Change Campaign",
    type: "social",
    status: "active",
    startDate: "2024-01-10",
    endDate: "2024-03-10",
    targetAudience: "Professionals 25-40",
    budget: 5000,
    spent: 2800,
    impressions: 32000,
    clicks: 890,
    conversions: 25,
    leads: 18
  },
  {
    id: "3",
    name: "WhatsApp Re-engagement",
    type: "whatsapp",
    status: "completed",
    startDate: "2023-12-15",
    endDate: "2024-01-15",
    targetAudience: "Previous enquiries",
    budget: 500,
    spent: 500,
    impressions: 280,
    clicks: 95,
    conversions: 8,
    leads: 5
  }
];