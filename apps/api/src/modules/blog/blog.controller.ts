import type { Request, Response, NextFunction } from 'express';
import { BlogService } from './blog.service.js';
import { validateRequest } from '../../middlewares/errorMiddleware.js';
import {
  createPostBodySchema,
  updatePostBodySchema,
  postQuerySchema,
  createPostCategoryBodySchema,
  updatePostCategoryBodySchema,
} from '@repo/shared-types';

export const BlogController = {
  // ── Post Categories ────────────────────────────────────────────────────────

  async listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cats = await BlogService.listCategories();
      res.json({ success: true, data: cats });
    } catch (err) {
      next(err);
    }
  },

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cat = await BlogService.getCategoryBySlug(req.params.slug as string);
      res.json({ success: true, data: cat });
    } catch (err) {
      next(err);
    }
  },

  createCategory: [
    validateRequest(createPostCategoryBodySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const cat = await BlogService.createCategory(req.body);
        res.status(201).json({ success: true, data: cat });
      } catch (err) {
        next(err);
      }
    },
  ],

  updateCategory: [
    validateRequest(updatePostCategoryBodySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const cat = await BlogService.updateCategory(req.params.id as string, req.body);
        res.json({ success: true, data: cat });
      } catch (err) {
        next(err);
      }
    },
  ],

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await BlogService.deleteCategory(req.params.id as string);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },

  // ── Posts ─────────────────────────────────────────────────────────────────

  async listPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = postQuerySchema.parse(req.query);
      const result = await BlogService.queryPosts(q, true);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async adminListPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = postQuerySchema.parse(req.query);
      const result = await BlogService.queryPosts(q, false); // admin sees drafts
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await BlogService.getPostBySlug(req.params.slug as string);
      res.json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  },

  async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await BlogService.getPostById(req.params.id as string);
      res.json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  },

  createPost: [
    validateRequest(createPostBodySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const post = await BlogService.createPost(req.body);
        res.status(201).json({ success: true, data: post });
      } catch (err) {
        next(err);
      }
    },
  ],

  updatePost: [
    validateRequest(updatePostBodySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const post = await BlogService.updatePost(req.params.id as string, req.body);
        res.json({ success: true, data: post });
      } catch (err) {
        next(err);
      }
    },
  ],

  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await BlogService.deletePost(req.params.id as string);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },

  async getLatestPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 3;
      const posts = await BlogService.getLatestPosts(limit);
      res.json({ success: true, data: posts });
    } catch (err) {
      next(err);
    }
  },
};
