export type Permission =
  | 'booking:create'
  | 'booking:view'
  | 'booking:accept'
  | 'booking:cancel'
  | 'availability:update'
  | 'portfolio:manage'
  | 'consultation:manage'
  | 'profile:update'
  | 'user:manage'
  | 'category:manage'
  | 'settings:manage';

export const ROLE_PERMISSIONS: Record<'CUSTOMER' | 'PROVIDER' | 'ADMIN', Permission[]> = {
  CUSTOMER: [
    'booking:create',
    'booking:view',
    'booking:cancel',
    'profile:update',
  ],
  PROVIDER: [
    'booking:view',
    'booking:accept',
    'booking:cancel',
    'availability:update',
    'portfolio:manage',
    'consultation:manage',
    'profile:update',
  ],
  ADMIN: [
    'booking:create',
    'booking:view',
    'booking:accept',
    'booking:cancel',
    'availability:update',
    'portfolio:manage',
    'consultation:manage',
    'profile:update',
    'user:manage',
    'category:manage',
    'settings:manage',
  ],
};

export function checkPermission(
  rawRole: string,
  permission: Permission,
  currentUserId?: string | number,
  resourceOwnerId?: string | number
): boolean {
  let role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN' = 'CUSTOMER';
  
  if (rawRole === 'ROLE_ADMIN' || rawRole === 'ADMIN') {
    role = 'ADMIN';
  } else if (
    rawRole === 'ROLE_PROVIDER' || 
    rawRole === 'ROLE_CONTRACTOR' || 
    rawRole === 'PROVIDER'
  ) {
    role = 'PROVIDER';
  }

  if (role === 'ADMIN') {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[role] || [];
  if (!permissions.includes(permission)) {
    return false;
  }

  if (resourceOwnerId !== undefined && currentUserId !== undefined) {
    return String(currentUserId) === String(resourceOwnerId);
  }

  return true;
}
