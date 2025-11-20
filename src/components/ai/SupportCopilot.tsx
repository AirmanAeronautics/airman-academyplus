// AIRMAN Academy+ Support AI Copilot
// Conversational assistant for common student/parent/admin queries

import { useState } from "react"
import { Bot, MessageSquare, Send, User, Lightbulb, ExternalLink, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { logAIAction } from "@/lib/eventBus"
import type { UserRole } from "@/types/auth"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: string
  suggestions?: string[]
  actions?: Array<{
    label: string
    type: "escalate" | "schedule" | "link" | "create_ticket"
    data?: any
  }>
}

interface SupportCopilotProps {
  currentUserRole?: UserRole
}

export function SupportCopilot({ currentUserRole }: SupportCopilotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hello! I'm your AI Support Copilot. I can help with common queries about training programs, scheduling, billing, and more. What can I assist you with today?",
      timestamp: new Date().toISOString(),
      suggestions: [
        "What are the PPL training requirements?",
        "How do I reschedule a flight lesson?", 
        "What payment methods do you accept?",
        "Can I train on weekends?"
      ]
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const knowledgeBase = {
    training: {
      ppl: "The Private Pilot License (PPL) requires minimum 45 hours flight time including 25 hours dual instruction and 10 hours solo flight. Theory exam and practical test required. Duration: 6-12 months.",
      cpl: "Commercial Pilot License (CPL) requires 200 hours total flight time, including specific hour requirements for cross-country, night, and instrument flying. Medical Class 1 required.",
      atpl: "Airline Transport Pilot License (ATPL) requires 1500 hours total flight time. Our integrated ATPL program combines theory and practical training for optimal career progression.",
      ir: "Instrument Rating allows flight in cloud and reduced visibility. Requires PPL as prerequisite, specific training hours, and practical test."
    },
    scheduling: {
      reschedule: "Lessons can be rescheduled up to 24 hours in advance via Captain app or by calling our operations team. Weather cancellations are handled automatically.",
      weekend: "Weekend training is available Saturday and Sunday. Popular slots book quickly - we recommend booking 2-3 weeks in advance.",
      instructor: "You can request specific instructors but availability depends on their schedule and your course requirements."
    },
    billing: {
      payment: "We accept bank transfers, credit/debit cards, and training loans. Payment plans available for full courses.",
      costs: "PPL: £8,000-12,000, CPL: £40,000-60,000, ATPL: £80,000-120,000. Prices include aircraft, instructor, and fuel.",
      invoicing: "Invoices sent monthly for pay-as-you-go or as per payment plan terms. Available via student portal."
    },
    policies: {
      medical: "Class 2 medical required for PPL, Class 1 for CPL/ATPL. Must be renewed regularly. We can recommend approved aviation medical examiners.",
      weather: "Flights cancelled if conditions below minima. No charge for weather cancellations. Rescheduling automatic via Captain system.",
      progress: "Progress tracked in Captain app. Regular progress reviews with instructors. Average student completes PPL in 6-9 months."
    }
  }

  const generateResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase()
    let response = ""
    let suggestions: string[] = []
    let actions: Message["actions"] = []

    // Intent recognition and response generation
    if (input.includes("ppl") || input.includes("private pilot")) {
      response = knowledgeBase.training.ppl
      suggestions = ["What does PPL training cost?", "How long does PPL take?", "Do I need a medical certificate?"]
      actions = [
        { label: "Book Discovery Flight", type: "schedule", data: { type: "discovery" } },
        { label: "Download PPL Guide", type: "link", data: { url: "/guides/ppl" } }
      ]
    } else if (input.includes("cpl") || input.includes("commercial")) {
      response = knowledgeBase.training.cpl
      suggestions = ["What are CPL career prospects?", "CPL training costs?", "How long for CPL?"]
    } else if (input.includes("atpl") || input.includes("airline")) {
      response = knowledgeBase.training.atpl
      suggestions = ["ATPL financing options?", "Airline partnerships?", "ATPL vs CPL differences?"]
    } else if (input.includes("reschedule") || input.includes("change") || input.includes("cancel")) {
      response = knowledgeBase.scheduling.reschedule
      suggestions = ["How do weather cancellations work?", "Can I change my instructor?", "Weekend availability?"]
      actions = [
        { label: "Open Captain App", type: "link", data: { url: "/captain" } },
        { label: "Contact Operations", type: "escalate", data: { department: "operations" } }
      ]
    } else if (input.includes("weekend") || input.includes("saturday") || input.includes("sunday")) {
      response = knowledgeBase.scheduling.weekend
      suggestions = ["Book weekend slot", "Instructor availability weekends", "Weekend vs weekday pricing"]
    } else if (input.includes("payment") || input.includes("pay") || input.includes("cost") || input.includes("price")) {
      response = `${knowledgeBase.billing.payment} ${knowledgeBase.billing.costs}`
      suggestions = ["Payment plan options?", "Training loan providers?", "What's included in course fees?"]
      actions = [
        { label: "View Payment Options", type: "link", data: { url: "/billing/payment-methods" } },
        { label: "Speak to Accounts", type: "escalate", data: { department: "accounts" } }
      ]
    } else if (input.includes("medical") || input.includes("health")) {
      response = knowledgeBase.policies.medical
      suggestions = ["Find aviation medical examiner", "Medical renewal requirements", "Medical certificate costs"]
    } else if (input.includes("weather") || input.includes("cancel")) {
      response = knowledgeBase.policies.weather
      suggestions = ["Weather minimums explained", "How do I know if flight is cancelled?", "Makeup lesson scheduling"]
    } else if (input.includes("progress") || input.includes("how long") || input.includes("duration")) {
      response = knowledgeBase.policies.progress
      suggestions = ["How to track my progress?", "Typical PPL timeline", "Factors affecting training speed"]
      actions = [
        { label: "View Progress Report", type: "link", data: { url: "/progress" } },
        { label: "Schedule Progress Review", type: "schedule", data: { type: "progress_review" } }
      ]
    } else {
      response = "I'd be happy to help with that! For specific questions about your training, booking, or account, I can connect you with the right team member. What specific information are you looking for?"
      suggestions = [
        "Tell me about PPL training",
        "How do I reschedule a lesson?",
        "What are your payment options?",
        "Weekend training availability"
      ]
      actions = [
        { label: "Speak to a Human", type: "escalate", data: { department: "support" } },
        { label: "Browse FAQ", type: "link", data: { url: "/faq" } }
      ]
    }

    return {
      id: `msg_${Date.now()}`,
      type: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
      suggestions,
      actions
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      type: "user", 
      content: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500))

    const assistantResponse = generateResponse(inputValue)
    setMessages(prev => [...prev, assistantResponse])
    setIsTyping(false)

    logAIAction(
      "support.response.generated",
      {
        query: inputValue,
        responseType: assistantResponse.actions?.length ? "actionable" : "informational",
        suggestionsProvided: assistantResponse.suggestions?.length || 0
      },
      "ai_agent",
      currentUserRole
    )
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleActionClick = (action: Message["actions"][0]) => {
    logAIAction(
      "support.action.triggered",
      {
        actionType: action.type,
        actionLabel: action.label,
        actionData: action.data
      },
      "ai_agent",
      currentUserRole
    )

    // Handle different action types
    switch (action.type) {
      case "escalate":
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_system`,
          type: "assistant",
          content: `I'm connecting you with our ${action.data?.department} team. They'll be with you shortly to provide specialized assistance.`,
          timestamp: new Date().toISOString()
        }])
        break
      case "schedule":
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_system`, 
          type: "assistant",
          content: `I've opened the scheduling system for ${action.data?.type}. You can select your preferred time slot.`,
          timestamp: new Date().toISOString()
        }])
        break
      case "link":
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_system`,
          type: "assistant", 
          content: `Opening ${action.label}...`,
          timestamp: new Date().toISOString()
        }])
        break
    }
  }

  const commonQueries = [
    { category: "Training", queries: ["PPL requirements", "CPL timeline", "ATPL costs", "IR benefits"] },
    { category: "Scheduling", queries: ["Reschedule lesson", "Weekend slots", "Instructor change", "Weather policy"] },
    { category: "Billing", queries: ["Payment methods", "Course costs", "Payment plans", "Invoice queries"] },
    { category: "Policies", queries: ["Medical requirements", "Cancellation policy", "Progress tracking", "Equipment included"] }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary hover:bg-primary/90"
          data-testid="support-ai-copilot"
        >
          <Bot className="h-4 w-4 mr-2" />
          AI Support
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Support Copilot
          </DialogTitle>
          <DialogDescription>
            Get instant answers to common queries and escalate to human support when needed
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Live Chat</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card className="h-96">
              <CardContent className="p-0 h-full flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] ${
                          message.type === "user" 
                            ? "bg-primary text-primary-foreground ml-12" 
                            : "bg-muted mr-12"
                        } rounded-lg p-3`}>
                          <div className="flex items-center gap-2 mb-1">
                            {message.type === "assistant" && <Bot className="h-4 w-4" />}
                            {message.type === "user" && <User className="h-4 w-4" />}
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <div className="text-xs font-medium flex items-center gap-1">
                                <Lightbulb className="h-3 w-3" />
                                Suggestions:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {message.suggestions.map((suggestion, i) => (
                                  <Badge 
                                    key={i}
                                    variant="outline" 
                                    className="text-xs cursor-pointer hover:bg-accent"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                  >
                                    {suggestion}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {message.actions && message.actions.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <div className="text-xs font-medium">Quick Actions:</div>
                              <div className="flex flex-wrap gap-1">
                                {message.actions.map((action, i) => (
                                  <Button 
                                    key={i}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6"
                                    onClick={() => handleActionClick(action)}
                                  >
                                    {action.type === "escalate" && <MessageSquare className="h-3 w-3 mr-1" />}
                                    {action.type === "schedule" && <Clock className="h-3 w-3 mr-1" />}
                                    {action.type === "link" && <ExternalLink className="h-3 w-3 mr-1" />}
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3 mr-12">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask me anything about AIRMAN Academy..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonQueries.map(category => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="text-base">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.queries.map(query => (
                        <Button
                          key={query}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-sm h-auto p-2"
                          onClick={() => handleSuggestionClick(query)}
                        >
                          {query}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}