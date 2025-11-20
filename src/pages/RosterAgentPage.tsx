import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useRosterAI } from '@/hooks/useRosterAI';
import { apiClient } from '@/lib/apiClient';

interface Aircraft {
  id: string;
  registration: string;
  make_model: string;
  status: string;
}

interface Instructor {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  program_id: string;
}

export default function RosterAgentPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedAircraft, setSelectedAircraft] = useState<string>('');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  const { loading, suggestions, createdSorties, generateSuggestions, acceptSuggestion, refreshSorties } = useRosterAI();

  useEffect(() => {
    loadData();
    refreshSorties();
  }, []);

  const loadData = async () => {
    try {
      // Load aircraft
      const aircraftRes = await apiClient.get<any>('/fleet/aircraft');
      setAircraft(aircraftRes.data || []);

      // Load instructors
      const instructorsRes = await apiClient.get<any>('/users?role=INSTRUCTOR');
      setInstructors(instructorsRes.data || []);

      // Load students
      const studentsRes = await apiClient.get<any>('/training/students');
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!selectedStudent || !selectedInstructor || !selectedAircraft) {
      return;
    }
    await generateSuggestions(selectedStudent, selectedInstructor, selectedAircraft);
  };

  const handleAcceptSuggestion = async (suggestion: any) => {
    await acceptSuggestion(suggestion, {
      student_id: selectedStudent,
      instructor_id: selectedInstructor,
      aircraft_id: selectedAircraft,
      start_at: suggestion.start_at,
      end_at: suggestion.end_at,
    });
    await refreshSorties();
  };

  const canGenerateSuggestions = selectedStudent && selectedInstructor && selectedAircraft;

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Roster Agent
            </h1>
            <p className="text-muted-foreground mt-1">
              Intelligent scheduling powered by operational data
            </p>
          </div>
        </div>

        {/* Input Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Aircraft Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aircraft</CardTitle>
              <CardDescription>Select available aircraft</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose aircraft" />
                </SelectTrigger>
                <SelectContent>
                  {aircraft.filter(a => a.status === 'operational').map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.registration} - {a.make_model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Instructor Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructor</CardTitle>
              <CardDescription>Select instructor</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map(i => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Student Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student</CardTitle>
              <CardDescription>Select student</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerateSuggestions}
            disabled={!canGenerateSuggestions || loading}
            className="px-8"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Suggest Schedule
              </>
            )}
          </Button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Select the best time slot for your sortie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {new Date(suggestion.start_at).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(suggestion.end_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                      </Badge>
                      <Badge variant="outline">
                        Weather: {(suggestion.weather_score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <Button onClick={() => handleAcceptSuggestion(suggestion)}>
                    Accept
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Created Sorties */}
        {createdSorties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Sorties</CardTitle>
              <CardDescription>Recently created training flights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {createdSorties.map((sortie) => (
                  <div
                    key={sortie.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">
                          {new Date(sortie.start_at).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Status: {sortie.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sortie.dispatch_risk === 'high' && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          High Risk
                        </Badge>
                      )}
                      {sortie.dispatch_risk === 'medium' && (
                        <Badge variant="outline" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Medium Risk
                        </Badge>
                      )}
                      {sortie.dispatch_risk === 'low' && (
                        <Badge variant="outline" className="text-green-600 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Low Risk
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
