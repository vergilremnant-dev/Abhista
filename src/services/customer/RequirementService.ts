import axios from 'axios'
import { axiosClient } from '../auth/axiosClient'
import type {
  CreateRequirementRequest,
  RequirementCreateResponse,
  RequirementResponse,
} from '../../types/customer/RequirementTypes'
import type { ApiResponse } from '../../types/customer/customerProfileTypes'

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message ?? fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

export const RequirementService = {
  async createRequirement(payload: CreateRequirementRequest): Promise<RequirementCreateResponse> {
    try {
      const response = await axiosClient.post<RequirementCreateResponse>(
        '/api/requirements',
        payload,
      )
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create requirement'), { cause: error })
    }
  },

  async getMyRequirements(): Promise<RequirementResponse[]> {
    try {
      const response = await axiosClient.get<ApiResponse<RequirementResponse[]>>(
        '/api/requirements/my',
      )
      return response.data.data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load requirements'), { cause: error })
    }
  },

  async getRequirementById(id: number): Promise<RequirementResponse> {
    try {
      const response = await axiosClient.get<ApiResponse<RequirementResponse>>(
        `/api/requirements/${id}`,
      )
      return response.data.data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load requirement details'), { cause: error })
    }
  },

  async updateRequirement(id: number, payload: Partial<CreateRequirementRequest>): Promise<RequirementResponse> {
    try {
      const response = await axiosClient.put<ApiResponse<RequirementResponse>>(
        `/api/requirements/${id}`,
        payload,
      )
      return response.data.data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update requirement'), { cause: error })
    }
  },

  async deleteRequirement(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/api/requirements/${id}`)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to delete requirement'), { cause: error })
    }
  },

  async updateStatus(id: number, status: string, reason?: string): Promise<RequirementResponse> {
    try {
      const response = await axiosClient.put<ApiResponse<RequirementResponse>>(
        `/api/requirements/${id}/status`,
        { status, reason },
      )
      return response.data.data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update status'), { cause: error })
    }
  },

  async addNote(id: number, content: string, isPrivate = false): Promise<unknown> {
    try {
      const response = await axiosClient.post<ApiResponse<unknown>>(
        `/api/requirements/${id}/notes`,
        { content, isPrivate },
      )
      return response.data.data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to add note'), { cause: error })
    }
  },

  async addAttachment(id: number, payload: { fileName: string; fileUrl: string; fileType: string }): Promise<unknown> {
    try {
      const response = await axiosClient.post<ApiResponse<unknown>>(
        `/api/requirements/${id}/attachments`,
        payload,
      )
      return response.data.data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to add attachment'), { cause: error })
    }
  },
}
