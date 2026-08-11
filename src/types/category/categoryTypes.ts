export type CategoryType = 'BLUE_COLLAR' | 'WHITE_COLLAR';

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  categoryType: CategoryType;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  parentId: number | null;
  children?: ServiceCategory[];
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  workforceTypeId?: string | null;
  workforceType?: WorkforceType | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkforceType {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  categoryType: CategoryType;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  parentId?: number | null;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  categoryType?: CategoryType;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  parentId?: number | null;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}
