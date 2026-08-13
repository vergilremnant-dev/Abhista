import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../api-lib/utils/auth.js';
import { db } from '../../api-lib/utils/db.js';
import { QuotationStatus } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const { requirementId } = req.query;

  if (!requirementId) {
    return res.status(400).json({ success: false, message: 'Missing requirementId parameter' });
  }

  try {
    // Ensure caller is the customer who owns the requirement or admin
    const requirement = await db.requirement.findUnique({
      where: { id: Number(requirementId) },
      include: { customer: true },
    });

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    const changer = await db.user.findUnique({ where: { id: user.id } });
    const isOwner = requirement.customer.userId === user.id;
    const isAdmin = changer?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized access to compare quotations' });
    }

    const quotations = await db.quotation.findMany({
      where: {
        requirementId: Number(requirementId),
        status: { not: QuotationStatus.DRAFT }, // Hide drafts
      },
      include: {
        provider: true,
        proposal: true,
        milestones: true,
      },
      orderBy: { totalAmount: 'asc' }, // Order by price ascending by default
    });

    // Structure comparison details
    const comparison = quotations.map((q: any) => ({
      quotationId: q.id,
      providerName: q.provider.fullName,
      businessName: q.provider.businessName,
      providerRating: q.provider.averageRating,
      experienceYears: q.provider.experienceYears,
      totalCost: q.totalAmount,
      pricingModel: q.priceModel,
      estimatedDurationDays: q.estimatedDurationDays,
      warrantyMonths: q.warrantyMonths,
      proposalTitle: q.proposal?.title,
      milestonesCount: q.milestones.length,
    }));

    return res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
