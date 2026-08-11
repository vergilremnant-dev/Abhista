export interface Conversation {
  id: string;
  conversationType: string;
  customerId: string;
  providerId: string;
  requirementId?: number;
  projectId?: string;
  bookingId?: string;
  consultationBookingId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    fullName: string;
  };
  provider?: {
    id: string;
    fullName: string;
  };
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: string;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  threadId?: string;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    role: string;
  };
  readReceipts?: ReadReceipt[];
  reactions?: MessageReaction[];
}

export interface ReadReceipt {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
  user?: {
    fullName: string;
  };
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  reaction: string;
  user?: {
    fullName: string;
  };
}

export interface UserPresence {
  id: string;
  userId: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY';
  lastSeenAt: string;
}

export interface GlobalActivity {
  id: string;
  actorId: string;
  activityType: string;
  description: string;
  targetType?: string;
  targetId?: string;
  createdAt: string;
  actor?: {
    fullName: string;
    role: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  author?: {
    fullName: string;
  };
}
