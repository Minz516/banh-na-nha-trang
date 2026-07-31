import { Router } from 'express';
import { BlogController } from './blog.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { publicRateLimit, apiRateLimit } from '../../middlewares/rateLimitMiddleware.js';
import { publicCache } from '../../middlewares/cacheMiddleware.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/latest', publicRateLimit, publicCache(120), BlogController.getLatestPosts);
router.get('/categories', publicRateLimit, publicCache(300), BlogController.listCategories);
router.get('/categories/:slug', publicRateLimit, publicCache(300), BlogController.getCategoryBySlug);
router.get('/', publicRateLimit, publicCache(120), BlogController.listPosts);
router.get('/:slug', publicRateLimit, publicCache(120), BlogController.getPostBySlug);

// ── Admin/staff ───────────────────────────────────────────────────────────────
router.get('/admin/all', verifyToken, apiRateLimit, BlogController.adminListPosts);
router.get('/admin/:id', verifyToken, apiRateLimit, BlogController.getPostById);
router.post('/', verifyToken, apiRateLimit, ...BlogController.createPost);
router.patch('/:id', verifyToken, apiRateLimit, ...BlogController.updatePost);
router.post('/categories', verifyToken, apiRateLimit, ...BlogController.createCategory);
router.patch('/categories/:id', verifyToken, apiRateLimit, ...BlogController.updateCategory);

// ── Admin only — destructive ─────────────────────────────────────────────────
router.delete('/:id', verifyToken, requireRole('admin'), apiRateLimit, BlogController.deletePost);
router.delete('/categories/:id', verifyToken, requireRole('admin'), apiRateLimit, BlogController.deleteCategory);

export default router;
