export interface SupportTicket {
  id: string;
  customer: string;
  email: string;
  channel: "email" | "chat" | "whatsapp";
  subject: string;
  status: "new" | "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  created: string;
  lastUpdate: string;
  messages: SupportMessage[];
  aiSuggestion?: string;
  linkedRecord?: {
    type: "lead" | "student";
    id: string;
    name: string;
  };
}

export interface SupportMessage {
  id: string;
  from: string;
  type: "customer" | "agent";
  content: string;
  timestamp: string;
  attachments?: string[];
}

export const supportTickets: SupportTicket[] = [
  {
    id: "1",
    customer: "James Mitchell",
    email: "j.mitchell@email.com",
    channel: "email",
    subject: "Training Schedule Inquiry",
    status: "new",
    priority: "medium",
    created: "2024-01-15T14:30:00Z",
    lastUpdate: "2024-01-15T14:30:00Z",
    messages: [
      {
        id: "1",
        from: "j.mitchell@email.com",
        type: "customer",
        content: "Hi, I'm interested in PPL training but can only do weekends. Do you have weekend slots available?",
        timestamp: "2024-01-15T14:30:00Z"
      }
    ],
    aiSuggestion: "Based on the inquiry about weekend availability, suggest our Weekend Warrior PPL package and mention our flexible scheduling options. Customer appears to be a potential lead.",
    linkedRecord: {
      type: "lead",
      id: "1",
      name: "James Mitchell"
    }
  },
  {
    id: "2",
    customer: "Sarah Wilson",
    email: "s.wilson@student.airman.academy",
    channel: "chat",
    subject: "Flight Booking Issue",
    status: "open",
    priority: "high",
    assignedTo: "Support Team",
    created: "2024-01-15T11:45:00Z",
    lastUpdate: "2024-01-15T13:20:00Z",
    messages: [
      {
        id: "1",
        from: "s.wilson@student.airman.academy",
        type: "customer",
        content: "I can't see my next flight booking in the system. It was supposed to be tomorrow at 10 AM.",
        timestamp: "2024-01-15T11:45:00Z"
      },
      {
        id: "2",
        from: "support@airman.academy",
        type: "agent",
        content: "Let me check your booking details. Can you confirm your student ID?",
        timestamp: "2024-01-15T12:00:00Z"
      },
      {
        id: "3",
        from: "s.wilson@student.airman.academy",
        type: "customer",
        content: "My student ID is STU001. The booking was with instructor James Miller.",
        timestamp: "2024-01-15T13:20:00Z"
      }
    ],
    aiSuggestion: "Check the scheduling system for student STU001. The booking might have been moved due to weather or aircraft maintenance. Suggest rebooking if necessary.",
    linkedRecord: {
      type: "student",
      id: "1",
      name: "Sarah Wilson"
    }
  },
  {
    id: "3",
    customer: "Emma Thompson",
    email: "e.thompson@email.com",
    channel: "whatsapp",
    subject: "Course Information Request",
    status: "pending",
    priority: "low",
    assignedTo: "Marketing Team",
    created: "2024-01-14T16:20:00Z",
    lastUpdate: "2024-01-15T09:30:00Z",
    messages: [
      {
        id: "1",
        from: "e.thompson@email.com",
        type: "customer",
        content: "Hi! I already have a PPL and want to add an instrument rating. What's the duration and cost?",
        timestamp: "2024-01-14T16:20:00Z"
      },
      {
        id: "2",
        from: "support@airman.academy",
        type: "agent",
        content: "Hello Emma! Great to hear you're interested in our IR course. I'll send you our detailed course information and pricing. The typical duration is 15-20 hours depending on your experience.",
        timestamp: "2024-01-15T09:30:00Z"
      }
    ],
    aiSuggestion: "Follow up with detailed IR course brochure and pricing. Customer already has PPL so focus on the benefits of instrument rating for weather flying and career progression.",
    linkedRecord: {
      type: "lead",
      id: "4",
      name: "Emma Thompson"
    }
  }
];