import axios from 'axios';
import { axiosClient } from '../auth/axiosClient';

export interface ProfileCompletionResponse {
  success: boolean;
  percentage: number;
  missingFields: string[];
}

export const profileService = {
  async getProfile() {
    try {
      const response = await axiosClient.get('/api/profile');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async upsertProfile(payload: Record<string, unknown>) {
    const response = await axiosClient.post('/api/profile', payload);
    return response.data;
  },

  async uploadImage(fileBase64: string, folder = 'avatars') {
    const response = await axiosClient.post('/api/profile/upload', { file: fileBase64, folder });
    return response.data;
  },

  async getCompletion() {
    const response = await axiosClient.get<ProfileCompletionResponse>('/api/profile/completion');
    return response.data;
  },
};
