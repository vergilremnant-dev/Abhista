import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../_utils/auth.js';
import { transitionAppointmentStatus } from '../../_services/appointmentService.js';
import { AppointmentStatus } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Missing appointment ID parameter' });
  }

  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Missing target status parameter' });
  }

  try {
    const updated = await transitionAppointmentStatus(
      paramId,
      user.id,
      status as AppointmentStatus
    );

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Appointment transitioned to ${status} successfully`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
