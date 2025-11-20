import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Building, MapPin, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthBackend } from '@/hooks/useAuthBackend';

interface SchoolSelectionProps {
  aviationRegion: string;
  value?: string;
  onChange: (schoolId?: string, needsApproval?: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}

interface FlightSchool {
  id: string;
  name: string;
  aviation_region: string;
  country: string;
  admin_user_id?: string;
  metadata?: any;
}

const countries = {
  faa: ['United States'],
  easa: ['Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Austria', 'Portugal', 'Poland', 'Other EU'],
  uk_caa: ['United Kingdom'],
  dgca_india: ['India']
};

export function SchoolSelection({ aviationRegion, value, onChange, onNext, onBack, loading }: SchoolSelectionProps) {
  const [schools, setSchools] = useState<FlightSchool[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string | undefined>(value);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const { toast } = useToast();
  const { user } = useAuthBackend();

  // New school form state
  const [newSchool, setNewSchool] = useState({
    name: '',
    country: '',
    address: '',
    established: ''
  });

  useEffect(() => {
    fetchSchools();
  }, [aviationRegion]);

  const fetchSchools = async () => {
    try {
      setLoadingSchools(true);
      const { data, error } = await supabase
        .from('flight_schools')
        .select('*')
        .eq('aviation_region', aviationRegion)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading schools",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingSchools(false);
    }
  };

  const createNewSchool = async () => {
    if (!newSchool.name || !newSchool.country) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('flight_schools')
        .insert([{
          name: newSchool.name,
          aviation_region: aviationRegion,
          country: newSchool.country,
          admin_user_id: user?.id,
          metadata: {
            address: newSchool.address,
            established: newSchool.established,
            student_count: 0,
            instructor_count: 1
          }
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "School created successfully!",
        description: "You've been assigned as the administrator",
        variant: "default"
      });

      setShowCreateDialog(false);
      setNewSchool({ name: '', country: '', address: '', established: '' });
      await fetchSchools();
      
      // Auto-select the new school (no approval needed since user created it)
      setSelectedSchool(data.id);
      onChange(data.id, false);
    } catch (error: any) {
      toast({
        title: "Error creating school",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId);
    // If user is creating/admin of the school, no approval needed
    const school = schools.find(s => s.id === schoolId);
    const needsApproval = school?.admin_user_id !== user?.id;
    onChange(schoolId, needsApproval);
  };

  const handleSkip = () => {
    setSelectedSchool(undefined);
    onChange(undefined, false);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Join a flight school</h3>
        <p className="text-muted-foreground">
          Connect with an existing school or create your own training organization
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flight schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Flight School</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="school-name">School Name *</Label>
                  <Input
                    id="school-name"
                    value={newSchool.name}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label htmlFor="school-country">Country *</Label>
                  <Select
                    value={newSchool.country}
                    onValueChange={(value) => setNewSchool(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries[aviationRegion as keyof typeof countries]?.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="school-address">Address</Label>
                  <Input
                    id="school-address"
                    value={newSchool.address}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter school address"
                  />
                </div>
                <div>
                  <Label htmlFor="school-established">Established Year</Label>
                  <Input
                    id="school-established"
                    value={newSchool.established}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, established: e.target.value }))}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createNewSchool}>
                    Create School
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loadingSchools ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading schools...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredSchools.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No schools found</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    No flight schools found for your region. Create a new one to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredSchools.map((school) => {
                const isSelected = selectedSchool === school.id;
                const isOwner = school.admin_user_id === user?.id;
                
                return (
                  <Card 
                    key={school.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSchoolSelect(school.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Building className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{school.name}</h4>
                            <div className="flex gap-2">
                              {isOwner && <Badge variant="secondary">Owner</Badge>}
                              {isSelected && <Badge variant="default">Selected</Badge>}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {school.country}
                            </div>
                            {school.metadata?.student_count !== undefined && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {school.metadata.student_count} students
                              </div>
                            )}
                            {school.metadata?.established && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Est. {school.metadata.established}
                              </div>
                            )}
                          </div>

                          {school.metadata?.address && (
                            <p className="text-sm text-muted-foreground">
                              {school.metadata.address}
                            </p>
                          )}

                          {isSelected && !isOwner && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mt-2">
                              <p className="text-sm text-yellow-800">
                                Your request to join this school will need approval from the administrator.
                                You'll have 2 weeks of trial access while waiting.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button 
            onClick={onNext} 
            disabled={loading}
            className="min-w-24"
          >
            {loading ? "Setting up..." : "Complete"}
          </Button>
        </div>
      </div>
    </div>
  );
}