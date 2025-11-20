import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuthBackend } from '@/hooks/useAuthBackend';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, Lock, Zap, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDemo } from '@/contexts/DemoContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RegisterTenantDto } from '@/types/auth';

export default function Auth() {
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [loginError, setLoginError] = useState<string>('');
  
  // Registration form state
  const [tenantName, setTenantName] = useState('');
  const [regulatoryFramework, setRegulatoryFramework] = useState('DGCA');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, login, registerTenant, loading: authLoading } = useAuthBackend();
  const { loginWithPassword: newLoginWithPassword, loginWithOtp: newLoginWithOtp, isAuthenticated } = useAuth();
  const { isDemoMode, startDemo } = useDemo();

  useEffect(() => {
    if ((user || isDemoMode || isAuthenticated) && !loginMethod) {
      navigate('/');
    }
  }, [user, isDemoMode, isAuthenticated, navigate, loginMethod]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegistrationForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!tenantName.trim()) {
      newErrors.tenantName = 'Organization name is required';
    }
    
    if (!regulatoryFramework) {
      newErrors.regulatoryFramework = 'Regulatory framework is required';
    }
    
    if (!timezone) {
      newErrors.timezone = 'Timezone is required';
    }
    
    if (!adminEmail) {
      newErrors.adminEmail = 'Email is required';
    } else if (!validateEmail(adminEmail)) {
      newErrors.adminEmail = 'Please enter a valid email address';
    }
    
    if (!adminFullName.trim()) {
      newErrors.adminFullName = 'Full name is required';
    }
    
    if (!adminPassword) {
      newErrors.adminPassword = 'Password is required';
    } else if (!validatePassword(adminPassword)) {
      newErrors.adminPassword = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegistrationForm()) return;
    
    setLoading(true);

    try {
      const registerDto: RegisterTenantDto = {
        tenantName: tenantName.trim(),
        regulatoryFrameworkCode: regulatoryFramework,
        timezone,
        adminEmail: adminEmail.trim(),
        adminFullName: adminFullName.trim(),
        adminPassword,
      };

      const result = await registerTenant(registerDto);

      if (result.error) {
        toast({
          title: "Registration Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registration Successful",
        description: "Your organization has been created and you've been logged in.",
      });
      
      // Navigation will happen automatically via useEffect when user is set
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || 'An unexpected error occurred during registration.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginMethod === 'password') {
      if (!validateLoginForm()) return;
    } else {
      if (!email) {
        setErrors({ email: 'Email or phone is required' });
        return;
      } else if (!validateEmail(email)) {
        setErrors({ email: 'Please enter a valid email address or phone number' });
        return;
      }
    }
    
    setLoading(true);

    try {
      if (loginMethod === 'password') {
        // Use new auth API
        await newLoginWithPassword(email.trim(), password);
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
      } else {
        // OTP flow
        await newLoginWithOtp(email.trim());
        toast({
          title: "OTP Sent",
          description: "Please check your email or phone for the verification code.",
        });
        // Navigation to OTP page happens in AuthContext
      }
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred during login.';
      
      if (error.errorCode === 'INVALID_CREDENTIALS') {
        errorMessage = 'Email/phone or password is incorrect.';
      } else if (error.errorCode === 'RATE_LIMITED') {
        errorMessage = 'Too many attempts. Please try again in a few minutes.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLoginError(errorMessage);
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDemoMode = () => {
    if (!email) {
      setErrors({ email: 'Please enter an email address for demo mode' });
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    startDemo(email);
    toast({
      title: "Demo Mode Activated",
      description: "Experience the full platform with demo data. You can switch roles anytime!",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">AIRMAN Academy+</CardTitle>
          <CardDescription>Professional flight training management platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Demo Mode Section */}
          <div className="space-y-3 p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4" />
              <span className="font-semibold text-sm">Try Demo Mode</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Experience the full platform without signing up. Perfect for exploring different user roles and features.
            </p>
            <div className="space-y-2">
              <Input
                placeholder="Enter any email for demo"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: undefined }));
                }}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.email}</AlertDescription>
                </Alert>
              )}
              <Button 
                onClick={handleDemoMode}
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Zap className="mr-2 h-4 w-4" />
                Start Demo Experience
              </Button>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Login Method Toggle */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <Button
                    type="button"
                    variant={loginMethod === 'password' ? 'default' : 'ghost'}
                    className="flex-1"
                    onClick={() => {
                      setLoginMethod('password');
                      setLoginError('');
                      setErrors({});
                    }}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Password
                  </Button>
                  <Button
                    type="button"
                    variant={loginMethod === 'otp' ? 'default' : 'ghost'}
                    className="flex-1"
                    onClick={() => {
                      setLoginMethod('otp');
                      setLoginError('');
                      setErrors({});
                      setPassword('');
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    OTP
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {loginMethod === 'password' ? 'Email' : 'Email or Phone'}
                  </Label>
                  <Input
                    id="email"
                    type={loginMethod === 'password' ? 'email' : 'text'}
                    placeholder={loginMethod === 'password' ? 'Enter your email' : 'Enter your email or phone'}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: undefined }));
                      setLoginError('');
                    }}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.email}</AlertDescription>
                    </Alert>
                  )}
                </div>
                
                {loginMethod === 'password' && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors(prev => ({ ...prev, password: undefined }));
                        setLoginError('');
                      }}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{errors.password}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
                
                {loginError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full" disabled={loading || authLoading}>
                  {loading || authLoading ? (
                    "Signing in..."
                  ) : (
                    <>
                      {loginMethod === 'password' ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Sign In
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send OTP
                        </>
                      )}
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Organization Name</Label>
                  <Input
                    id="tenantName"
                    type="text"
                    placeholder="Enter your organization name"
                    value={tenantName}
                    onChange={(e) => {
                      setTenantName(e.target.value);
                      setErrors(prev => ({ ...prev, tenantName: undefined }));
                    }}
                    className={errors.tenantName ? "border-destructive" : ""}
                  />
                  {errors.tenantName && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.tenantName}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulatoryFramework">Regulatory Framework</Label>
                  <Select
                    value={regulatoryFramework}
                    onValueChange={(value) => {
                      setRegulatoryFramework(value);
                      setErrors(prev => ({ ...prev, regulatoryFramework: undefined }));
                    }}
                  >
                    <SelectTrigger className={errors.regulatoryFramework ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select regulatory framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DGCA">DGCA (India)</SelectItem>
                      {/* Add more frameworks as backend supports them */}
                    </SelectContent>
                  </Select>
                  {errors.regulatoryFramework && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.regulatoryFramework}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={timezone}
                    onValueChange={(value) => {
                      setTimezone(value);
                      setErrors(prev => ({ ...prev, timezone: undefined }));
                    }}
                  >
                    <SelectTrigger className={errors.timezone ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      {/* Add more timezones as needed */}
                    </SelectContent>
                  </Select>
                  {errors.timezone && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.timezone}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminFullName">Your Full Name</Label>
                  <Input
                    id="adminFullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={adminFullName}
                    onChange={(e) => {
                      setAdminFullName(e.target.value);
                      setErrors(prev => ({ ...prev, adminFullName: undefined }));
                    }}
                    className={errors.adminFullName ? "border-destructive" : ""}
                  />
                  {errors.adminFullName && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.adminFullName}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      setErrors(prev => ({ ...prev, adminEmail: undefined }));
                    }}
                    className={errors.adminEmail ? "border-destructive" : ""}
                  />
                  {errors.adminEmail && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.adminEmail}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Create a password (min 8 characters)"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setErrors(prev => ({ ...prev, adminPassword: undefined }));
                    }}
                    className={errors.adminPassword ? "border-destructive" : ""}
                  />
                  {errors.adminPassword && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.adminPassword}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading || authLoading}>
                  {loading || authLoading ? "Creating account..." : "Register Organization"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}