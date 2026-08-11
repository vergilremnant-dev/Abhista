import { describe, it, expect } from 'vitest';
import { checkPermission } from '../../src/utils/auth/rbac.js';

describe('Frontend RBAC Permission Checks', () => {
  it('should allow ADMIN any permission', () => {
    expect(checkPermission('ROLE_ADMIN', 'settings:manage')).toBe(true);
    expect(checkPermission('ROLE_ADMIN', 'user:manage')).toBe(true);
  });

  it('should allow CUSTOMER core client permissions', () => {
    expect(checkPermission('ROLE_CUSTOMER', 'booking:create')).toBe(true);
    expect(checkPermission('ROLE_CUSTOMER', 'settings:manage')).toBe(false);
  });

  it('should allow PROVIDER provider-specific permissions', () => {
    expect(checkPermission('ROLE_PROVIDER', 'availability:update')).toBe(true);
    expect(checkPermission('ROLE_PROVIDER', 'user:manage')).toBe(false);
  });

  it('should validate resource ownership when both owner and user IDs are defined', () => {
    expect(checkPermission('ROLE_CUSTOMER', 'booking:cancel', 'user-1', 'user-1')).toBe(true);
    expect(checkPermission('ROLE_CUSTOMER', 'booking:cancel', 'user-1', 'user-2')).toBe(false);
  });
});
