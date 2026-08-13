import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../_utils/auth.js';
import { addRequirementNote } from '../../_services/requirementService.js';
import { db } from '../../_utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;
  const user = verifyToken(req);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Missing requirement ID parameter' });
  }

  const requirementId = Number(paramId);

  try {
    if (method === 'POST') {
      const { content, isPrivate } = req.body;
      if (!content) {
        return res.status(400).json({ success: false, message: 'Missing note content' });
      }

      const note = await addRequirementNote(requirementId, user.id, content, !!isPrivate);
      return res.status(201).json({ success: true, data: note, message: 'Note added successfully' });
    }

    if (method === 'GET') {
      const changer = await db.user.findUnique({ where: { id: user.id } });
      const isAdmin = changer?.role === 'ADMIN';
      const isProvider = changer?.role === 'PROVIDER';

      const whereClause: any = { requirementId };
      // Hide private notes from customers
      if (!isAdmin && !isProvider) {
        whereClause.isPrivate = false;
      }

      const notes = await db.requirementNote.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ success: true, data: notes });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
