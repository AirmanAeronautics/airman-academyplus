import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, MapPin, Users, Plane, Plus } from 'lucide-react';
import { demoFlightSchools } from '@/data/demoData';

interface DemoSchoolSelectionProps {
  aviationRegion: string;
  value?: string;
  onChange: (schoolId: string, schoolName: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function DemoSchoolSelection({ 
  aviationRegion, 
  value, 
  onChange, 
  onNext, 
  onBack, 
  loading 
}: DemoSchoolSelectionProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');

  const filteredSchools = demoFlightSchools.filter(
    school => school.aviation_region === aviationRegion
  );

  const handleSchoolSelect = (schoolId: string, schoolName: string) => {
    onChange(schoolId, schoolName);
  };

  const handleCreateSchool = () => {
    if (!newSchoolName.trim()) return;
    
    const newSchoolId = `demo-custom-${Date.now()}`;
    onChange(newSchoolId, newSchoolName);
    setShowCreateForm(false);
    setNewSchoolName('');
  };

  const selectedSchool = filteredSchools.find(school => school.id === value);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Select Your Flight School</h3>
        <p className="text-sm text-muted-foreground">
          Choose from available schools in the {aviationRegion} region or create a new one
        </p>
      </div>

      <ScrollArea className="h-96">
        <div className="grid gap-4">
          {filteredSchools.map((school) => (
            <Card
              key={school.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                value === school.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => handleSchoolSelect(school.id, school.name)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">{school.name}</h4>
                    {value === school.id && (
                      <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {school.location}
                  </div>
                  
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {school.students} students
                    </div>
                    <div className="flex items-center gap-1">
                      <Plane className="h-3 w-3" />
                      {school.aircraft_fleet.length} aircraft types
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {school.aircraft_fleet.slice(0, 3).map((aircraft) => (
                      <Badge key={aircraft} variant="outline" className="text-xs">
                        {aircraft}
                      </Badge>
                    ))}
                    {school.aircraft_fleet.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{school.aircraft_fleet.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Create New School Option */}
          {!showCreateForm ? (
            <Card
              className="p-4 cursor-pointer transition-all hover:shadow-md border-dashed border-2 hover:bg-muted/50"
              onClick={() => setShowCreateForm(true)}
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Plus className="h-4 w-4" />
                <span>Create New Flight School</span>
              </div>
            </Card>
          ) : (
            <Card className="p-4 border-2 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Create New Flight School</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="school-name">School Name</Label>
                  <Input
                    id="school-name"
                    placeholder="Enter flight school name"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateSchool}
                    disabled={!newSchoolName.trim()}
                    size="sm"
                  >
                    Create School
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewSchoolName('');
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!value || loading}
        >
          {loading ? "Setting up demo..." : "Complete Demo Setup"}
        </Button>
      </div>

      {selectedSchool && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Demo School Details</h4>
          <p className="text-sm text-muted-foreground">
            You'll experience the platform as if you're part of <strong>{selectedSchool.name}</strong> 
            {' '}in {selectedSchool.location}. All data shown will be demo data for training purposes.
          </p>
        </div>
      )}
    </div>
  );
}