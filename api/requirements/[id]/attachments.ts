import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../../api-lib/utils/auth.js';
import { addRequirementAttachment } from '../../../api-lib/services/requirementService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Missing requirement ID parameter' });
  }

  const { fileName, fileUrl, fileType } = req.body;

  if (!fileName || !fileUrl || !fileType) {
    return res.status(400).json({ success: false, message: 'Missing attachment meta parameters' });
  }

  try {
    const attachment = await addRequirementAttachment(
      Number(paramId),
      fileName,
      fileUrl,
      fileType
    );

    return res.status(201).json({
      success: true,
      data: attachment,
      message: 'Attachment mapped successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
