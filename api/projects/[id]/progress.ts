import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../../api-lib/utils/auth.js';
import { db } from '../../../api-lib/utils/db.js';
import { addProgressLog } from '../../../api-lib/services/projectService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;
  const user = verifyToken(req);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const { id } = req.query;
  const projectId = Array.isArray(id) ? id[0] : id;

  if (!projectId) {
    return res.status(400).json({ success: false, message: 'Missing project ID parameter' });
  }

  try {
    if (method === 'GET') {
      const logs = await db.progressLog.findMany({
        where: { projectId },
        include: { reporter: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ success: true, data: logs });
    }

    if (method === 'POST') {
      const { completionPercentage, notes, evidenceUrl, reportType } = req.body;

      if (completionPercentage === undefined || !notes) {
        return res.status(400).json({ success: false, message: 'Missing completion percentage or notes' });
      }

      const log = await addProgressLog(projectId, user.id, {
        completionPercentage: Number(completionPercentage),
        notes,
        evidenceUrl,
        reportType,
      });

      return res.status(201).json({
        success: true,
        data: log,
        message: 'Progress Log entry added successfully',
      });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
