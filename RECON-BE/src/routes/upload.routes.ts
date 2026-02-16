import express from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateParams } from '../middleware/validation.middleware.js';
import { deleteImageParams } from '../validations/upload.validations.js';
import * as response from '../utils/response.js';
import * as uploadService from '../services/upload.service.js';

const router = express.Router();

router.post(
  '/image',
  requireAuth,
  requireRole(['ADMIN', 'STAFF']),
  upload.single('image'),
  async (req, res) => {
    const file = req.file;
    if (!file) {
      response.error(res, 'No image file provided', 400);
      return;
    }
    try {
      const result = await uploadService.uploadSingleImage(file.buffer);
      response.success(res, { message: 'Image uploaded successfully', url: result.url, public_id: result.public_id });
    } catch (err) {
      response.error(res, 'Failed to upload image', 500);
    }
  }
);

router.post(
  '/images',
  requireAuth,
  requireRole(['ADMIN', 'STAFF']),
  upload.array('images', 10),
  async (req, res) => {
    if (!req.files || req.files.length === 0) {
      response.error(res, 'No images provided', 400);
      return;
    }
    try {
      const buffers = (req.files as Express.Multer.File[]).map((f) => f.buffer);
      const images = await uploadService.uploadMultipleImages(buffers);
      response.success(res, { message: 'Images uploaded successfully', images });
    } catch (err) {
      response.error(res, 'Failed to upload images', 500);
    }
  }
);

router.delete(
  '/image/:public_id',
  requireAuth,
  requireRole(['ADMIN', 'STAFF']),
  validateParams(deleteImageParams),
  async (req, res) => {
    try {
      await uploadService.deleteImage(String(req.params.public_id));
      response.success(res, { message: 'Image deleted successfully' });
    } catch (err) {
      response.error(res, 'Failed to delete image', 500);
    }
  }
);

export default router;
