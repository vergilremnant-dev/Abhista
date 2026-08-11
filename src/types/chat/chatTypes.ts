export interface Conversation {
  id: string;
  bookingId: string | null;
  consultationBookingId: string | null;
  customerId: string;
  providerId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    fullName: string;
    profileImageUrl: string | null;
    userId: string;
  };
  provider?: {
    id: string;
    fullName: string;
    businessName: string | null;
    userId: string;
  };
  booking?: {
    bookingNumber: string;
    bookingStatus: string;
  } | null;
  consultationBooking?: {
    bookingNumber: string;
    status: string;
    consultationTopic: string;
  } | null;
  messages?: { id: string }[]; // Holds unread message references
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  content: string;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface CreateConversationRequest {
  bookingId?: string;
  consultationBookingId?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  attachmentUrl?: string;
}
