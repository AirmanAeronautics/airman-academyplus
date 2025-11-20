import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { updateProfile, type Institute, type UpdateProfileRequest } from '@/lib/api/auth';
import { handleApiError } from '@/lib/api/handleApiError';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function OnboardingProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshMe, user } = useAuth();
  const { toast } = useToast();
  
  const institute = (location.state as { institute?: Institute })?.institute;
  
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: '',
    country: '',
    timezone: 'Asia/Kolkata',
    roleSelection: 'STUDENT',
    instituteId: institute?.instituteId || '',
    licenseNumber: '',
    studentId: '',
    experienceHours: undefined,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  useEffect(() => {
    if (!institute) {
      navigate('/onboarding/start');
    } else {
      setFormData(prev => ({ ...prev, instituteId: institute.instituteId }));
    }
  }, [institute, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (!formData.timezone) {
      newErrors.timezone = 'Timezone is required';
    }
    if (!formData.instituteId) {
      newErrors.instituteId = 'Institute is required';
    }
    if (formData.roleSelection === 'INSTRUCTOR' && !formData.licenseNumber) {
      newErrors.licenseNumber = 'License number is required for instructors';
    }
    if (formData.roleSelection === 'STUDENT' && !formData.studentId) {
      newErrors.studentId = 'Student ID is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const payload: UpdateProfileRequest = {
        name: formData.name.trim(),
        country: formData.country,
        timezone: formData.timezone,
        roleSelection: formData.roleSelection,
        instituteId: formData.instituteId,
      };

      if (formData.roleSelection === 'INSTRUCTOR') {
        payload.licenseNumber = formData.licenseNumber;
        if (formData.experienceHours) {
          payload.experienceHours = formData.experienceHours;
        }
      } else if (formData.roleSelection === 'STUDENT') {
        payload.studentId = formData.studentId;
      }

      const response = await updateProfile(payload);
      
      // Refresh user data
      await refreshMe();

      toast({
        title: "Profile Updated",
        description: "Your profile has been completed successfully!",
      });

      // Navigation will happen automatically via AuthContext based on role
      const dashboardRoute = 
        response.data.primaryRole === 'ADMIN' ? '/admin/dashboard' :
        response.data.primaryRole === 'INSTRUCTOR' ? '/instructor/dashboard' :
        response.data.primaryRole === 'STUDENT' ? '/student/dashboard' :
        '/';
      
      navigate(dashboardRoute);
    } catch (err: any) {
      const apiError = handleApiError(err);
      
      if (apiError.fieldErrors) {
        setErrors(apiError.fieldErrors);
      } else {
        setGeneralError(apiError.message || 'Failed to update profile. Please try again.');
      }
      
      toast({
        title: "Update Failed",
        description: apiError.message || 'Failed to update profile.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const timezones = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  ];

  const countries = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium',
    'United Arab Emirates', 'Singapore', 'Malaysia', 'Thailand',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            {institute && `Joining: ${institute.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setErrors(prev => ({ ...prev, name: undefined }));
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, country: value }));
                    setErrors(prev => ({ ...prev, country: undefined }));
                  }}
                >
                  <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.country}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone *</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, timezone: value }));
                    setErrors(prev => ({ ...prev, timezone: undefined }));
                  }}
                >
                  <SelectTrigger className={errors.timezone ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timezone && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.timezone}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleSelection">Role *</Label>
              <Select
                value={formData.roleSelection}
                onValueChange={(value: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT') => {
                  setFormData(prev => ({ ...prev, roleSelection: value }));
                  setErrors(prev => ({ ...prev, roleSelection: undefined }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.roleSelection === 'INSTRUCTOR' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    placeholder="Enter your license number"
                    value={formData.licenseNumber}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, licenseNumber: e.target.value }));
                      setErrors(prev => ({ ...prev, licenseNumber: undefined }));
                    }}
                    className={errors.licenseNumber ? "border-destructive" : ""}
                  />
                  {errors.licenseNumber && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{errors.licenseNumber}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceHours">Experience Hours (Optional)</Label>
                  <Input
                    id="experienceHours"
                    type="number"
                    placeholder="Enter total flight hours"
                    value={formData.experienceHours || ''}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, experienceHours: e.target.value ? parseInt(e.target.value) : undefined }));
                    }}
                  />
                </div>
              </>
            )}

            {formData.roleSelection === 'STUDENT' && (
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter your student ID"
                  value={formData.studentId}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, studentId: e.target.value }));
                    setErrors(prev => ({ ...prev, studentId: undefined }));
                  }}
                  className={errors.studentId ? "border-destructive" : ""}
                />
                {errors.studentId && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.studentId}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {generalError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/onboarding/start')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

