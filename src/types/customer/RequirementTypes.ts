export type RequirementStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PUBLISHED'
  | 'PROVIDER_REVIEW'
  | 'QUOTATION_RECEIVED'
  | 'CUSTOMER_REVIEW'
  | 'QUOTATION_ACCEPTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'ON_HOLD'

export interface RequirementAttachment {
  id: number
  requirementId: number
  fileName: string
  fileUrl: string
  fileType: string
  createdAt: string
}

export interface RequirementHistory {
  id: number
  requirementId: number
  fromStatus: string | null
  toStatus: string
  changedById: string
  changeReason: string | null
  previousValues: string | null
  newValues: string | null
  createdAt: string
}

export interface RequirementNote {
  id: number
  requirementId: number
  authorId: string
  content: string
  isPrivate: boolean
  createdAt: string
}

export interface CreateRequirementRequest {
  title: string
  description: string
  serviceCategory: string
  serviceCategoryId?: number | null
  location: string
  budgetMin: number
  budgetMax: number
  preferredStartDate?: string | null
  attachments?: { fileName: string; fileUrl: string; fileType: string }[]
}

export interface RequirementCreateResponse {
  id: number
  status: RequirementStatus
  message: string
}

export interface RequirementResponse {
  id: number
  customerId: string
  title: string
  description: string
  serviceCategory: string
  serviceCategoryId: number | null
  location: string
  budgetMin: number
  budgetMax: number
  preferredStartDate: string | null
  status: RequirementStatus
  createdAt: string
  updatedAt: string | null
  attachments?: RequirementAttachment[]
  history?: RequirementHistory[]
  notes?: RequirementNote[]
}

export interface CustomerRequirementState {
  requirements: RequirementResponse[]
  currentRequirement: RequirementResponse | null
  loading: boolean
  saving: boolean
  error: string | null
  loaded: boolean
}
