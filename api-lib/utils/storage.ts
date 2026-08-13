import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StorageProvider {
  upload(base64Data: string, folder: string): Promise<string>;
  delete(fileUrl: string): Promise<void>;
}

export class LocalStorageProvider implements StorageProvider {
  async upload(base64Data: string, folder: string): Promise<string> {
    const matches = base64Data.match(new RegExp('^data:([A-Za-z-+/]+);base64,(.+)$'));
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 data format');
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(mimeType)) {
      throw new Error('Allowed file types: JPEG, PNG, WEBP');
    }

    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('File size limit exceeded (Max 5MB)');
    }

    const ext = mimeType.split('/')[1];
    const filename = `${crypto.randomUUID()}.${ext}`;
    
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      return base64Data;
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${folder}/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    if (!fileUrl || fileUrl.startsWith('data:')) return;
    
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) return;

    try {
      const localPath = path.join(process.cwd(), 'public', fileUrl);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch {
      // Ignore delete errors
    }
  }
}

export const storage = new LocalStorageProvider();
