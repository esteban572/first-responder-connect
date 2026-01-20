import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Bell, Heart, MessageCircle, Briefcase, UserPlus, X, Trash2, Check, UserCheck, UserX, Award, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotifications,
  deleteNotification,
  clearAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
  subscribeToNotifications,
} from "@/lib/notificationService";
import {
  getPendingConnectionRequests,
  acceptConnection,
  declineConnection,
} from "@/lib/userService";
import {
  getUserPendingOrgInvites,
  acceptOrgInvite,
  declineOrgInvite,
  PendingOrgInvite,
} from "@/lib/organizationService";
import { UserProfile } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PendingRequest {
  id: string;
  user_id: string;
  created_at: string;
  user: UserProfile;
}

const typeStyles: Record<string, string> = {
  job: "bg-accent/10 text-accent",
  like: "bg-destructive/10 text-destructive",
  comment: "bg-primary/10 text-primary",
  connection: "bg-green-500/10 text-green-500",
  message: "bg-blue-500/10 text-blue-500",
  credential_expiring: "bg-amber-500/10 text-amber-500",
  credential_expired: "bg-red-500/10 text-red-500",
};

const typeIcons: Record<string, typeof Bell> = {
  job: Briefcase,
  like: Heart,
  comment: MessageCircle,
  connection: UserPlus,
  message: MessageCircle,
  credential_expiring: Award,
  credential_expired: Award,
};

const Alerts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [pendingOrgInvites, setPendingOrgInvites] = useState<PendingOrgInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Subscribe to new notifications
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notificationsData, requestsData, orgInvitesData] = await Promise.all([
        getNotifications(),
        getPendingConnectionRequests(),
        getUserPendingOrgInvites(),
      ]);
      setNotifications(notificationsData);
      setPendingRequests(requestsData);
      setPendingOrgInvites(orgInvitesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (request: PendingRequest) => {
    setProcessingRequest(request.id);
    try {
      const success = await acceptConnection(request.id, request.user_id);
      if (success) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
        toast.success(`Connected with ${request.user.full_name}!`);
      } else {
        toast.error("Failed to accept connection");
      }
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Failed to accept connection");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = async (request: PendingRequest) => {
    setProcessingRequest(request.id);
    try {
      const success = await declineConnection(request.id);
      if (success) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
        toast.success("Connection request declined");
      } else {
        toast.error("Failed to decline connection");
      }
    } catch (error) {
      console.error("Error declining connection:", error);
      toast.error("Failed to decline connection");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleAcceptOrgInvite = async (invite: PendingOrgInvite) => {
    setProcessingInvite(invite.id);
    try {
      const success = await acceptOrgInvite(invite.id);
      if (success) {
        setPendingOrgInvites((prev) => prev.filter((i) => i.id !== invite.id));
        toast.success(`You've joined ${invite.organization?.name || 'the agency'}!`);
        // Reload the page to update organization context
        window.location.reload();
      } else {
        toast.error("Failed to accept invite");
      }
    } catch (error) {
      console.error("Error accepting org invite:", error);
      toast.error("Failed to accept invite");
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleDeclineOrgInvite = async (invite: PendingOrgInvite) => {
    setProcessingInvite(invite.id);
    try {
      const success = await declineOrgInvite(invite.id);
      if (success) {
        setPendingOrgInvites((prev) => prev.filter((i) => i.id !== invite.id));
        toast.success("Invite declined");
      } else {
        toast.error("Failed to decline invite");
      }
    } catch (error) {
      console.error("Error declining org invite:", error);
      toast.error("Failed to decline invite");
    } finally {
      setProcessingInvite(null);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      const success = await deleteNotification(notificationId);
      if (success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success("Notification deleted");
      } else {
        toast.error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    try {
      const success = await clearAllNotifications();
      if (success) {
        setNotifications([]);
        toast.success("All notifications cleared");
      } else {
        toast.error("Failed to clear notifications");
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    } finally {
      setClearDialogOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const success = await markAllNotificationsAsRead();
      if (success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
        toast.success("All marked as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }

    // Navigate based on type
    if (notification.type === "like" || notification.type === "comment") {
      if (notification.related_post_id) {
        navigate("/feed");
      }
    } else if (notification.type === "connection" && notification.related_user_id) {
      navigate(`/user/${notification.related_user_id}`);
    } else if (notification.type === "message" && notification.related_user_id) {
      navigate(`/messages?user=${notification.related_user_id}`);
    } else if (notification.type === "credential_expiring" || notification.type === "credential_expired") {
      navigate("/credentials");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display mb-1">Alerts</h1>
              <p className="text-muted-foreground">Stay updated on your network</p>
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">Mark all read</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClearDialogOpen(true)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear all</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Pending Connection Requests */}
        {!loading && pendingRequests.length > 0 && (
          <div className="px-4 md:px-0 mb-4">
            <h2 className="text-lg font-semibold mb-3">Connection Requests</h2>
            <div className="feed-card divide-y divide-border">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center gap-3 p-4">
                  <Link to={`/user/${request.user.id}`}>
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.user.avatar_url} />
                      <AvatarFallback>
                        {request.user.full_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/user/${request.user.id}`}
                      className="font-semibold text-sm hover:underline"
                    >
                      {request.user.full_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{request.user.role}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 gap-1"
                      onClick={() => handleAcceptRequest(request)}
                      disabled={processingRequest === request.id}
                    >
                      <UserCheck className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => handleDeclineRequest(request)}
                      disabled={processingRequest === request.id}
                    >
                      <UserX className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Agency Invites */}
        {!loading && pendingOrgInvites.length > 0 && (
          <div className="px-4 md:px-0 mb-4">
            <h2 className="text-lg font-semibold mb-3">Agency Invites</h2>
            <div className="feed-card divide-y divide-border">
              {pendingOrgInvites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-3 p-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {invite.organization?.logo_url ? (
                      <img
                        src={invite.organization.logo_url}
                        alt={invite.organization.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      {invite.organization?.name || 'Unknown Agency'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Invited by {invite.inviter?.full_name || 'someone'} as{' '}
                      <span className="capitalize">{invite.role}</span>
                    </p>
                    {invite.organization?.city && invite.organization?.state && (
                      <p className="text-xs text-muted-foreground">
                        {invite.organization.city}, {invite.organization.state}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 gap-1"
                      onClick={() => handleAcceptOrgInvite(invite)}
                      disabled={processingInvite === invite.id}
                    >
                      <Check className="h-4 w-4" />
                      Join
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => handleDeclineOrgInvite(invite)}
                      disabled={processingInvite === invite.id}
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="px-4 md:px-0">
          {loading ? (
            <div className="feed-card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="feed-card divide-y divide-border">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || Bell;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer group",
                      !notification.read && "bg-accent/5"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        typeStyles[notification.type]
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            "font-semibold text-sm",
                            !notification.read && "text-foreground"
                          )}
                        >
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {notification.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDelete(e, notification.id)}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : pendingRequests.length === 0 && pendingOrgInvites.length === 0 ? (
            <div className="feed-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No alerts yet</h3>
              <p className="text-sm text-muted-foreground">
                You'll see activity from your network here
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your notifications. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Alerts;
