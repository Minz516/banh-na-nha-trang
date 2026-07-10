import { Router } from 'express';
import { BlogController } from './blog.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/latest', BlogController.getLatestPosts);
router.get('/categories', BlogController.listCategories);
router.get('/categories/:slug', BlogController.getCategoryBySlug);
router.get('/', BlogController.listPosts);
router.get('/:slug', BlogController.getPostBySlug);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/all', verifyToken, requireRole('admin'), BlogController.adminListPosts);
router.get('/admin/:id', verifyToken, requireRole('admin'), BlogController.getPostById);
router.post('/', verifyToken, requireRole('admin'), ...BlogController.createPost);
router.patch('/:id', verifyToken, requireRole('admin'), ...BlogController.updatePost);
router.delete('/:id', verifyToken, requireRole('admin'), BlogController.deletePost);
router.post('/categories', verifyToken, requireRole('admin'), ...BlogController.createCategory);
router.patch('/categories/:id', verifyToken, requireRole('admin'), ...BlogController.updateCategory);
router.delete('/categories/:id', verifyToken, requireRole('admin'), BlogController.deleteCategory);

export default router;
