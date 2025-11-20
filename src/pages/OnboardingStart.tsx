import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building, CheckCircle2, Loader2 } from 'lucide-react';
import { verifyInstitute, type Institute } from '@/lib/api/auth';
import { handleApiError } from '@/lib/api/handleApiError';
import { useToast } from '@/hooks/use-toast';

export default function OnboardingStart() {
  const [code, setCode] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code && !emailDomain) {
      setError('Please enter either an institute code or email domain');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyInstitute({ code: code || undefined, emailDomain: emailDomain || undefined });
      setInstitute(response.data);
      toast({
        title: "Institute Verified",
        description: `Found: ${response.data.name}`,
      });
    } catch (err: any) {
      const apiError = handleApiError(err);
      let errorMessage = 'Failed to verify institute. Please try again.';
      
      if (apiError.errorCode === 'INSTITUTE_NOT_FOUND') {
        errorMessage = 'No institute found with that code or domain.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigate to profile step when institute is verified
  if (institute) {
    navigate('/onboarding/profile', { state: { institute } });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify Your Institute</CardTitle>
          <CardDescription>
            Enter your institute code or email domain to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Institute Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="e.g., INST001"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setEmailDomain('');
                  setError('');
                }}
                disabled={!!emailDomain}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailDomain">Email Domain</Label>
              <Input
                id="emailDomain"
                type="text"
                placeholder="e.g., example.com"
                value={emailDomain}
                onChange={(e) => {
                  setEmailDomain(e.target.value);
                  setCode('');
                  setError('');
                }}
                disabled={!!code}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || (!code && !emailDomain)}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Building className="mr-2 h-4 w-4" />
                  Verify Institute
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

