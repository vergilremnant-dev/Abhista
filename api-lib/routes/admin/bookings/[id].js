import { verifyToken, hasRole } from '../../../utils/auth.js';
import { adminUpdateBookingStatus } from '../../../services/bookingService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    if (!hasRole(user, ['ADMIN'])) {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    const { id } = req.query;
    const paramId = Array.isArray(id) ? id[0] : id;
    if (!paramId) {
        return res.status(400).json({ success: false, message: 'Missing booking ID parameter' });
    }
    const method = req.method;
    if (method !== 'PATCH') {
        res.setHeader('Allow', ['PATCH']);
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'status field is required in body' });
        }
        const updated = await adminUpdateBookingStatus(paramId, status);
        return res.status(200).json({
            success: true,
            message: 'Booking status updated successfully by Admin',
            data: updated,
        });
    }
    catch (err) {
        const msg = err.message || '';
        if (msg.includes('not found')) {
            return res.status(404).json({ success: false, message: msg });
        }
        return res.status(400).json({ success: false, message: msg });
    }
}
