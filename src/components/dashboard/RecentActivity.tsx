import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ActivityItem {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
  avatar?: string
}

const recentActivities: ActivityItem[] = [
  {
    id: "1",
    user: "Sarah Wilson",
    action: "completed",
    target: "CPL Theory Exam",
    timestamp: "2 minutes ago",
  },
  {
    id: "2", 
    user: "Mike Chen",
    action: "scheduled",
    target: "B737 Type Rating Flight",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    user: "John Smith",
    action: "updated",
    target: "Aircraft maintenance log",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    user: "Emma Davis",
    action: "submitted",
    target: "Training progress report",
    timestamp: "2 hours ago",
  },
]

export function RecentActivity() {
  return (
    <div className="aviation-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {activity.user.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{activity.user}</span>
                <span className="text-muted-foreground"> {activity.action} </span>
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}