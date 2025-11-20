import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Plane, 
  User, 
  GraduationCap, 
  Brain, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Fuel,
  Wrench,
  MapPin,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface Aircraft {
  id: string;
  registration: string;
  type: string;
  available: boolean;
  fuel: number;
  maintenanceDue: boolean;
}

interface Instructor {
  id: string;
  name: string;
  license: string;
  workingHours: string;
  maxSorties: number;
  available: boolean;
}

interface Student {
  id: string;
  name: string;
  program: string;
  lesson: string;
  stage: string;
  restrictions: string;
}

interface RosterEntry {
  id: string;
  student: string;
  instructor: string;
  aircraft: string;
  timeBlock: string;
  lesson: string;
  status: "ready" | "pending" | "conflict";
  notes: string;
}

interface RosterVariant {
  name: string;
  description: string;
  entries: RosterEntry[];
  score: number;
}

export default function AirmanRosterDemo() {
  const { toast } = useToast();
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rosterVariants, setRosterVariants] = useState<RosterVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputsPanelOpen, setInputsPanelOpen] = useState(true);

  // Aircraft form state
  const [newAircraft, setNewAircraft] = useState({
    registration: "",
    type: "C172",
    fuel: 100,
    maintenanceDue: false
  });

  // Instructor form state
  const [newInstructor, setNewInstructor] = useState({
    name: "",
    license: "CFI",
    workingHours: "08:00-18:00",
    maxSorties: 4
  });

  // Student form state
  const [newStudent, setNewStudent] = useState({
    name: "",
    program: "PPL",
    lesson: "",
    stage: "Intermediate",
    restrictions: ""
  });

  const addAircraft = () => {
    if (!newAircraft.registration) return;
    setAircraft([...aircraft, {
      id: Date.now().toString(),
      registration: newAircraft.registration,
      type: newAircraft.type,
      available: true,
      fuel: newAircraft.fuel,
      maintenanceDue: newAircraft.maintenanceDue
    }]);
    setNewAircraft({ registration: "", type: "C172", fuel: 100, maintenanceDue: false });
    toast({ title: "Aircraft added", description: `${newAircraft.registration} added successfully` });
  };

  const addInstructor = () => {
    if (!newInstructor.name) return;
    setInstructors([...instructors, {
      id: Date.now().toString(),
      name: newInstructor.name,
      license: newInstructor.license,
      workingHours: newInstructor.workingHours,
      maxSorties: newInstructor.maxSorties,
      available: true
    }]);
    setNewInstructor({ name: "", license: "CFI", workingHours: "08:00-18:00", maxSorties: 4 });
    toast({ title: "Instructor added", description: `${newInstructor.name} added successfully` });
  };

  const addStudent = () => {
    if (!newStudent.name) return;
    setStudents([...students, {
      id: Date.now().toString(),
      name: newStudent.name,
      program: newStudent.program,
      lesson: newStudent.lesson,
      stage: newStudent.stage,
      restrictions: newStudent.restrictions
    }]);
    setNewStudent({ name: "", program: "PPL", lesson: "", stage: "Intermediate", restrictions: "" });
    toast({ title: "Student added", description: `${newStudent.name} added successfully` });
  };

  const generateRosterAI = () => {
    if (aircraft.length === 0 || instructors.length === 0 || students.length === 0) {
      toast({
        title: "Insufficient Data",
        description: "Please add at least one aircraft, instructor, and student",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI processing
    setTimeout(() => {
      const timeBlocks = ["06:00-08:00", "08:00-10:00", "10:00-12:00", "14:00-16:00", "16:00-18:00"];
      
      const generateVariant = (name: string, description: string, priorityFactor: string): RosterVariant => {
        const entries: RosterEntry[] = students.map((student, idx) => {
          const instructor = instructors[idx % instructors.length];
          const ac = aircraft[idx % aircraft.length];
          const timeBlock = timeBlocks[idx % timeBlocks.length];
          
          let status: "ready" | "pending" | "conflict" = "ready";
          let notes = "All systems nominal";
          
          if (ac.maintenanceDue) {
            status = "conflict";
            notes = "Aircraft maintenance required";
          } else if (ac.fuel < 30) {
            status = "pending";
            notes = "Low fuel - refuel required";
          }

          return {
            id: `sortie-${idx + 1}`,
            student: student.name,
            instructor: instructor.name,
            aircraft: ac.registration,
            timeBlock,
            lesson: student.lesson || "General Flight Training",
            status,
            notes
          };
        });

        let score = 85;
        if (priorityFactor === "utilization") score = 95;
        if (priorityFactor === "fatigue") score = 88;
        if (priorityFactor === "weather") score = 92;

        return { name, description, entries, score };
      };

      const variants: RosterVariant[] = [
        generateVariant(
          "Max Utilization",
          "Optimized for maximum aircraft and instructor utilization throughout the day",
          "utilization"
        ),
        generateVariant(
          "Min Instructor Fatigue",
          "Balanced workload distribution with adequate breaks between sorties",
          "fatigue"
        ),
        generateVariant(
          "Weather-Optimized",
          "Scheduled around predicted weather windows and student experience levels",
          "weather"
        )
      ];

      setRosterVariants(variants);
      setSelectedVariant(0);
      setIsGenerating(false);
      
      toast({
        title: "AI Roster Generated",
        description: "3 optimized variants ready for review"
      });
    }, 2500);
  };

  const dispatchSortie = (sortieId: string) => {
    toast({
      title: "Sortie Dispatched",
      description: `${sortieId} cleared for departure`,
      duration: 3000
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "pending": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "conflict": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Plane className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AIRMAN Academy+</h1>
                <p className="text-sm text-muted-foreground">AI Roster & Dispatch Agent Demo</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-2">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Inputs Panel */}
          <div className={`lg:col-span-3 space-y-4 ${!inputsPanelOpen && 'lg:col-span-1'}`}>
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Inputs Panel</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setInputsPanelOpen(!inputsPanelOpen)}
                  >
                    <ChevronRight className={`h-4 w-4 transition-transform ${inputsPanelOpen ? 'rotate-90' : ''}`} />
                  </Button>
                </div>
                <CardDescription>Configure resources for roster generation</CardDescription>
              </CardHeader>
              
              {inputsPanelOpen && (
                <CardContent className="space-y-6">
                  {/* Aircraft Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Aircraft ({aircraft.length})</h3>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Registration (e.g., N123AB)"
                        value={newAircraft.registration}
                        onChange={(e) => setNewAircraft({...newAircraft, registration: e.target.value})}
                      />
                      <Select value={newAircraft.type} onValueChange={(v) => setNewAircraft({...newAircraft, type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="C152">Cessna 152</SelectItem>
                          <SelectItem value="C172">Cessna 172</SelectItem>
                          <SelectItem value="PA28">Piper PA-28</SelectItem>
                          <SelectItem value="DA40">Diamond DA40</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Fuel %</Label>
                          <Input
                            type="number"
                            value={newAircraft.fuel}
                            onChange={(e) => setNewAircraft({...newAircraft, fuel: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button variant="outline" size="sm" onClick={() => setNewAircraft({...newAircraft, maintenanceDue: !newAircraft.maintenanceDue})}>
                            <Wrench className={`h-4 w-4 ${newAircraft.maintenanceDue ? 'text-red-500' : ''}`} />
                          </Button>
                        </div>
                      </div>
                      <Button onClick={addAircraft} className="w-full" size="sm">Add Aircraft</Button>
                    </div>
                    <ScrollArea className="h-24">
                      {aircraft.map((ac) => (
                        <div key={ac.id} className="text-xs p-2 border rounded mb-1 flex items-center justify-between">
                          <span className="font-medium">{ac.registration}</span>
                          <div className="flex gap-1">
                            {ac.maintenanceDue && <Wrench className="h-3 w-3 text-red-500" />}
                            {ac.fuel < 30 && <Fuel className="h-3 w-3 text-amber-500" />}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  <Separator />

                  {/* Instructor Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Instructors ({instructors.length})</h3>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Instructor Name"
                        value={newInstructor.name}
                        onChange={(e) => setNewInstructor({...newInstructor, name: e.target.value})}
                      />
                      <Select value={newInstructor.license} onValueChange={(v) => setNewInstructor({...newInstructor, license: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FI">FI (Flight Instructor)</SelectItem>
                          <SelectItem value="CFI">CFI (Chief Flight Instructor)</SelectItem>
                          <SelectItem value="IRI">IRI (Instrument Rating Instructor)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Working hours (e.g., 08:00-18:00)"
                        value={newInstructor.workingHours}
                        onChange={(e) => setNewInstructor({...newInstructor, workingHours: e.target.value})}
                      />
                      <Button onClick={addInstructor} className="w-full" size="sm">Add Instructor</Button>
                    </div>
                    <ScrollArea className="h-24">
                      {instructors.map((inst) => (
                        <div key={inst.id} className="text-xs p-2 border rounded mb-1">
                          <span className="font-medium">{inst.name}</span>
                          <span className="text-muted-foreground ml-1">({inst.license})</span>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  <Separator />

                  {/* Student Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Students ({students.length})</h3>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Student Name"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      />
                      <Select value={newStudent.program} onValueChange={(v) => setNewStudent({...newStudent, program: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PPL">PPL - Private Pilot License</SelectItem>
                          <SelectItem value="CPL">CPL - Commercial Pilot License</SelectItem>
                          <SelectItem value="IR">IR - Instrument Rating</SelectItem>
                          <SelectItem value="ME">ME - Multi-Engine</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Lesson/Maneuver (e.g., Circuits)"
                        value={newStudent.lesson}
                        onChange={(e) => setNewStudent({...newStudent, lesson: e.target.value})}
                      />
                      <Select value={newStudent.stage} onValueChange={(v) => setNewStudent({...newStudent, stage: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addStudent} className="w-full" size="sm">Add Student</Button>
                    </div>
                    <ScrollArea className="h-24">
                      {students.map((student) => (
                        <div key={student.id} className="text-xs p-2 border rounded mb-1">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-muted-foreground ml-1">({student.program})</span>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* CENTER - AI Roster Engine */}
          <div className={`${inputsPanelOpen ? 'lg:col-span-6' : 'lg:col-span-8'} space-y-4`}>
            <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Roster Engine
                </CardTitle>
                <CardDescription>Generate optimized flight training schedules using AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={generateRosterAI}
                  disabled={isGenerating}
                  className="w-full h-16 text-lg font-semibold bg-primary hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                      Analyzing Resources...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-5 w-5" />
                      RUN ROSTER AI
                    </>
                  )}
                </Button>

                {rosterVariants.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {rosterVariants.map((variant, idx) => (
                        <Button
                          key={idx}
                          variant={selectedVariant === idx ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedVariant(idx)}
                          className="flex-1"
                        >
                          {variant.name}
                          <Badge variant="secondary" className="ml-2">{variant.score}</Badge>
                        </Button>
                      ))}
                    </div>
                    
                    {selectedVariant !== null && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{rosterVariants[selectedVariant].name}</CardTitle>
                          <CardDescription className="text-xs">{rosterVariants[selectedVariant].description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[500px]">
                            <div className="space-y-2">
                              {rosterVariants[selectedVariant].entries.map((entry) => (
                                <Card key={entry.id} className="p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge className={getStatusColor(entry.status)}>
                                        {entry.status === "ready" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                        {entry.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                        {entry.status === "conflict" && <AlertTriangle className="h-3 w-3 mr-1" />}
                                        {entry.status.toUpperCase()}
                                      </Badge>
                                      <span className="font-mono text-xs text-muted-foreground">{entry.id}</span>
                                    </div>
                                    <Badge variant="outline">{entry.timeBlock}</Badge>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                                    <div>
                                      <span className="text-muted-foreground text-xs">Student</span>
                                      <p className="font-medium">{entry.student}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground text-xs">Instructor</span>
                                      <p className="font-medium">{entry.instructor}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground text-xs">Aircraft</span>
                                      <p className="font-medium">{entry.aircraft}</p>
                                    </div>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-muted-foreground text-xs">Lesson</span>
                                    <p className="text-sm">{entry.lesson}</p>
                                  </div>
                                  <div className="flex items-center justify-between pt-2 border-t">
                                    <p className="text-xs text-muted-foreground">{entry.notes}</p>
                                    {entry.status === "ready" && (
                                      <Button size="sm" onClick={() => dispatchSortie(entry.id)}>
                                        Dispatch
                                      </Button>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR - Dispatch Panel */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Dispatch Panel</CardTitle>
                <CardDescription>Environmental & operational briefing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Weather Summary */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Weather Summary</h3>
                  </div>
                  <Card className="p-3 bg-muted/50">
                    <div className="space-y-1 text-xs">
                      <p><strong>METAR:</strong> VFR conditions</p>
                      <p><strong>Wind:</strong> 090° at 8 kts</p>
                      <p><strong>Visibility:</strong> 10+ km</p>
                      <p><strong>Ceiling:</strong> FEW040 SCT120</p>
                      <p><strong>Temp:</strong> 18°C / Dewpoint: 12°C</p>
                    </div>
                  </Card>
                </div>

                <Separator />

                {/* NOTAM Summary */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <h3 className="font-semibold text-sm">NOTAM Summary</h3>
                  </div>
                  <Card className="p-3 bg-muted/50">
                    <div className="space-y-1 text-xs">
                      <p>✓ All runways operational</p>
                      <p>⚠️ Taxiway B under maintenance</p>
                      <p>✓ Tower frequency: 118.3</p>
                      <p>✓ ATIS: 127.75</p>
                    </div>
                  </Card>
                </div>

                <Separator />

                {/* Briefing Notes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Briefing Notes</h3>
                  </div>
                  <Card className="p-3 bg-muted/50">
                    <ul className="space-y-1 text-xs list-disc list-inside">
                      <li>Standard circuit operations in effect</li>
                      <li>Increased traffic expected 10:00-12:00</li>
                      <li>Student solo flights approved</li>
                      <li>Bird activity reported at field</li>
                    </ul>
                  </Card>
                </div>

                <Separator />

                {/* Dispatch Checklist */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Dispatch Checklist</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" className="rounded" defaultChecked />
                      Weather briefing reviewed
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" className="rounded" defaultChecked />
                      NOTAMs acknowledged
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" className="rounded" defaultChecked />
                      Aircraft pre-flight complete
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" className="rounded" />
                      Flight plan filed
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
