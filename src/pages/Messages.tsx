import { useState } from "react"
import { MessageSquare, Send, Search, Users, User, Settings, Phone, Video, Bot } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

const departments = [
  {
    id: 1,
    name: "Operations",
    participants: 12,
    lastMessage: "Flight schedule for tomorrow updated",
    timestamp: "2 min ago",
    unread: 3,
    online: 8
  },
  {
    id: 2,
    name: "Maintenance",
    participants: 5,
    lastMessage: "G-ABCD inspection completed",
    timestamp: "15 min ago",
    unread: 1,
    online: 3
  },
  {
    id: 3,
    name: "Instructors",
    participants: 18,
    lastMessage: "New briefing materials available",
    timestamp: "1 hour ago",
    unread: 0,
    online: 12
  },
  {
    id: 4,
    name: "Students",
    participants: 156,
    lastMessage: "Weather update for training flights",
    timestamp: "2 hours ago",
    unread: 5,
    online: 89
  }
]

const messages = [
  {
    id: 1,
    sender: "Ops Manager",
    avatar: "/placeholder.svg",
    content: "Flight schedule for tomorrow updated. Please check the roster.",
    timestamp: "2 min ago",
    isOwn: false
  },
  {
    id: 2,
    sender: "You",
    avatar: "/placeholder.svg",
    content: "Thanks, reviewing now. Any changes to the weather minimums?",
    timestamp: "1 min ago",
    isOwn: true
  },
  {
    id: 3,
    sender: "CFI Miller",
    avatar: "/placeholder.svg",
    content: "Visibility looks good for cross-country flights. Winds might be a factor for solo students.",
    timestamp: "30 sec ago",
    isOwn: false
  }
]

const contacts = [
  {
    id: 1,
    name: "Capt. James Miller",
    role: "Chief Flight Instructor",
    status: "online",
    lastSeen: "now"
  },
  {
    id: 2,
    name: "Emma Thompson",
    role: "Flight Instructor",
    status: "away",
    lastSeen: "5 min ago"
  },
  {
    id: 3,
    name: "David Brown",
    role: "CFII",
    status: "offline",
    lastSeen: "2 hours ago"
  },
  {
    id: 4,
    name: "Sarah Wilson",
    role: "Student Pilot",
    status: "online",
    lastSeen: "now"
  }
]

export default function Messages() {
  const [selectedDepartment, setSelectedDepartment] = useState(departments[0])
  const [messageText, setMessageText] = useState("")
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success'
      case 'away': return 'bg-warning'
      case 'offline': return 'bg-muted-foreground'
      default: return 'bg-muted-foreground'
    }
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle sending message
      setMessageText("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Squawk</h1>
          <p className="text-muted-foreground mt-1">Departmental chat and team coordination</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={showAIAssistant ? 'bg-primary text-primary-foreground' : ''}
          >
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
          <Button className="bg-primary hover:bg-primary-dark">
            <Users className="h-4 w-4 mr-2" />
            New Channel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Departments/Channels List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">DEPARTMENTS</h3>
            {departments.map((dept) => (
              <Card
                key={dept.id}
                className={`cursor-pointer transition-all aviation-card hover:aviation-card-elevated ${
                  selectedDepartment.id === dept.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedDepartment(dept)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{dept.name}</span>
                    </div>
                    {dept.unread > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {dept.unread}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{dept.lastMessage}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">{dept.timestamp}</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-xs text-muted-foreground">{dept.online}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">CONTACTS</h3>
            {contacts.slice(0, 4).map((contact) => (
              <div key={contact.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(contact.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="aviation-card h-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{selectedDepartment.name}</CardTitle>
                    <CardDescription>{selectedDepartment.participants} participants • {selectedDepartment.online} online</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex space-x-2 max-w-[70%] ${message.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`${message.isOwn ? 'text-right' : ''}`}>
                        <div className={`inline-block p-3 rounded-lg ${
                          message.isOwn 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{message.sender} • {message.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* AI Assistant Panel */}
            {showAIAssistant && (
              <div className="border-t p-3 bg-accent">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Communication Assistant</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Suggested response: "I'll review the schedule and coordinate with the maintenance team for any aircraft availability issues."
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">Use Suggestion</Button>
                  <Button size="sm" variant="outline" className="text-xs">Rewrite Professional</Button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Online Users & Info */}
        <div className="space-y-4">
          <Card className="aviation-card">
            <CardHeader>
              <CardTitle className="text-base">Online Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.filter(c => c.status === 'online').map((contact) => (
                <div key={contact.id} className="flex items-center space-x-2">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background bg-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{contact.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="aviation-card">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Broadcast Message
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Create Group
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Emergency Call
              </Button>
            </CardContent>
          </Card>

          <Card className="aviation-card">
            <CardHeader>
              <CardTitle className="text-base">Channel Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>Jan 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages:</span>
                <span>1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Files shared:</span>
                <span>89</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}