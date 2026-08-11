import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../utils/auth.js';
import { db } from '../utils/db.js';
import { createAppointment } from '../services/appointmentService.js';
import { AppointmentStatus } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;
  const user = verifyToken(req);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (method === 'POST') {
    try {
      const {
        title,
        description,
        eventType,
        startTime,
        endTime,
        providerId,
        projectId,
        requirementId,
        resources,
      } = req.body;

      if (!title || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: 'Missing required parameters: title, startTime, endTime' });
      }

      // Resolve Customer Profile if booking as customer
      let customerId: string | undefined = undefined;
      const userProfile = await db.user.findUnique({ where: { id: user.id } });
      if (userProfile?.role === 'CUSTOMER') {
        const customerProfile = await db.customerProfile.findUnique({ where: { userId: user.id } });
        customerId = customerProfile?.id;
      }

      const appointment = await createAppointment({
        title,
        description,
        eventType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        customerId,
        providerId,
        projectId,
        requirementId: requirementId ? Number(requirementId) : undefined,
        resources,
      });

      return res.status(201).json({
        success: true,
        data: appointment,
        message: 'Appointment scheduled successfully',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  if (method === 'GET') {
    const { status, limit = '10', offset = '0' } = req.query;
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offsetNum = Math.max(0, Number(offset));

    try {
      const whereClause: any = {};

      const userProfile = await db.user.findUnique({ where: { id: user.id } });

      if (userProfile?.role === 'PROVIDER') {
        const providerProfile = await db.providerProfile.findFirst({ where: { userId: user.id } });
        whereClause.providerId = providerProfile?.id || 'non-existent';
      } else if (userProfile?.role === 'CUSTOMER') {
        const customerProfile = await db.customerProfile.findUnique({ where: { userId: user.id } });
        whereClause.customerId = customerProfile?.id || 'non-existent';
      }

      if (status) {
        whereClause.status = status as AppointmentStatus;
      }

      const appointments = await db.appointment.findMany({
        where: whereClause,
        take: limitNum,
        skip: offsetNum,
        orderBy: { startTime: 'asc' },
        include: {
          customer: true,
          provider: true,
          project: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
