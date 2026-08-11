import axios from 'axios';
import { axiosClient } from '../auth/axiosClient.js';
import type { WorkforceType, ServiceCategory } from '../../types/category/categoryTypes.js';

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

export const WorkforceService = {
  async listWorkforceTypes(): Promise<WorkforceType[]> {
    try {
      const response = await axiosClient.get<ApiResponse<WorkforceType[]>>('/api/workforce/types');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load workforce classifications list'), { cause: error });
    }
  },

  async getCategoriesByWorkforce(params: { workforceName?: string; workforceTypeId?: string }): Promise<ServiceCategory[]> {
    try {
      const response = await axiosClient.get<ApiResponse<ServiceCategory[]>>('/api/workforce/categories', {
        params,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to filter categories by workforce type'), { cause: error });
    }
  },
};
