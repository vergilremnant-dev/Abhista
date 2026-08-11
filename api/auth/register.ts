import { VercelResponse } from '@vercel/node';
import { db } from '../utils/db.js';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { validatePasswordStrength } from '../utils/validation.js';
import { logSecurityEvent } from '../services/auditService.js';
import { VercelRequestWithUser } from '../middleware/authMiddleware.js';

export default async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  const { email, password, firstName, lastName, role, phone, preferredCity, skills: _skills, experienceYears } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Email, password, and role are required' });
  }

  // Validate password strength policy
  const passwordErrors = validatePasswordStrength(password);
  if (passwordErrors.length > 0) {
    return res.status(400).json({ success: false, message: passwordErrors.join(' ') });
  }

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Hash password with BCrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Map role
    let mappedRole: Role = Role.CUSTOMER;
    if (role === 'ROLE_PROVIDER' || role === 'PROVIDER') {
      mappedRole = Role.PROVIDER;
    } else if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
      mappedRole = Role.ADMIN;
    }

    // Create user and profile
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        role: mappedRole,
        status: 'ACTIVE',
      },
    });

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'New User';

    if (mappedRole === Role.CUSTOMER) {
      await db.customerProfile.create({
        data: {
          userId: user.id,
          fullName,
          phoneNumber: phone || '',
          city: preferredCity || 'Hyderabad',
          state: 'Telangana',
          pincode: '500001',
        },
      });
    } else if (mappedRole === Role.PROVIDER) {
      // Find default category ID or use 1
      const defaultCategory = await db.serviceCategory.findFirst({ where: { isActive: true } });
      const categoryId = defaultCategory ? defaultCategory.id : 1;

      await db.providerProfile.create({
        data: {
          userId: user.id,
          fullName,
          email,
          phoneNumber: phone || '',
          experienceYears: experienceYears ? Number(experienceYears) : 5,
          city: preferredCity || 'Hyderabad',
          state: 'Telangana',
          categoryId,
        },
      });
    }

    // Generate email verification token in DB
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.userSession.create({
      data: {
        userId: user.id,
        token: `EMAIL_VERIFY:${hashedToken}`,
        expiresAt,
      },
    });

    await logSecurityEvent(user.id, 'PROFILE_UPDATE', 'New user account created successfully');

    // Return success response with verification token details
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Email verification link generated.',
      verificationToken,
    });
    } catch (_error: any) {
    return res.status(500).json({ success: false, message: 'An internal server error occurred during registration.' });
  }
}
