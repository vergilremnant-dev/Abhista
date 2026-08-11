import axios from 'axios';
import { axiosClient } from '../auth/axiosClient.js';
import type { Conversation, Message, GlobalActivity, Announcement, UserPresence } from '../../types/contractor/CollaborationTypes.js';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export const CollaborationService = {
  async listConversations(): Promise<Conversation[]> {
    try {
      const response = await axiosClient.get<ApiResponse<Conversation[]>>('/api/conversations');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load conversations list'), { cause: error });
    }
  },

  async getConversationDetail(id: string): Promise<Conversation> {
    try {
      const response = await axiosClient.get<ApiResponse<Conversation>>(`/api/conversations/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load conversation details'), { cause: error });
    }
  },

  async createConversation(payload: {
    providerId: string;
    conversationType?: string;
    requirementId?: number;
    projectId?: string;
    bookingId?: string;
    consultationBookingId?: string;
  }): Promise<Conversation> {
    try {
      const response = await axiosClient.post<ApiResponse<Conversation>>('/api/conversations', payload);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to start conversation'), { cause: error });
    }
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await axiosClient.get<ApiResponse<Message[]>>(`/api/conversations/${conversationId}/messages`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to fetch message history'), { cause: error });
    }
  },

  async sendMessage(conversationId: string, payload: {
    content: string;
    messageType?: string;
    attachmentUrl?: string;
  }): Promise<Message> {
    try {
      const response = await axiosClient.post<ApiResponse<Message>>(`/api/conversations/${conversationId}/messages`, payload);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to send message'), { cause: error });
    }
  },

  async updatePresence(status: string): Promise<UserPresence> {
    try {
      const response = await axiosClient.put<ApiResponse<UserPresence>>('/api/conversations/presence', { status });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update presence heartbeat'), { cause: error });
    }
  },

  async listActivities(): Promise<GlobalActivity[]> {
    try {
      const response = await axiosClient.get<ApiResponse<GlobalActivity[]>>('/api/activities');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load activity logs feed'), { cause: error });
    }
  },

  async listAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await axiosClient.get<ApiResponse<Announcement[]>>('/api/announcements');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load announcements feed'), { cause: error });
    }
  },

  async publishAnnouncement(title: string, content: string): Promise<Announcement> {
    try {
      const response = await axiosClient.post<ApiResponse<Announcement>>('/api/announcements', { title, content });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to publish announcement'), { cause: error });
    }
  },
};
