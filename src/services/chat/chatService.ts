import { axiosClient } from '../auth/axiosClient';
import type {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
} from '../../types/chat/chatTypes';

export const chatApi = {
  async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    const response = await axiosClient.post<{ success: boolean; data: Conversation }>(
      '/api/chat/conversations',
      request
    );
    return response.data.data;
  },

  async listConversations(): Promise<Conversation[]> {
    const response = await axiosClient.get<{ success: boolean; data: Conversation[] }>(
      '/api/chat/conversations'
    );
    return response.data.data;
  },

  async getConversationDetail(id: string): Promise<Conversation> {
    const response = await axiosClient.get<{ success: boolean; data: Conversation }>(
      `/api/chat/conversations/${id}`
    );
    return response.data.data;
  },

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    const response = await axiosClient.post<{ success: boolean; data: Message }>(
      '/api/chat/messages',
      request
    );
    return response.data.data;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await axiosClient.get<{ success: boolean; data: Message[] }>(
      `/api/chat/messages/${conversationId}`
    );
    return response.data.data;
  },

  async markMessageRead(id: string): Promise<Message> {
    const response = await axiosClient.patch<{ success: boolean; data: Message }>(
      `/api/chat/messages/${id}/read`
    );
    return response.data.data;
  },
};
