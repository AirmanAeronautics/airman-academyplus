import { useAuthBackend } from '@/hooks/useAuthBackend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Mail, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PendingApproval() {
  const { user, logout } = useAuthBackend();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Approval Pending</CardTitle>
          <CardDescription>
            Your account is awaiting organization approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              We've received your registration for <strong>{user?.email}</strong>. 
              Your account is currently pending approval from an organization administrator.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              You'll receive an email notification once your account has been approved. 
              This process typically takes 1-2 business days.
            </p>
            
            <p>
              If you believe this is an error or need immediate access, please contact your 
              organization administrator or our support team.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('mailto:support@airmanacademy.com', '_blank')}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}