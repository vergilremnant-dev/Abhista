import { verifyToken, hasRole } from '../../../utils/auth.js';
import { createBlogCategory, listBlogCategories } from '../../../services/articleService.js';
export default async function handler(req, res) {
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    if (!hasRole(user, ['ADMIN'])) {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    const method = req.method;
    if (method === 'GET') {
        try {
            const categories = await listBlogCategories(false);
            return res.status(200).json({ success: true, data: categories });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    else if (method === 'POST') {
        try {
            const { name, description } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Category name is required' });
            }
            const category = await createBlogCategory(name, description);
            return res.status(201).json({
                success: true,
                message: 'Blog category created successfully',
                data: category,
            });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
