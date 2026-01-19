import { supabase } from './supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
}

export interface Conversation {
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<Conversation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get all messages where user is sender or receiver
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  if (!messages || messages.length === 0) {
    return [];
  }

  // Group messages by conversation partner
  const conversationMap = new Map<string, { messages: Message[]; unreadCount: number }>();

  messages.forEach((msg: Message) => {
    const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, { messages: [], unreadCount: 0 });
    }

    const convo = conversationMap.get(partnerId)!;
    convo.messages.push(msg);

    // Count unread messages (received by current user)
    if (msg.receiver_id === user.id && !msg.read) {
      convo.unreadCount++;
    }
  });

  // Get unique partner IDs
  const partnerIds = Array.from(conversationMap.keys());

  // Fetch profiles for all conversation partners
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .in('id', partnerIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  }

  const profilesMap = new Map(
    (profiles || []).map(p => [p.id, p])
  );

  // Build conversations array
  const conversations: Conversation[] = [];

  conversationMap.forEach((convo, partnerId) => {
    const profile = profilesMap.get(partnerId);
    if (profile && convo.messages.length > 0) {
      conversations.push({
        user: profile,
        lastMessage: convo.messages[0], // Most recent message
        unreadCount: convo.unreadCount,
      });
    }
  });

  // Sort by last message time
  conversations.sort((a, b) =>
    new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
  );

  return conversations;
}

/**
 * Get messages between current user and another user
 */
export async function getMessagesWith(otherUserId: string): Promise<Message[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

/**
 * Send a message to another user
 */
export async function sendMessage(receiverId: string, content: string): Promise<Message | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
      read: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }

  return data;
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(senderId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
  }
}

/**
 * Get unread message count
 */
export async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Subscribe to new messages (real-time)
 */
export function subscribeToMessages(
  userId: string,
  onMessage: (message: Message) => void
) {
  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
