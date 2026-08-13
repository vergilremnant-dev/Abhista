import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../../api-lib/utils/auth.js';
import { getAppointmentById } from '../../../api-lib/services/appointmentService.js';

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

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Missing appointment ID parameter' });
  }

  try {
    const appointment = await getAppointmentById(paramId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify ownership
    const isCustomer = appointment.customer?.userId === user.id;
    const isProvider = appointment.provider?.userId === user.id;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized access to appointment details' });
    }

    return res.status(200).json({ success: true, data: appointment });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
