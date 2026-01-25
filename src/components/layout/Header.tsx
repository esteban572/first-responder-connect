import { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getUnreadNotificationCount, subscribeToNotifications } from "@/lib/notificationService";

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Load unread notification count
  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.id, () => {
      loadUnreadCount();
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const loadUnreadCount = async () => {
    const count = await getUnreadNotificationCount();
    setUnreadNotifications(count);
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/feed" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
            <img src="/logo.svg" alt="Paranet Logo" className="w-full h-full object-contain p-0.5" />
          </div>
          <span className="text-lg font-display font-bold">Paranet</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => navigate('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground relative"
            onClick={() => navigate('/alerts')}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-accent rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold px-0.5">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
