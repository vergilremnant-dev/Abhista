import { verifyToken, hasRole } from '../../../utils/auth.js';
import { db } from '../../../utils/db.js';
import { updateReview, deleteReview } from '../../../services/reviewService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    if (!hasRole(user, ['CUSTOMER'])) {
        return res.status(403).json({ success: false, message: 'Forbidden: Customer access required' });
    }
    const { id } = req.query;
    const reviewId = Array.isArray(id) ? id[0] : id;
    if (!reviewId) {
        return res.status(400).json({ success: false, message: 'Review ID is required' });
    }
    const customerProfile = await db.customerProfile.findUnique({
        where: { userId: user.id },
    });
    if (!customerProfile) {
        return res.status(400).json({ success: false, message: 'Customer profile required' });
    }
    const method = req.method;
    if (method === 'PUT') {
        try {
            const updated = await updateReview(customerProfile.id, reviewId, req.body);
            return res.status(200).json({
                success: true,
                message: 'Review updated successfully',
                data: updated,
            });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
    else if (method === 'DELETE') {
        try {
            await deleteReview(customerProfile.id, reviewId);
            return res.status(200).json({
                success: true,
                message: 'Review deleted successfully',
            });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
