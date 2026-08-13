import { VercelResponse } from '@vercel/node';
import { VercelRequestWithUser } from '../../middleware/authMiddleware.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';
import { storage } from '../../utils/storage.js';
import { validateUploadedFile } from '../../utils/validation.js';

async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;

  if (method === 'POST') {
    try {
      const { file, folder = 'avatars' } = req.body;
      if (!file) {
        return res.status(400).json({ success: false, message: 'File base64 string is required' });
      }

      // Estimate mimeType and size from Base64 Data URL
      let mimeType = 'image/png';
      let fileSizeEstimate = 0;
      let extension = '.png';

      if (file.startsWith('data:')) {
        const matches = file.match(/^data:([^;]+);base64,/);
        if (matches && matches[1]) {
          mimeType = matches[1];
          if (mimeType.includes('pdf')) extension = '.pdf';
          else if (mimeType.includes('jpeg')) extension = '.jpg';
          else if (mimeType.includes('png')) extension = '.png';
          else if (mimeType.includes('msword')) extension = '.doc';
          else if (mimeType.includes('document')) extension = '.docx';
        }
        const base64Content = file.split(',')[1] || '';
        fileSizeEstimate = (base64Content.length * 3) / 4;
      } else {
        fileSizeEstimate = (file.length * 3) / 4;
      }

      // Validate file type, mime-type and size limits (10MB)
      const fileValidation = validateUploadedFile(`file${extension}`, fileSizeEstimate, mimeType);
      if (!fileValidation.isValid) {
        return res.status(400).json({ success: false, message: fileValidation.error });
      }

      // Malware/Virus scanning integration placeholder
      const isVirusFree = true; // Placeholder for ClamAV/VirusTotal security check hook
      if (!isVirusFree) {
        return res.status(400).json({ success: false, message: 'Upload blocked: Security risk detected.' });
      }

      const fileUrl = await storage.upload(file, folder);
      return res.status(200).json({ success: true, url: fileUrl });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}

export default requirePermission('profile:update')(handler);
