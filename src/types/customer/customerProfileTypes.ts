export interface CustomerProfile {
  id: number
  userId: number
  fullName: string
  phoneNumber: string
  address: string | null
  city: string
  state: string
  pincode: string
  profileImageUrl: string | null
  createdAt: string
  updatedAt: string | null
}

export interface CustomerProfileRequest {
  fullName: string
  phoneNumber: string
  address: string
  city: string
  state: string
  pincode: string
  profileImageUrl?: string | null
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface CustomerProfileState {
  profile: CustomerProfile | null
  loading: boolean
  saving: boolean
  error: string | null
  successMessage: string | null
  loaded: boolean
}
