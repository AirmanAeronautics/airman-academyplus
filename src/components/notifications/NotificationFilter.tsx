import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Bot, 
  Wrench, 
  Shield, 
  DollarSign, 
  MessageSquare, 
  Target, 
  Settings
} from "lucide-react";
import type { NotificationCategory } from "@/lib/eventBus";

interface NotificationFilterProps {
  selectedCategory: NotificationCategory | "all";
  onCategoryChange: (category: NotificationCategory | "all") => void;
  categoryCounts: Record<NotificationCategory | "all", number>;
}

const categoryConfig = {
  all: { label: "All", icon: Settings, color: "default" as const },
  scheduler: { label: "Scheduler", icon: Bot, color: "blue" as const },
  maintenance: { label: "Maintenance", icon: Wrench, color: "orange" as const },
  compliance: { label: "Compliance", icon: Shield, color: "green" as const },
  finance: { label: "Finance", icon: DollarSign, color: "purple" as const },
  support: { label: "Support", icon: MessageSquare, color: "yellow" as const },
  marketing: { label: "Marketing", icon: Target, color: "pink" as const },
  system: { label: "System", icon: Settings, color: "gray" as const }
};

export function NotificationFilter({ 
  selectedCategory, 
  onCategoryChange, 
  categoryCounts 
}: NotificationFilterProps) {
  return (
    <Card className="p-4">
      <h3 className="font-medium mb-3">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const category = key as NotificationCategory | "all";
          const count = categoryCounts[category] || 0;
          const isSelected = selectedCategory === category;
          const Icon = config.icon;
          
          return (
            <Button
              key={category}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="flex items-center gap-2"
            >
              <Icon className="h-3 w-3" />
              {config.label}
              {count > 0 && (
                <Badge 
                  variant={isSelected ? "secondary" : "default"} 
                  className="ml-1 h-4 px-1.5 text-xs"
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}