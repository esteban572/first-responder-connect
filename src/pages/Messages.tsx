import { AppLayout } from "@/components/layout/AppLayout";
import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const mockConversations = [
  {
    id: "1",
    user: {
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "Firefighter/Paramedic",
    },
    lastMessage: "Hey! Are you going to the conference next month?",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    user: {
      name: "Emily Chen",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      role: "EMT-P, Tactical Medic",
    },
    lastMessage: "Thanks for the recommendation! I'll check it out.",
    time: "1h ago",
    unread: false,
  },
  {
    id: "3",
    user: {
      name: "James Rodriguez",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      role: "Flight Paramedic",
    },
    lastMessage: "That was an incredible save yesterday. Great teamwork!",
    time: "3h ago",
    unread: false,
  },
];

const Messages = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <h1 className="text-2xl font-bold font-display mb-1">Messages</h1>
          <p className="text-muted-foreground">Connect with your network</p>
        </div>

        {/* Search */}
        <div className="px-4 md:px-0 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </div>

        {/* Conversations List */}
        <div className="px-4 md:px-0">
          <div className="feed-card divide-y divide-border">
            {mockConversations.map((convo) => (
              <button
                key={convo.id}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="relative">
                  <img
                    src={convo.user.avatar}
                    alt={convo.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {convo.unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-semibold text-sm truncate ${convo.unread ? "text-foreground" : ""}`}>
                      {convo.user.name}
                    </h4>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {convo.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {convo.user.role}
                  </p>
                  <p className={`text-sm truncate mt-1 ${convo.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {convo.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Empty State (hidden when conversations exist) */}
        {mockConversations.length === 0 && (
          <div className="px-4 md:px-0">
            <div className="feed-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                Start connecting with other first responders
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Messages;
