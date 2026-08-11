import { useAuth } from './useAuth';
import { checkPermission } from '../../utils/auth/rbac';
import type { Permission } from '../../utils/auth/rbac';

export function usePermission() {
  const { user } = useAuth();

  function has(permission: Permission, resourceOwnerId?: string | number): boolean {
    if (!user) return false;
    return checkPermission(user.role, permission, user.id, resourceOwnerId);
  }

  return {
    has,
    role: user?.role,
    user,
  };
}
