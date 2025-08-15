import { useState } from "react"
import React from "react"
import { Search, Filter, MessageSquare, Mail, Bot, ExternalLink, Phone, Clock, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { supportTickets, type SupportTicket } from "@/data/support"

const priorityColors = {
  low: "bg-gray-500",
  medium: "bg-yellow-500", 
  high: "bg-orange-500",
  urgent: "bg-red-500"
}

const statusColors = {
  new: "bg-blue-500",
  open: "bg-yellow-500",
  pending: "bg-orange-500", 
  resolved: "bg-green-500",
  closed: "bg-gray-500"
}

const channelIcons = {
  email: Mail,
  chat: MessageSquare,
  whatsapp: Phone
}

export default function Support() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(supportTickets[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [replyText, setReplyText] = useState("")
  const [showAISuggestion, setShowAISuggestion] = useState(false)

  const filteredTickets = supportTickets.filter(ticket =>
    ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const handleAISuggestion = () => {
    if (selectedTicket?.aiSuggestion) {
      setReplyText(selectedTicket.aiSuggestion)
      setShowAISuggestion(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Customer Support</h1>
          <p className="text-muted-foreground mt-1">Unified inbox with AI-powered assistance</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark">
          <Bot className="h-4 w-4 mr-2" />
          AI Assistant
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Open Tickets</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">-3 from yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Avg Response</p>
                <p className="text-2xl font-bold">1.2h</p>
                <p className="text-xs text-muted-foreground">Below 2h target</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Satisfaction</p>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-muted-foreground">Out of 5.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">AI Accuracy</p>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-muted-foreground">Suggestion quality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const ChannelIcon = channelIcons[ticket.channel]
              return (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition-all aviation-card hover:aviation-card-elevated ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusColors[ticket.status]}`} />
                        <div className={`w-2 h-2 rounded-full ${priorityColors[ticket.priority]}`} />
                        <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getTimestamp(ticket.created).split(',')[0]}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-foreground text-sm mb-1">
                      {ticket.subject}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {ticket.customer}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {ticket.status}
                      </Badge>
                      {ticket.linkedRecord && (
                        <Badge variant="secondary" className="text-xs">
                          {ticket.linkedRecord.type}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="aviation-card h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {React.createElement(channelIcons[selectedTicket.channel], { className: "h-5 w-5" })}
                      {selectedTicket.subject}
                    </CardTitle>
                    <CardDescription>
                      {selectedTicket.customer} • {selectedTicket.email}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedTicket.status}</Badge>
                    <Badge variant={selectedTicket.priority === 'urgent' ? 'destructive' : 'secondary'}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                </div>
                
                {selectedTicket.linkedRecord && (
                  <div className="p-3 bg-accent rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Linked {selectedTicket.linkedRecord.type}: {selectedTicket.linkedRecord.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          View full {selectedTicket.linkedRecord.type} record for context
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <Tabs defaultValue="conversation" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="conversation">Conversation</TabsTrigger>
                    <TabsTrigger value="ai-assist">AI Assist</TabsTrigger>
                  </TabsList>

                  <TabsContent value="conversation" className="space-y-4">
                    {/* Messages */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedTicket.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.type === 'customer' 
                              ? 'bg-muted ml-0 mr-12' 
                              : 'bg-primary text-primary-foreground ml-12 mr-0'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{message.from}</span>
                            <span className={`text-xs ${
                              message.type === 'customer' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                            }`}>
                              {getTimestamp(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reply Box */}
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Reply</h4>
                        {selectedTicket.aiSuggestion && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAISuggestion(!showAISuggestion)}
                          >
                            <Bot className="h-4 w-4 mr-2" />
                            AI Suggestion
                          </Button>
                        )}
                      </div>

                      {showAISuggestion && selectedTicket.aiSuggestion && (
                        <div className="p-3 bg-accent rounded-lg border border-primary/20">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-sm">AI Suggested Reply:</h5>
                            <Button size="sm" variant="outline" onClick={handleAISuggestion}>
                              Use This
                            </Button>
                          </div>
                          <p className="text-sm text-accent-foreground">{selectedTicket.aiSuggestion}</p>
                        </div>
                      )}

                      <Textarea
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={4}
                      />
                      
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Log to CRM
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">Save Draft</Button>
                          <Button className="bg-primary hover:bg-primary-dark">
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai-assist" className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Bot className="h-5 w-5 text-primary" />
                          AI Analysis
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm mb-1">Conversation Summary</h5>
                            <p className="text-sm text-muted-foreground">
                              Customer inquiring about weekend training availability for PPL course. 
                              Shows budget alignment and genuine interest. Recommend immediate response 
                              with weekend schedule options.
                            </p>
                          </div>

                          <div>
                            <h5 className="font-medium text-sm mb-1">Suggested Actions</h5>
                            <ul className="text-sm space-y-1">
                              <li>• Send weekend availability calendar</li>
                              <li>• Mention Weekend Warrior PPL package</li>
                              <li>• Schedule discovery call within 24h</li>
                              <li>• Add to high-priority lead nurture sequence</li>
                            </ul>
                          </div>

                          <div>
                            <h5 className="font-medium text-sm mb-1">Recommended Routing</h5>
                            <p className="text-sm text-muted-foreground">
                              Forward to Marketing Team for lead scoring and nurture campaign enrollment.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm">
                            Escalate to Manager
                          </Button>
                          <Button variant="outline" size="sm">
                            Schedule Callback
                          </Button>
                          <Button variant="outline" size="sm">
                            Send Brochure
                          </Button>
                          <Button variant="outline" size="sm">
                            Create Lead
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="aviation-card h-full">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a ticket to view conversation</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}