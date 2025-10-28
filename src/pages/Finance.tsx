import { useState } from "react"
import { DollarSign, CreditCard, FileText, TrendingUp, Calendar, Bot, Plus, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

const invoices = [
  {
    id: "INV-2024-001",
    student: "Sarah Wilson",
    course: "CPL Training",
    amount: 2450.00,
    status: "paid",
    dueDate: "2024-01-15",
    paidDate: "2024-01-14",
    hoursFlown: 12.5,
    aiGenerated: true
  },
  {
    id: "INV-2024-002",
    student: "Marcus Chen",
    course: "PPL Training",
    amount: 1850.00,
    status: "pending",
    dueDate: "2024-01-20",
    paidDate: null,
    hoursFlown: 8.3,
    aiGenerated: false
  },
  {
    id: "INV-2024-003",
    student: "Lisa Rodriguez",
    course: "IR Training",
    amount: 3200.00,
    status: "overdue",
    dueDate: "2024-01-10",
    paidDate: null,
    hoursFlown: 15.2,
    aiGenerated: true
  }
]

const payments = [
  {
    id: 1,
    date: "2024-01-14",
    student: "Sarah Wilson",
    amount: 2450.00,
    method: "Bank Transfer",
    reference: "CPL-001-2024"
  },
  {
    id: 2,
    date: "2024-01-12",
    student: "John Smith",
    amount: 1200.00,
    method: "Credit Card",
    reference: "PPL-045-2024"
  },
  {
    id: 3,
    date: "2024-01-10",
    student: "Emma Davis",
    amount: 850.00,
    method: "Cash",
    reference: "CHECKOUT-2024"
  }
]

const revenueData = [
  { month: "Oct", revenue: 28500, target: 30000 },
  { month: "Nov", revenue: 32000, target: 30000 },
  { month: "Dec", revenue: 29800, target: 30000 },
  { month: "Jan", revenue: 15200, target: 30000 } // Partial month
]

export default function Finance() {
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default'
      case 'pending': return 'outline'
      case 'overdue': return 'destructive'
      default: return 'secondary'
    }
  }

  const totalRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0)
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0)
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance & Billing</h1>
          <p className="text-muted-foreground mt-1">Manage invoices, payments, and financial reporting</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={showAIAssistant ? 'bg-primary text-primary-foreground' : ''}
          >
            <Bot className="h-4 w-4 mr-2" />
            Finance Assistant
          </Button>
          <Button className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* AI Assistant */}
      {showAIAssistant && (
        <Card className="aviation-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Finance Assistant AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm font-medium text-accent-foreground">Revenue Optimization</p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on current flight hours, auto-generate 5 pending invoices worth $8,650. 
                Projected revenue increase of 18% this month.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" className="bg-primary hover:bg-primary-dark">
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoices
              </Button>
              <Button size="sm" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Revenue Forecast
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Payment Reminders
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold">£{revenueData[revenueData.length - 1].revenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium">Pending Invoices</p>
                <p className="text-2xl font-bold">£{pendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Overdue Amount</p>
                <p className="text-2xl font-bold">£{overdueAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Target Achievement</p>
                <p className="text-2xl font-bold">{Math.round((revenueData[revenueData.length - 1].revenue / revenueData[revenueData.length - 1].target) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Bot className="h-4 w-4 mr-2" />
              Auto-Generate
            </Button>
          </div>

          <div className="space-y-3">
            {invoices.filter(invoice =>
              invoice.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
              invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((invoice) => (
              <Card key={invoice.id} className="aviation-card hover:aviation-card-elevated cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{invoice.id}</p>
                          {invoice.aiGenerated && (
                            <Badge variant="outline" className="text-primary border-primary">
                              <Bot className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{invoice.student} • {invoice.course}</p>
                        <p className="text-xs text-muted-foreground">{invoice.hoursFlown}h flown</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-lg">£{invoice.amount.toLocaleString()}</p>
                      <Badge variant={getStatusColor(invoice.status)} className="capitalize">
                        {invoice.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Due: {invoice.dueDate}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Payments</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
            
            <div className="space-y-3">
              {payments.map((payment) => (
                <Card key={payment.id} className="aviation-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-success" />
                        <div>
                          <p className="font-medium">{payment.student}</p>
                          <p className="text-sm text-muted-foreground">{payment.method} • {payment.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-success">+£{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="space-y-6">
            {/* Quick Export Options */}
            <Card className="aviation-card">
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate and export financial data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Invoice Report</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm">Revenue Report</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm">Payment Report</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm">P&L Statement</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Financial Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="aviation-card">
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue vs targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData.map((month, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{month.month} 2024</span>
                          <span className="font-medium">£{month.revenue.toLocaleString()}</span>
                        </div>
                        <Progress value={(month.revenue / month.target) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Target: £{month.target.toLocaleString()}</span>
                          <span>{Math.round((month.revenue / month.target) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="aviation-card">
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>Key metrics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Invoiced (YTD)</span>
                      <span className="font-medium">£{totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outstanding Receivables</span>
                      <span className="font-medium">£{(pendingAmount + overdueAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Invoice Value</span>
                      <span className="font-medium">£{Math.round(invoices.reduce((sum, inv) => sum + inv.amount, 0) / invoices.length).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collection Rate</span>
                      <span className="font-medium text-success">
                        {Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    <Bot className="h-4 w-4 mr-2" />
                    Generate Full Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="aviation-card">
              <CardHeader>
                <CardTitle>Billing Settings</CardTitle>
                <CardDescription>Configure automatic billing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Flight Hour Rate</label>
                  <Input placeholder="£180.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructor Rate</label>
                  <Input placeholder="£45.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Landing Fee</label>
                  <Input placeholder="£12.00" />
                </div>
                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>

            <Card className="aviation-card">
              <CardHeader>
                <CardTitle>AI Automation</CardTitle>
                <CardDescription>Configure AI-powered features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-generate invoices</span>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment reminders</span>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Revenue forecasting</span>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expense categorization</span>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}