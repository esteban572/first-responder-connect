import { AppLayout } from "@/components/layout/AppLayout";
import { Bell, Heart, MessageCircle, Briefcase, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const mockAlerts = [
  {
    id: "1",
    type: "job",
    icon: Briefcase,
    title: "New Crisis Job Match",
    description: "A new Travel Paramedic position in Florida matches your preferences.",
    time: "5m ago",
    unread: true,
  },
  {
    id: "2",
    type: "like",
    icon: Heart,
    title: "Marcus Johnson liked your post",
    description: '"12-hour shift done. Nothing beats seeing..."',
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    type: "comment",
    icon: MessageCircle,
    title: "Emily Chen commented on your post",
    description: '"Great work! Keep it up 💪"',
    time: "2h ago",
    unread: false,
  },
  {
    id: "4",
    type: "connection",
    icon: UserPlus,
    title: "James Rodriguez wants to connect",
    description: "Flight Paramedic at Life Flight, Phoenix AZ",
    time: "3h ago",
    unread: false,
  },
  {
    id: "5",
    type: "job",
    icon: Briefcase,
    title: "Application Update",
    description: "Your application for Flight Nurse at AirMed has been viewed.",
    time: "1d ago",
    unread: false,
  },
];

const typeStyles = {
  job: "bg-accent/10 text-accent",
  like: "bg-destructive/10 text-destructive",
  comment: "bg-primary/10 text-primary",
  connection: "bg-success/10 text-success",
};

const Alerts = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <h1 className="text-2xl font-bold font-display mb-1">Alerts</h1>
          <p className="text-muted-foreground">Stay updated on your network</p>
        </div>

        {/* Alerts List */}
        <div className="px-4 md:px-0">
          <div className="feed-card divide-y divide-border">
            {mockAlerts.map((alert) => (
              <button
                key={alert.id}
                className={cn(
                  "w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left",
                  alert.unread && "bg-accent/5"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    typeStyles[alert.type as keyof typeof typeStyles]
                  )}
                >
                  <alert.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={cn("font-semibold text-sm", alert.unread && "text-foreground")}>
                      {alert.title}
                    </h4>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {alert.description}
                  </p>
                </div>
                {alert.unread && (
                  <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {mockAlerts.length === 0 && (
          <div className="px-4 md:px-0">
            <div className="feed-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No alerts yet</h3>
              <p className="text-sm text-muted-foreground">
                You'll see activity from your network here
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Alerts;
