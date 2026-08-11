import { axiosClient } from '../auth/axiosClient';

export const adminService = {
  // 1. User Management
  async getUsers(filters: { search?: string; role?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (filters.search) query.append('search', filters.search);
    if (filters.role) query.append('role', filters.role);
    if (filters.status) query.append('status', filters.status);
    if (filters.page) query.append('page', String(filters.page));
    if (filters.limit) query.append('limit', String(filters.limit));

    const response = await axiosClient.get(`/api/admin/users?${query.toString()}`);
    return response.data;
  },

  async updateUser(id: string, data: { status?: string; role?: string }) {
    const response = await axiosClient.patch(`/api/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await axiosClient.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  // 2. Provider Management
  async getProviders(filters: { search?: string; verificationStatus?: string; isFeatured?: boolean; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (filters.search) query.append('search', filters.search);
    if (filters.verificationStatus) query.append('verificationStatus', filters.verificationStatus);
    if (filters.isFeatured !== undefined) query.append('isFeatured', String(filters.isFeatured));
    if (filters.page) query.append('page', String(filters.page));
    if (filters.limit) query.append('limit', String(filters.limit));

    const response = await axiosClient.get(`/api/admin/providers?${query.toString()}`);
    return response.data;
  },

  async verifyProvider(id: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED') {
    const response = await axiosClient.patch(`/api/providers/${id}/verify`, { status });
    return response.data;
  },

  async featureProvider(id: string, isFeatured: boolean) {
    const response = await axiosClient.patch(`/api/providers/${id}/feature`, { isFeatured });
    return response.data;
  },

  // 3. Booking Management
  async getBookings() {
    const response = await axiosClient.get(`/api/admin/bookings`);
    return response.data;
  },

  async updateBookingStatus(id: string, status: string) {
    const response = await axiosClient.patch(`/api/admin/bookings/${id}`, { status });
    return response.data;
  },

  // 4. Consultation Management
  async getConsultations() {
    const response = await axiosClient.get(`/api/admin/consultations`);
    return response.data;
  },

  async updateConsultationStatus(id: string, status: string) {
    const response = await axiosClient.patch(`/api/admin/consultations/${id}`, { status });
    return response.data;
  },

  // 5. Callback Management
  async getCallbacks() {
    const response = await axiosClient.get(`/api/admin/callbacks`);
    return response.data;
  },

  async updateCallbackStatus(id: string, status: string) {
    const response = await axiosClient.patch(`/api/admin/callbacks/${id}/status`, { status });
    return response.data;
  },

  async updateCallbackNotes(id: string, notes: string) {
    const response = await axiosClient.patch(`/api/admin/callbacks/${id}/notes`, { notes });
    return response.data;
  },

  // 6. Subscriptions Management
  async getSubscriptions(filters: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (filters.status) query.append('status', filters.status);
    if (filters.page) query.append('page', String(filters.page));
    if (filters.limit) query.append('limit', String(filters.limit));

    const response = await axiosClient.get(`/api/admin/subscriptions?${query.toString()}`);
    return response.data;
  },

  // 7. Reviews Moderation
  async getReviews() {
    const response = await axiosClient.get(`/api/admin/reviews`);
    return response.data;
  },

  async hideReview(id: string) {
    const response = await axiosClient.post(`/api/admin/reviews/${id}/hide`);
    return response.data;
  },

  async restoreReview(id: string) {
    const response = await axiosClient.post(`/api/admin/reviews/${id}/restore`);
    return response.data;
  },
};
