import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../utils/auth.js';
import { db } from '../../utils/db.js';
import { VerificationStatus } from '@prisma/client';

function mapToContractorProfile(profile: any) {
  return {
    id: profile.id,
    userId: profile.userId,
    companyName: profile.businessName || '',
    ownerName: profile.fullName || '',
    phoneNumber: profile.phoneNumber,
    experienceYears: profile.experienceYears,
    specialization: profile.category ? profile.category.name : 'Plumbing',
    serviceAreas: profile.serviceAreas,
    description: profile.description,
    verificationStatus: profile.verificationStatus,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const method = req.method;

  switch (method) {
    case 'GET':
      try {
        const profile = await db.providerProfile.findUnique({
          where: { userId: user.id },
          include: { category: true },
        });
        if (!profile) {
          return res.status(404).json({ success: false, message: 'Contractor profile not found' });
        }
        return res.status(200).json({ success: true, data: mapToContractorProfile(profile) });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }

    case 'POST':
    case 'PUT':
      try {
        const {
          companyName,
          ownerName,
          phoneNumber,
          experienceYears,
          specialization,
          serviceAreas,
          description,
        } = req.body;

        if (!ownerName || !phoneNumber || experienceYears === undefined || !specialization) {
          return res.status(400).json({ success: false, message: 'Missing required profile fields' });
        }

        // Find category matching specialization
        const category = await db.serviceCategory.findFirst({
          where: {
            name: { contains: specialization, mode: 'insensitive' },
          },
        });
        const categoryId = category ? category.id : 1;

        const profile = await db.providerProfile.upsert({
          where: { userId: user.id },
          update: {
            fullName: ownerName,
            businessName: companyName,
            phoneNumber,
            experienceYears: Number(experienceYears),
            categoryId,
            serviceAreas,
            description,
            email: user.email,
          },
          create: {
            userId: user.id,
            fullName: ownerName,
            businessName: companyName,
            phoneNumber,
            experienceYears: Number(experienceYears),
            categoryId,
            serviceAreas,
            description,
            email: user.email,
            city: 'Hyderabad',
            state: 'Telangana',
            verificationStatus: VerificationStatus.PENDING,
            isFeatured: false,
            isAvailable: true,
          },
          include: { category: true },
        });

        return res.status(200).json({ success: true, data: mapToContractorProfile(profile) });
      } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
