import { VercelResponse } from '@vercel/node';
import { VercelRequestWithUser } from '../_middleware/authMiddleware.js';

export default async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  const compliancePayload = {
    success: true,
    privacyPolicy: {
      version: '1.0.0',
      lastUpdated: '2026-08-01',
      summary: 'DBC protects your identity. Customers have granular controls over phone, email, and public profile visibility.',
      clauses: [
        'All personally identifiable information (PII) is encrypted in transit and hashed at rest.',
        'We do not sell user data to third-party advertising services.'
      ]
    },
    termsOfService: {
      version: '1.0.0',
      lastUpdated: '2026-08-01',
      summary: 'DBC is a digital platform connecting project owners and professionals. We facilitate but do not warrant construction work.',
      clauses: [
        'Quotations accepted by customers establish direct contracts between customer and trade provider.',
        'Users must comply with local municipal building regulations.'
      ]
    },
    cookieConsent: {
      policy: 'DBC utilizes secure, HttpOnly session cookies for token rotation and security validation. Functional cookies store settings and navigation state.'
    },
    dataRetention: {
      auditLogs: 'Immutable security audit logs are retained for 7 years to comply with trade and financial audit standards.',
      profileData: 'Active profiles are retained until account deletion requests are authorized.'
    },
    gdprExportArchitecture: {
      format: 'JSON',
      endpoint: '/api/profile/export',
      description: 'Generates a secure archive containing customer profile metadata, requirement postings, active/historical bookings, and billing history.',
    },
    accountDeletion: {
      method: 'DELETE',
      endpoint: '/api/profile/delete',
      description: 'Cascades soft-deletion flags. Anonymizes user email and deletes active login sessions. Retains only transaction references.'
    }
  };

  return res.status(200).json(compliancePayload);
}
