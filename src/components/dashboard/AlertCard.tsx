import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"

interface AlertCardProps {
  type: "success" | "warning" | "error" | "info"
  title: string
  description: string
  timestamp?: string
}

export function AlertCard({ type, title, description, timestamp }: AlertCardProps) {
  const getAlertConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-success",
          bgColor: "bg-success/10",
          borderColor: "border-success/20"
        }
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/20"
        }
      case "error":
        return {
          icon: XCircle,
          iconColor: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/20"
        }
      default:
        return {
          icon: Info,
          iconColor: "text-primary",
          bgColor: "bg-primary/10",
          borderColor: "border-primary/20"
        }
    }
  }

  const config = getAlertConfig()
  const Icon = config.icon

  return (
    <div className={`aviation-card p-4 border-l-4 ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor}`}>
          <Icon className={`h-4 w-4 ${config.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {timestamp && (
            <p className="text-xs text-muted-foreground mt-2">{timestamp}</p>
          )}
        </div>
      </div>
    </div>
  )
}