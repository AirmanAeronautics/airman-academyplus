import { useState, useEffect } from 'react';
import { useAuthBackend } from '@/hooks/useAuthBackend';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Monitor,
  Plug
} from 'lucide-react';
import { IntegrationsHub } from '@/components/integrations/IntegrationsHub';

export default function AdminSettings() {
  const { user } = useAuthBackend();
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
  }, [user]);

  const fetchAllData = async () => {
    if (!user?.tenantId) return;

    try {
      if (isDemoMode) {
        // Mock data for demo mode
        const mockOrganization = {
          id: user.tenantId,
          name: 'AIRMAN Academy (Demo)',
          domain: 'airmanacademy.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_default: true
        };

        const mockSettings = {
          id: '550e8400-e29b-41d4-a716-446655440001',
          org_id: user.tenantId,
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

      // TODO: migrate this to backend APIs once tenant/organization endpoints are ready
      // Fetch real data
      const [orgData, settingsData, pendingData, usersData, aircraftData, complianceData, logsData] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', user.tenantId).single(),
        supabase.from('org_settings').select('*').eq('org_id', user.tenantId).single(),
        supabase.from('org_pending_requests').select('*').eq('org_id', user.tenantId).eq('status', 'pending'),
        supabase.from('profiles').select('*').eq('org_id', user.tenantId),
        supabase.from('aircraft').select('*').eq('org_id', user.tenantId),
        supabase.from('compliance_items').select('*').eq('org_id', user.tenantId),
        supabase.from('event_log').select('*').eq('org_id', user.tenantId).order('created_at', { ascending: false }).limit(10)
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
    const request = pendingRequests.find(r => r.id === requestId);
    const selectedRole = request?.selectedRole || 'student';

    if (isDemoMode) {
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: "Demo: Request Approved",
        description: `${email} has been approved as ${selectedRole} in demo mode.`,
      });
      return;
    }

    try {
      // Update request status
      const { error: requestError } = await supabase
        .from('org_pending_requests')
        .update({ status: 'approved', processed_at: new Date().toISOString() })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update user profile with selected role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: selectedRole,
          approval_status: 'approved' 
        })
        .eq('id', request?.user_id);

      if (profileError) throw profileError;

      // Send approval notification
      await supabase
        .from('notifications')
        .insert({
          user_id: request?.user_id,
          org_id: user?.tenantId,
          title: 'Access Approved',
          message: `Your request has been approved. You've been assigned the ${selectedRole} role.`,
          type: 'success'
        });

      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: "Request Approved",
        description: `${email} has been approved as ${selectedRole}.`,
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

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Organization</span>
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            <span>Operations</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Finance</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
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
                    <TableHead className="w-[280px]">Role & Actions</TableHead>
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
                          <div className="flex items-center gap-2">
                            <Select
                              onValueChange={(role) => {
                                // Store selected role for this request
                                const updatedRequests = pendingRequests.map(r => 
                                  r.id === request.id ? { ...r, selectedRole: role } : r
                                );
                                setPendingRequests(updatedRequests);
                              }}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="accounts_officer">Finance Officer</SelectItem>
                                <SelectItem value="marketing_manager">Marketing Manager</SelectItem>
                                <SelectItem value="fleet_manager">Fleet Manager</SelectItem>
                                <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
                                <SelectItem value="support_staff">Support Officer</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => approvePendingRequest(request.id, request.email)}
                              disabled={!request.selectedRole}
                            >
                              Approve
                            </Button>
                          </div>
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

        {/* Operations Management */}
        <TabsContent value="operations" className="space-y-6">

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

          {/* Compliance & Safety */}
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

          {/* Training Programs */}
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

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
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
              {/* Color Mode Selection */}
              <div className="space-y-4">
                <Label className="text-base">Color Mode</Label>
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

          {/* Regional Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Regional Preferences
              </CardTitle>
              <CardDescription>Configure timezone, currency, and regional settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                      <SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
                      <SelectItem value="cet">CET (Central European Time)</SelectItem>
                      <SelectItem value="ist">IST (Indian Standard Time)</SelectItem>
                      <SelectItem value="aest">AEST (Australian Eastern Time)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    All times will be displayed in your selected timezone
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($) - US Dollar</SelectItem>
                      <SelectItem value="eur">EUR (€) - Euro</SelectItem>
                      <SelectItem value="gbp">GBP (£) - British Pound</SelectItem>
                      <SelectItem value="inr">INR (₹) - Indian Rupee</SelectItem>
                      <SelectItem value="aud">AUD ($) - Australian Dollar</SelectItem>
                      <SelectItem value="cad">CAD ($) - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Financial amounts will be displayed in your selected currency
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateformat">Date Format</Label>
                  <Select defaultValue="mdy">
                    <SelectTrigger id="dateformat">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY (US Format)</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY (European Format)</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD (ISO Format)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Unit System</Label>
                  <Select defaultValue="imperial">
                    <SelectTrigger id="units">
                      <SelectValue placeholder="Select unit system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imperial">Imperial (ft, mph, lbs)</SelectItem>
                      <SelectItem value="metric">Metric (m, km/h, kg)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Aviation measurements and units display preference
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Hub */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Integrations Hub
              </CardTitle>
              <CardDescription>
                Connect video conferencing, ERP systems, and cloud storage to streamline your operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationsHub />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}