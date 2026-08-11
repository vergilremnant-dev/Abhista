import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole, AuthenticatedUser } from '../utils/auth.js';

export interface VercelRequestWithUser extends VercelRequest {
  user?: AuthenticatedUser;
}

export type VercelHandler = (req: VercelRequestWithUser, res: VercelResponse) => Promise<any> | any;

export function withAuth(handler: VercelHandler, allowedRoles?: ('CUSTOMER' | 'PROVIDER' | 'ADMIN')[]) {
  return async (req: VercelRequestWithUser, res: VercelResponse) => {
    // Add Security Headers (OWASP Standards)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none';");

    const userPayload = verifyToken(req);
    
    if (!userPayload) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid access token' });
    }

    if (allowedRoles && !hasRole(userPayload, allowedRoles)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }

    req.user = userPayload;
    return handler(req, res);
  };
}
