import { verifyToken, hasRole } from '../../../utils/auth.js';
import { listArticles, createArticle } from '../../../services/articleService.js';
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
            const { categorySlug, query, limit, offset } = req.query;
            const result = await listArticles({
                categorySlug: categorySlug ? String(categorySlug) : undefined,
                query: query ? String(query) : undefined,
                limit: limit ? Number(limit) : undefined,
                offset: offset ? Number(offset) : undefined,
                publishedOnly: false, // Return drafts too
            });
            return res.status(200).json({ success: true, data: result });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    else if (method === 'POST') {
        try {
            const article = await createArticle(req.body);
            return res.status(201).json({
                success: true,
                message: 'Article created successfully',
                data: article,
            });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
