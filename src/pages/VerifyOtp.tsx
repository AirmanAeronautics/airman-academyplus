import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const identifier = searchParams.get('identifier') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Redirect if already authenticated and onboarding complete
  useEffect(() => {
    if (isAuthenticated && user?.isOnboardingComplete) {
      const dashboardRoute = 
        user.primaryRole === 'ADMIN' ? '/admin/dashboard' :
        user.primaryRole === 'INSTRUCTOR' ? '/instructor/dashboard' :
        user.primaryRole === 'STUDENT' ? '/student/dashboard' :
        '/';
      navigate(dashboardRoute);
    }
  }, [isAuthenticated, user, navigate]);

  // Redirect if no identifier
  useEffect(() => {
    if (!identifier) {
      navigate('/auth');
    }
  }, [identifier, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      await verifyOtp(identifier, otp);
      toast({
        title: "Verification Successful",
        description: "You've been successfully signed in.",
      });
      // Navigation will happen automatically via AuthContext
    } catch (err: any) {
      let errorMessage = 'OTP verification failed. Please try again.';
      
      if (err.errorCode === 'OTP_INVALID') {
        errorMessage = 'Incorrect OTP. Please try again.';
      } else if (err.errorCode === 'OTP_EXPIRED') {
        errorMessage = 'OTP expired. Please request a new one.';
      } else if (err.message) {
        errorMessage = err.message;
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

  const isEmail = identifier.includes('@');
  const maskedIdentifier = isEmail
    ? identifier.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : identifier.replace(/(\d{2})(\d+)(\d{2})/, '$1***$3');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
          <CardDescription>
            Enter the verification code sent to {isEmail ? 'your email' : 'your phone'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              {isEmail ? (
                <Mail className="h-5 w-5" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{maskedIdentifier}</span>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setError('');
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="link"
              className="text-sm"
              onClick={() => navigate(`/auth?identifier=${encodeURIComponent(identifier)}`)}
            >
              Request a new OTP
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Link to="/auth">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

