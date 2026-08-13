import { VercelRequest, VercelResponse } from '@vercel/node';

export function parseCookies(req: VercelRequest): Record<string, string> {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0].trim();
    if (name) {
      list[name] = decodeURIComponent(parts.slice(1).join('='));
    }
  });

  return list;
}

export function setCookie(
  res: VercelResponse,
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Lax' | 'Strict' | 'None';
    path?: string;
    maxAge?: number; // in seconds
  } = {}
) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.httpOnly !== false) parts.push('HttpOnly');

  const isProd = process.env.NODE_ENV === 'production';
  if (options.secure || (options.secure === undefined && isProd)) {
    parts.push('Secure');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  } else {
    parts.push('SameSite=Lax');
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  } else {
    parts.push('Path=/');
  }

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  const cookieString = parts.join('; ');
  const existingHeader = res.getHeader('Set-Cookie');
  let newHeaders: string[];

  if (Array.isArray(existingHeader)) {
    newHeaders = [...existingHeader, cookieString];
  } else if (typeof existingHeader === 'string') {
    newHeaders = [existingHeader, cookieString];
  } else {
    newHeaders = [cookieString];
  }

  res.setHeader('Set-Cookie', newHeaders);
}

export function clearCookie(res: VercelResponse, name: string, path = '/') {
  setCookie(res, name, '', { maxAge: 0, path });
}
