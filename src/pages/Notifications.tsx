import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { NotificationFilter } from "@/components/notifications/NotificationFilter";
import { 
  Bell, 
  Bot, 
  Wrench, 
  Shield, 
  DollarSign, 
  MessageSquare, 
  Target, 
  Settings,
  CheckCircle,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { NotificationCategory } from "@/lib/eventBus";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: NotificationCategory;
  read: boolean;
  created_at: string;
  org_id?: string;
}

const categoryIcons = {
  scheduler: Bot,
  maintenance: Wrench,
  compliance: Shield,
  finance: DollarSign,
  support: MessageSquare,
  marketing: Target,
  system: Settings
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | "all">("all");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate category counts
  const categoryCounts = notifications.reduce((counts, notification) => {
    counts.all = (counts.all || 0) + 1;
    counts[notification.category] = (counts[notification.category] || 0) + 1;
    return counts;
  }, {} as Record<NotificationCategory | "all", number>);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    // Filter notifications based on selected category
    if (selectedCategory === "all") {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(
        notifications.filter(notification => notification.category === selectedCategory)
      );
    }
  }, [notifications, selectedCategory]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications((data || []) as Notification[]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = filteredNotifications
        .filter(n => !n.read)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds)
        .eq("user_id", user?.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          unreadIds.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      );

      toast({
        title: "Success",
        description: `Marked ${unreadIds.length} notifications as read`,
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error", 
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (category: NotificationCategory) => {
    const Icon = categoryIcons[category] || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category: NotificationCategory) => {
    const colors = {
      scheduler: "text-blue-600",
      maintenance: "text-orange-600", 
      compliance: "text-green-600",
      finance: "text-purple-600",
      support: "text-yellow-600",
      marketing: "text-pink-600",
      system: "text-gray-600"
    };
    return colors[category] || "text-gray-600";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading notifications...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            AI agent updates and system notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      <NotificationFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {selectedCategory === "all" 
              ? "All Notifications" 
              : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Notifications`
            }
            {filteredNotifications.length > 0 && (
              <Badge variant="secondary">
                {filteredNotifications.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notifications found{selectedCategory !== "all" && ` for ${selectedCategory}`}
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`p-4 rounded-lg transition-colors ${
                        notification.read 
                          ? "bg-muted/30" 
                          : "bg-primary/5 border border-primary/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={getCategoryColor(notification.category)}>
                          {getNotificationIcon(notification.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">
                              {notification.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { 
                                addSuffix: true 
                              })}
                            </span>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 px-2 text-xs"
                              >
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < filteredNotifications.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}