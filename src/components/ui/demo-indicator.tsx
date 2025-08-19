import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, RotateCcw, X } from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";

export function DemoIndicator() {
  const { isDemoMode, demoUser, resetDemo, exitDemo } = useDemo();

  if (!isDemoMode || !demoUser) return null;

  return (
    <Card className="mb-4 border-primary/20 bg-primary/5">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary text-primary-foreground">
              <Zap className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
            <span className="text-sm">
              Experiencing as <strong>{demoUser.role.replace('_', ' ')}</strong> 
              {demoUser.flight_school_name && (
                <span className="text-muted-foreground"> at {demoUser.flight_school_name}</span>
              )}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetDemo}
              className="text-primary hover:text-primary"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Try Different Role
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={exitDemo}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Exit Demo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}