import { useState, useEffect } from "react";
import { Home, Briefcase, User, MessageCircle, Bell, Shield, LogOut, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUnreadCount, subscribeToMessages } from "@/lib/messageService";

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Load unread count
  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

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

  const navItems = [
    { icon: Home, label: "Feed", path: "/feed", badge: 0 },
    { icon: Briefcase, label: "Job Board", path: "/jobs", badge: 0 },
    { icon: Search, label: "Search Users", path: "/search", badge: 0 },
    { icon: MessageCircle, label: "Messages", path: "/messages", badge: unreadMessages },
    { icon: Bell, label: "Alerts", path: "/alerts", badge: 0 },
    { icon: User, label: "My Profile", path: "/profile", badge: 0 },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'GU';
    const name = user.user_metadata?.full_name || user.email || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (!user) return 'Guest User';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-gradient-hero text-white">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/feed" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">Paranet</h1>
            <p className="text-xs text-white/60">First Responder Network</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative",
                isActive
                  ? "bg-accent text-white shadow-glow-accent"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  </span>
                )}
              </div>
              <span className="font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="w-10 h-10 border-2 border-white/20">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-white/20 text-white text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{getUserName()}</p>
            <p className="text-xs text-white/60 truncate">
              {user?.email || 'Sign in to continue'}
            </p>
          </div>
        </div>
        {user && (
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </aside>
  );
}
