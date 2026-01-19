import { useState, useEffect } from "react";
import { Home, Briefcase, MessageCircle, Bell, Settings, CalendarDays, Award, Newspaper, Search, Wrench, Building2, User, Video } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getUnreadCount, subscribeToMessages } from "@/lib/messageService";
import { getExpiringCredentialsCount } from "@/lib/credentialService";

export function MobileNav() {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [expiringCredentials, setExpiringCredentials] = useState(0);

  // Load unread count and expiring credentials
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      loadExpiringCredentials();
    }
  }, [user]);

  const loadExpiringCredentials = async () => {
    const count = await getExpiringCredentialsCount();
    setExpiringCredentials(count);
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToMessages(user.id, () => {
      loadUnreadCount();
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Reload count when navigating away from messages
  useEffect(() => {
    if (user && location.pathname !== '/messages') {
      loadUnreadCount();
    }
  }, [location.pathname, user]);

  const loadUnreadCount = async () => {
    const count = await getUnreadCount();
    setUnreadMessages(count);
  };

  // Primary items first, then secondary items, settings last
  const primaryItems = [
    { icon: Home, label: "Feed", path: "/feed", badge: 0 },
    { icon: MessageCircle, label: "Messages", path: "/messages", badge: unreadMessages },
    { icon: User, label: "Profile", path: "/profile", badge: 0 },
    { icon: Bell, label: "Alerts", path: "/alerts", badge: 0 },
    { icon: Search, label: "Search", path: "/search", badge: 0 },
  ];

  const secondaryItems = [
    { icon: Briefcase, label: "Jobs", path: "/jobs", badge: 0 },
    { icon: CalendarDays, label: "Events", path: "/events", badge: 0 },
    { icon: Video, label: "Meetings", path: "/meetings", badge: 0 },
    { icon: Newspaper, label: "Blog", path: "/blog", badge: 0 },
    { icon: Award, label: "Credentials", path: "/credentials", badge: expiringCredentials },
    { icon: Wrench, label: "Gear", path: "/gear", badge: 0 },
    { icon: Building2, label: "Agencies", path: "/agencies", badge: 0 },
  ];

  // Settings at the end, Admin after settings for admins
  const navItems = isAdmin
    ? [...primaryItems, ...secondaryItems, { icon: Settings, label: "Settings", path: "/settings", badge: 0 }, { icon: Settings, label: "Admin", path: "/admin", badge: 0 }]
    : [...primaryItems, ...secondaryItems, { icon: Settings, label: "Settings", path: "/settings", badge: 0 }];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Subtle gradient overlay background */}
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card to-card/95 border-t border-border backdrop-blur-sm" />

      {/* Scroll fade indicators */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

      <div className="relative overflow-x-auto scrollbar-hide safe-area-inset-bottom">
        <div className="flex items-center gap-0.5 py-3 px-1 min-w-max">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1.5 w-16 py-2 rounded-xl transition-colors relative flex-shrink-0",
                  isActive
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-accent rounded-full flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
