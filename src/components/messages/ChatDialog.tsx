import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { Message, getMessagesWith, sendMessage, markMessagesAsRead, subscribeToMessages } from '@/lib/messageService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  role?: string;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatUser: ChatUser | null;
  onMessagesRead?: () => void;
}

export function ChatDialog({ open, onOpenChange, chatUser, onMessagesRead }: ChatDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages when dialog opens
  useEffect(() => {
    if (open && chatUser) {
      loadMessages();
      markAsRead();
    }
  }, [open, chatUser]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!open || !user || !chatUser) return;

    const unsubscribe = subscribeToMessages(user.id, (newMsg) => {
      // Only add if it's from the current chat user
      if (newMsg.sender_id === chatUser.id) {
        setMessages((prev) => [...prev, newMsg]);
        markAsRead();
        scrollToBottom();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [open, user, chatUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!chatUser) return;

    setLoading(true);
    try {
      const msgs = await getMessagesWith(chatUser.id);
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!chatUser) return;
    await markMessagesAsRead(chatUser.id);
    onMessagesRead?.();
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !chatUser || sending) return;

    setSending(true);
    try {
      const msg = await sendMessage(chatUser.id, newMessage.trim());
      if (msg) {
        setMessages((prev) => [...prev, msg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleViewProfile = () => {
    if (chatUser) {
      onOpenChange(false);
      navigate(`/user/${chatUser.id}`);
    }
  };

  if (!chatUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img
              src={chatUser.avatar_url || '/placeholder.svg'}
              alt={chatUser.full_name}
              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={handleViewProfile}
            />
            <div className="flex-1 min-w-0">
              <DialogTitle
                className="text-base font-semibold cursor-pointer hover:text-primary transition-colors"
                onClick={handleViewProfile}
              >
                {chatUser.full_name}
              </DialogTitle>
              {chatUser.role && (
                <p className="text-xs text-muted-foreground truncate">{chatUser.role}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No messages yet.</p>
              <p className="text-sm">Send a message to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    isMine ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2',
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className={cn(
                        'text-xs mt-1',
                        isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}
                    >
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
