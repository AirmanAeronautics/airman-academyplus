import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Clock } from 'lucide-react';

interface PendingRequest {
  id: string;
  user_id: string;
  email: string;
  requested_at: string;
  status: string;
}

export default function PendingRequests() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [profile]);

  const fetchRequests = async () => {
    if (!profile?.org_id) return;

    try {
      const { data, error } = await supabase
        .from('org_pending_requests')
        .select('*')
        .eq('org_id', profile.org_id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, userId: string, action: 'approved' | 'denied') => {
    try {
      // Update the request status
      const { error: updateError } = await supabase
        .from('org_pending_requests')
        .update({
          status: action,
          processed_by: profile.user_id,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (action === 'approved') {
        // Update user profile to add them to the organization
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            org_id: profile.org_id,
            role: 'user'
          })
          .eq('id', userId);

        if (profileError) throw profileError;

        // Send approval notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Access Approved',
            message: 'Your request to join the organization has been approved. Welcome!',
            type: 'success'
          });
      } else {
        // Send denial notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Access Denied',
            message: 'Your request to join the organization has been denied.',
            type: 'error'
          });
      }

      // Remove the request from the list
      setRequests(requests.filter(req => req.id !== requestId));

      toast({
        title: `Request ${action}`,
        description: `The access request has been ${action}.`,
        variant: action === 'approved' ? 'default' : 'destructive'
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Requests</h1>
        <p className="text-muted-foreground">Review and approve access requests to your organization</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading requests...</p>
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
            <Check className="h-8 w-8 text-green-500" />
            <p className="text-muted-foreground">No pending requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{request.email}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Requested {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleRequest(request.id, request.user_id, 'approved')}
                    className="flex items-center space-x-1"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRequest(request.id, request.user_id, 'denied')}
                    className="flex items-center space-x-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Deny</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}