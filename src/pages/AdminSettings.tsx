import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from 'next-themes';
import { 
  Users, 
  Settings, 
  Plane, 
  CreditCard, 
  Shield, 
  MessageSquare, 
  Database, 
  BarChart3,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  UserPlus,
  Calendar,
  DollarSign,
  Palette,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

export default function AdminSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { isDemoMode } = useDemo();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [complianceItems, setComplianceItems] = useState<any[]>([]);
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('organization');

  useEffect(() => {
    fetchAllData();
  }, [profile]);

  const fetchAllData = async () => {
    if (!profile?.org_id) return;

    try {
      if (isDemoMode) {
        // Mock data for demo mode
        const mockOrganization = {
          id: profile.org_id,
          name: 'AIRMAN Academy (Demo)',
          domain: 'airmanacademy.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_default: true
        };

        const mockSettings = {
          id: '550e8400-e29b-41d4-a716-446655440001',
          org_id: profile.org_id,
          auto_approve_domain: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const mockPendingRequests = [
          {
            id: 'req-1',
            email: 'john.pilot@example.com',
            requested_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending'
          },
          {
            id: 'req-2', 
            email: 'sarah.instructor@example.com',
            requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending'
          }
        ];

        const mockUsers = [
          {
            id: 'user-1',
            name: 'John Henderson',
            email: 'j.henderson@airman.academy',
            role: 'ops_manager',
            created_at: new Date().toISOString()
          },
          {
            id: 'user-2',
            name: 'Emma Davis',
            email: 'e.davis@airman.academy', 
            role: 'compliance_officer',
            created_at: new Date().toISOString()
          }
        ];

        const mockAircraft = [
          {
            id: 'ac-1',
            registration: 'N12345',
            make_model: 'Cessna 172',
            status: 'available',
            total_hours: 1250.5
          },
          {
            id: 'ac-2',
            registration: 'N67890',
            make_model: 'Piper Cherokee',
            status: 'maintenance',
            total_hours: 890.2
          }
        ];

        const mockCompliance = [
          {
            id: 'comp-1',
            user_id: 'user-1',
            compliance_type_id: 'ct-1',
            status: 'current',
            expiry_date: '2025-06-15'
          },
          {
            id: 'comp-2',
            user_id: 'user-2', 
            compliance_type_id: 'ct-2',
            status: 'expiring',
            expiry_date: '2025-02-28'
          }
        ];

        const mockEventLogs = [
          {
            id: 'log-1',
            type: 'user_login',
            category: 'auth',
            message: 'User logged in successfully',
            created_at: new Date().toISOString()
          },
          {
            id: 'log-2',
            type: 'flight_scheduled',
            category: 'operations',
            message: 'Flight session scheduled',
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
          }
        ];

        setOrganization(mockOrganization);
        setSettings(mockSettings);
        setPendingRequests(mockPendingRequests);
        setUsers(mockUsers);
        setAircraft(mockAircraft);
        setComplianceItems(mockCompliance);
        setEventLogs(mockEventLogs);
        return;
      }

      // Fetch real data
      const [orgData, settingsData, pendingData, usersData, aircraftData, complianceData, logsData] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', profile.org_id).single(),
        supabase.from('org_settings').select('*').eq('org_id', profile.org_id).single(),
        supabase.from('org_pending_requests').select('*').eq('org_id', profile.org_id).eq('status', 'pending'),
        supabase.from('profiles').select('*').eq('org_id', profile.org_id),
        supabase.from('aircraft').select('*').eq('org_id', profile.org_id),
        supabase.from('compliance_items').select('*').eq('org_id', profile.org_id),
        supabase.from('event_log').select('*').eq('org_id', profile.org_id).order('created_at', { ascending: false }).limit(10)
      ]);

      setOrganization(orgData.data);
      setSettings(settingsData.data);
      setPendingRequests(pendingData.data || []);
      setUsers(usersData.data || []);
      setAircraft(aircraftData.data || []);
      setComplianceItems(complianceData.data || []);
      setEventLogs(logsData.data || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approvePendingRequest = async (requestId: string, email: string) => {
    if (isDemoMode) {
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: "Demo: Request Approved",
        description: `${email} has been approved in demo mode.`,
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('org_pending_requests')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: "Request Approved",
        description: `${email} has been approved and can now access the platform.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateAutoApprove = async (enabled: boolean) => {
    if (!settings) return;

    try {
      if (isDemoMode) {
        setSettings({ ...settings, auto_approve_domain: enabled });
        toast({
          title: "Demo Settings Updated",
          description: `Domain auto-approval has been ${enabled ? 'enabled' : 'disabled'} in demo mode.`,
        });
        return;
      }

      const { error } = await supabase
        .from('org_settings')
        .update({ auto_approve_domain: enabled })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, auto_approve_domain: enabled });
      
      toast({
        title: "Settings updated",
        description: `Domain auto-approval has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Comprehensive administration tools for your organization</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Org</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            <span className="hidden sm:inline">Fleet</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Finance</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Safety</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Comms</span>
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Training</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
        </TabsList>

        {/* Organization Management */}
        <TabsContent value="organization" className="space-y-6">
          {organization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Organization Details
                </CardTitle>
                <CardDescription>Manage your organization's basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Name</Label>
                    <Input value={organization.name} disabled />
                  </div>
                  <div>
                    <Label>Email Domain</Label>
                    <div className="flex items-center space-x-2">
                      <Input value={organization.domain} disabled />
                      <Badge variant="secondary">@{organization.domain}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <Input value={new Date(organization.created_at).toLocaleDateString()} disabled />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={organization.is_default ? "default" : "secondary"}>
                      {organization.is_default ? "Default Organization" : "Standard"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {settings && (
            <Card>
              <CardHeader>
                <CardTitle>Access Control Settings</CardTitle>
                <CardDescription>Configure how new users gain access to your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Auto-Approval for Email Domain</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve users with email addresses matching @{organization?.domain}
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_approve_domain}
                    onCheckedChange={updateAutoApprove}
                  />
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">How it works:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Explicitly invited users</strong> are always auto-approved regardless of this setting</li>
                    <li>• <strong>Domain users (when enabled)</strong> are automatically approved upon signup</li>
                    <li>• <strong>Domain users (when disabled)</strong> must wait for admin approval</li>
                    <li>• <strong>Other users</strong> always require admin approval or explicit invitation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Pending Requests
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive">{pendingRequests.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Users waiting for approval to join your organization</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending requests</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>{new Date(request.requested_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => approvePendingRequest(request.id, request.email)}
                          >
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organization Members
              </CardTitle>
              <CardDescription>Current users in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fleet Management */}
        <TabsContent value="fleet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Aircraft Fleet
              </CardTitle>
              <CardDescription>Manage your organization's aircraft</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Aircraft Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aircraft.map((plane) => (
                    <TableRow key={plane.id}>
                      <TableCell className="font-mono">{plane.registration}</TableCell>
                      <TableCell>{plane.make_model}</TableCell>
                      <TableCell>
                        <Badge variant={plane.status === 'available' ? 'default' : plane.status === 'maintenance' ? 'destructive' : 'secondary'}>
                          {plane.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{plane.total_hours}h</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Administration */}
        <TabsContent value="finance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Overview
              </CardTitle>
              <CardDescription>Billing and payment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">$12,450</div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">$890</div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-sm text-muted-foreground">Active Students</p>
                  </CardContent>
                </Card>
              </div>
              <Button>Configure Billing Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance & Safety */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Status
              </CardTitle>
              <CardDescription>Monitor compliance items and safety requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>Compliance Item {item.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'current' ? 'default' : item.status === 'expiring' ? 'destructive' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(item.expiry_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Review</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Settings */}
        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email alerts for critical events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when aircraft require maintenance</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compliance Expiry Warnings</Label>
                    <p className="text-sm text-muted-foreground">Warn 30 days before compliance expires</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Integration */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                API & Integration Settings
              </CardTitle>
              <CardDescription>Manage external integrations and API access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">API Access</h4>
                <p className="text-sm text-muted-foreground mb-4">Generate API keys for external integrations</p>
                <Button variant="outline">Generate API Key</Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Data Export</h4>
                <p className="text-sm text-muted-foreground mb-4">Export your organization's data</p>
                <Button variant="outline">Export Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics & Reporting */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Analytics
              </CardTitle>
              <CardDescription>View system usage and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-sm text-muted-foreground">Total Flight Hours</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">89%</div>
                    <p className="text-sm text-muted-foreground">Aircraft Utilization</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">34</div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-sm text-muted-foreground">Pending Items</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Administration */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                System Event Logs
              </CardTitle>
              <CardDescription>Recent system activity and events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{log.type}</Badge>
                      </TableCell>
                      <TableCell>{log.category}</TableCell>
                      <TableCell className="max-w-md truncate">{log.message}</TableCell>
                      <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Programs */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Training Program Configuration
              </CardTitle>
              <CardDescription>Manage courses, milestones, and training requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Course Templates</h4>
                    <p className="text-sm text-muted-foreground mb-4">Manage training course structures</p>
                    <Button variant="outline" size="sm">Configure Courses</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Milestone Templates</h4>
                    <p className="text-sm text-muted-foreground mb-4">Set up training milestones and requirements</p>
                    <Button variant="outline" size="sm">Manage Milestones</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Instructor Assignments</h4>
                    <p className="text-sm text-muted-foreground mb-4">Manage student-instructor pairings</p>
                    <Button variant="outline" size="sm">View Assignments</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Progress Tracking</h4>
                    <p className="text-sm text-muted-foreground mb-4">Monitor student progress across programs</p>
                    <Button variant="outline" size="sm">View Progress</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Settings
              </CardTitle>
              <CardDescription>Customize the appearance of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">Color Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose how the interface should appear. System will automatically match your device's theme.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Light Theme */}
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sun className="h-5 w-5 text-primary" />
                          <span className="font-medium">Light</span>
                        </div>
                        {theme === 'light' && <CheckCircle className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="rounded-md border-2 overflow-hidden">
                        <div className="bg-white p-3 space-y-2">
                          <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                          <div className="flex gap-2 mt-3">
                            <div className="h-6 bg-blue-500 rounded flex-1"></div>
                            <div className="h-6 bg-slate-200 rounded flex-1"></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Clean and bright interface ideal for well-lit environments
                      </p>
                    </CardContent>
                  </Card>

                  {/* Dark Theme */}
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Moon className="h-5 w-5 text-primary" />
                          <span className="font-medium">Dark</span>
                        </div>
                        {theme === 'dark' && <CheckCircle className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="rounded-md border-2 overflow-hidden">
                        <div className="bg-slate-950 p-3 space-y-2">
                          <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                          <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                          <div className="flex gap-2 mt-3">
                            <div className="h-6 bg-blue-600 rounded flex-1"></div>
                            <div className="h-6 bg-slate-700 rounded flex-1"></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Reduces eye strain in low-light conditions
                      </p>
                    </CardContent>
                  </Card>

                  {/* System Theme */}
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${theme === 'system' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTheme('system')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-5 w-5 text-primary" />
                          <span className="font-medium">System</span>
                        </div>
                        {theme === 'system' && <CheckCircle className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="rounded-md border-2 overflow-hidden">
                        <div className="bg-gradient-to-br from-white to-slate-950 p-3 space-y-2">
                          <div className="h-2 bg-slate-400 rounded w-3/4"></div>
                          <div className="h-2 bg-slate-400 rounded w-1/2"></div>
                          <div className="flex gap-2 mt-3">
                            <div className="h-6 bg-blue-500 rounded flex-1"></div>
                            <div className="h-6 bg-slate-400 rounded flex-1"></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Automatically matches your device's appearance settings
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  About Theme Settings
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your theme preference is saved locally in your browser</li>
                  <li>• System theme automatically adjusts based on your device's settings</li>
                  <li>• Dark mode is optimized for reduced eye strain during night operations</li>
                  <li>• Theme changes apply instantly across all pages</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}