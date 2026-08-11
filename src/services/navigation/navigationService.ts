import type { UserRole } from '../../types/auth/authTypes';

export interface MenuItem {
  label: string;
  icon: string;
  type: 'workspace' | 'route' | 'action';
  target?: string; // Tab name for workspace or path for route
}

export const navigationService = {
  getMenuItemsForRole(role: UserRole): MenuItem[] {
    const normRole = (role || '').toUpperCase();

    if (normRole.includes('ADMIN')) {
      return [
        { label: 'Admin Workspace', icon: '💼', type: 'workspace', target: 'analytics' },
        { label: 'User Management', icon: '👥', type: 'workspace', target: 'users' },
        { label: 'Marketplace', icon: '🏪', type: 'workspace', target: 'providers' },
        { label: 'Requirements', icon: '📋', type: 'workspace', target: 'categories' }, // Maps categories/reqs
        { label: 'Approvals', icon: '🛡️', type: 'workspace', target: 'callbacks' },
        { label: 'Analytics', icon: '📈', type: 'workspace', target: 'analytics' },
        { label: 'Settings', icon: '⚙️', type: 'workspace', target: 'settings' }
      ];
    }

    if (normRole.includes('CONTRACTOR')) {
      return [
        { label: 'My Workspace', icon: '💼', type: 'workspace', target: 'overview' },
        { label: 'Available Requirements', icon: '🔍', type: 'route', target: '/search' },
        { label: 'My Projects', icon: '🏗️', type: 'route', target: '/chat' }, // Projects linked to messages/workspaces
        { label: 'Quotations', icon: '💰', type: 'workspace', target: 'overview' },
        { label: 'Team', icon: '👥', type: 'workspace', target: 'overview' },
        { label: 'Calendar', icon: '📅', type: 'workspace', target: 'calendar' },
        { label: 'Payments', icon: '💳', type: 'workspace', target: 'performance' },
        { label: 'Analytics', icon: '📊', type: 'workspace', target: 'performance' },
        { label: 'Settings', icon: '⚙️', type: 'workspace', target: 'profile' }
      ];
    }

    if (normRole.includes('ARCHITECT')) {
      return [
        { label: 'My Workspace', icon: '💼', type: 'workspace', target: 'overview' },
        { label: 'Portfolio', icon: '🖼️', type: 'workspace', target: 'profile' },
        { label: 'Projects', icon: '📐', type: 'workspace', target: 'overview' },
        { label: 'Appointments', icon: '📅', type: 'workspace', target: 'calendar' },
        { label: 'Reviews', icon: '⭐', type: 'workspace', target: 'performance' },
        { label: 'Payments', icon: '💳', type: 'workspace', target: 'performance' },
        { label: 'Settings', icon: '⚙️', type: 'workspace', target: 'profile' }
      ];
    }

    if (normRole.includes('WORKER')) {
      return [
        { label: 'My Workspace', icon: '💼', type: 'workspace', target: 'overview' },
        { label: 'Assigned Work', icon: '🛠️', type: 'workspace', target: 'overview' },
        { label: 'Attendance', icon: '📅', type: 'workspace', target: 'calendar' },
        { label: 'Timesheets', icon: '📋', type: 'workspace', target: 'overview' },
        { label: 'Payments', icon: '💳', type: 'workspace', target: 'performance' },
        { label: 'Profile', icon: '👤', type: 'workspace', target: 'profile' },
        { label: 'Settings', icon: '⚙️', type: 'workspace', target: 'profile' }
      ];
    }

    // Default to Customer role menu
    return [
      { label: 'My Workspace', icon: '💼', type: 'workspace', target: 'bookings' },
      { label: 'My Requirements', icon: '📋', type: 'workspace', target: 'requirements' },
      { label: 'Saved Professionals', icon: '⭐', type: 'route', target: '/' },
      { label: 'Bookings', icon: '📅', type: 'workspace', target: 'bookings' },
      { label: 'Payments', icon: '💳', type: 'workspace', target: 'profile' }, // Payments managed inside profile forms
      { label: 'Settings', icon: '⚙️', type: 'workspace', target: 'profile' }
    ];
  }
};
