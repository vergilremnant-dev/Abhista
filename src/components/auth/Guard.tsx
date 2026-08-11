import React from 'react';
import { usePermission } from '../../hooks/auth/usePermission';
import type { Permission } from '../../utils/auth/rbac';

interface GuardProps {
  permission: Permission;
  resourceOwnerId?: string | number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Guard({ permission, resourceOwnerId, fallback = null, children }: GuardProps) {
  const { has } = usePermission();

  if (!has(permission, resourceOwnerId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
