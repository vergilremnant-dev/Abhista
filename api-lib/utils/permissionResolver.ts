import { ROLE_PERMISSIONS, Permission } from './rbacConfig.js';

export interface AccessContext {
  userId: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  resourceOwnerId?: string;
}

export function hasPermission(
  context: AccessContext,
  permission: Permission,
  bypassOwnership = false
): boolean {
  if (context.role === 'ADMIN') {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[context.role] || [];
  if (!permissions.includes(permission)) {
    return false;
  }

  if (!bypassOwnership && context.resourceOwnerId) {
    return context.userId === context.resourceOwnerId;
  }

  return true;
}
