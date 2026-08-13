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
