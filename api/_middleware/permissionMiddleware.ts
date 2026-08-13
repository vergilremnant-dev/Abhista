import { VercelResponse } from '@vercel/node';
import { VercelRequestWithUser, withAuth } from './authMiddleware.js';
import { Permission } from '../_utils/../_utils/rbacConfig.js';
import { hasPermission } from '../_utils/../_utils/permissionResolver.js';

export function requirePermission(
  permission: Permission,
  getOwnerId?: (req: VercelRequestWithUser) => string | undefined
) {
  return (handler: any) => {
    return withAuth(async (req: VercelRequestWithUser, res: VercelResponse) => {
      const user = req.user!;
      const resourceOwnerId = getOwnerId ? getOwnerId(req) : undefined;

      const permitted = hasPermission(
        {
          userId: user.id,
          role: user.role,
          resourceOwnerId,
        },
        permission
      );

      if (!permitted) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Insufficient privileges for action: ${permission}`,
        });
      }

      return handler(req, res);
    });
  };
}
