import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from "@/components/layout/AppLayout";
import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChatDialog } from '@/components/messages/ChatDialog';
import { getConversations, Conversation, subscribeToMessages } from '@/lib/messageService';
import { getUserProfile } from '@/lib/userService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  } | null>(null);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Check for user param in URL (from "Message" button on profile)
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId && user) {
      openChatWithUser(userId);
      // Clear the param
      setSearchParams({});
    }
  }, [searchParams, user]);

  // Subscribe to new messages for real-time updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToMessages(user.id, () => {
      // Reload conversations when new message arrives
      loadConversations();
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const convos = await getConversations();
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const openChatWithUser = async (userId: string) => {
    // Check if we already have this user in conversations
    const existingConvo = conversations.find(c => c.user.id === userId);
    if (existingConvo) {
      setSelectedUser(existingConvo.user);
      setChatOpen(true);
      return;
    }

    // Fetch user profile
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        setSelectedUser({
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: profile.role,
        });
        setChatOpen(true);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Could not open chat');
    }
  };

  const handleConversationClick = (convo: Conversation) => {
    setSelectedUser(convo.user);
    setChatOpen(true);
  };

  const handleChatClose = (open: boolean) => {
    setChatOpen(open);
    if (!open) {
      // Reload conversations to update read status
      loadConversations();
    }
  };

  const filteredConversations = conversations.filter(convo =>
    convo.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="px-4 md:px-0">
          {loading ? (
            <div className="feed-card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading conversations...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="feed-card divide-y divide-border">
              {filteredConversations.map((convo) => (
                <button
                  key={convo.user.id}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => handleConversationClick(convo)}
                >
                  <div className="relative">
                    <img
                      src={convo.user.avatar_url || '/placeholder.svg'}
                      alt={convo.user.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {convo.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent rounded-full border-2 border-card flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-semibold text-sm truncate ${convo.unreadCount > 0 ? "text-foreground" : ""}`}>
                        {convo.user.full_name}
                      </h4>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(convo.lastMessage.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {convo.user.role}
                    </p>
                    <p className={`text-sm truncate mt-1 ${convo.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {convo.lastMessage.sender_id === user?.id ? 'You: ' : ''}
                      {convo.lastMessage.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="feed-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                Visit someone's profile and click "Message" to start a conversation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Dialog */}
      <ChatDialog
        open={chatOpen}
        onOpenChange={handleChatClose}
        chatUser={selectedUser}
        onMessagesRead={loadConversations}
      />
    </AppLayout>
  );
};

export default Messages;
