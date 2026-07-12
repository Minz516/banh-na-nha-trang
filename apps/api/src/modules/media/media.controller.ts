import type { Request, Response, NextFunction } from 'express';
import { cloudinary } from '../../config/cloudinary.config.js';
import { AppError } from '../../middlewares/errorMiddleware.js';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export const MediaController = {
  /**
   * POST /media/upload — upload one image to Cloudinary.
   * Requires multipart/form-data with field name "file".
   */
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new AppError(400, 'Không có file được tải lên');

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'banh-trang-nha-na',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error || !result) return reject(error ?? new Error('Upload failed'));
            resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });

      res.status(201).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /media/:publicId — delete an image from Cloudinary.
   * publicId is URL-encoded to handle slashes in Cloudinary folder paths.
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = decodeURIComponent(req.params.publicId as string);
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new AppError(500, 'Xóa ảnh thất bại');
      }

      res.json({ success: true, data: { result: result.result } });
    } catch (err) {
      next(err);
    }
  },
};
