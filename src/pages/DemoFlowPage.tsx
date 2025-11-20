import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BarChart3, Headset, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useDemoFlow } from '@/hooks/useDemoFlow';
import { useAuthBackend } from '@/hooks/useAuthBackend';
import { hasAnyRole } from '@/lib/roleUtils';
import { Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function DemoFlowPage() {
  const { user } = useAuthBackend();
  const { loading, steps, runTrainingDemo, runOpsDemo, runSupportFinanceDemo } = useDemoFlow();

  // Only SUPER_ADMIN and ADMIN can access
  if (!user || !hasAnyRole(user, ['SUPER_ADMIN', 'ADMIN'])) {
    return <Navigate to="/" replace />;
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Live Academy Demo Setup</h1>
        <p className="text-muted-foreground text-lg">
          Run guided demos to showcase AIRMAN Academy+ features to Flight Training Organizations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Training Demo Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-6 w-6 text-primary" />
              <CardTitle>Plan & Schedule Training</CardTitle>
            </div>
            <CardDescription>
              Create demo training program, lessons, and aircraft. Navigate to the training calendar to view.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runTrainingDemo}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                'Run Training Demo'
              )}
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Creates training program & lesson</p>
              <p>• Adds demo aircraft to fleet</p>
              <p>• Navigates to Training Calendar</p>
            </div>
          </CardContent>
        </Card>

        {/* Ops Demo Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <CardTitle>Monitor Daily Operations</CardTitle>
            </div>
            <CardDescription>
              Ingest weather data, NOTAMs, and fetch operations summary. View on the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runOpsDemo}
              disabled={loading}
              className="w-full"
              size="lg"
              variant="secondary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                'Run Ops Demo'
              )}
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Ingests environment snapshot</p>
              <p>• Fetches ops overview data</p>
              <p>• Shows dispatch readiness</p>
            </div>
          </CardContent>
        </Card>

        {/* Support & Finance Demo Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Headset className="h-6 w-6 text-primary" />
              <CardTitle>Support, Compliance & Finance</CardTitle>
            </div>
            <CardDescription>
              Create support tickets, messaging threads, and invoices. Navigate to support view.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runSupportFinanceDemo}
              disabled={loading}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                'Run Support Demo'
              )}
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Creates support ticket</p>
              <p>• Opens messaging thread</p>
              <p>• Generates demo invoice</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Steps Progress */}
      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Demo Progress</CardTitle>
            <CardDescription>Current demo execution steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <p className="font-medium">{step.name}</p>
                    {step.message && (
                      <p className="text-sm text-muted-foreground">{step.message}</p>
                    )}
                  </div>
                  <Badge variant={
                    step.status === 'success' ? 'default' :
                    step.status === 'error' ? 'destructive' :
                    'secondary'
                  }>
                    {step.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">About This Demo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This demo setup creates sample data in your AIRMAN Academy+ instance to showcase the platform's capabilities to Flight Training Organizations.
          </p>
          <p>
            Each demo step uses real backend APIs (translated from the e2e smoke test) to create authentic data and automatically navigates you to the relevant screen.
          </p>
          <p className="text-xs pt-2 border-t">
            <strong>Access:</strong> Only SUPER_ADMIN and ADMIN roles can run these demos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
