import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../utils/auth.js';
import { getQuotationById, updateQuotationDraft, deleteQuotationDraft } from '../../services/quotationService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;
  const user = verifyToken(req);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Missing quotation ID parameter' });
  }

  const quotationId = Number(paramId);

  try {
    if (method === 'GET') {
      const quotation = await getQuotationById(quotationId);
      if (!quotation) {
        return res.status(404).json({ success: false, message: 'Quotation not found' });
      }
      return res.status(200).json({ success: true, data: quotation });
    }

    if (method === 'PUT') {
      const updated = await updateQuotationDraft(quotationId, user.id, req.body);
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Draft quotation updated successfully',
      });
    }

    if (method === 'DELETE') {
      await deleteQuotationDraft(quotationId, user.id);
      return res.status(200).json({ success: true, message: 'Draft quotation deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
