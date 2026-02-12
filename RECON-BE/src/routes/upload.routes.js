import express from 'express';
import cloudinary from '../config/cloudinary.js';
import { upload } from '../middleware/upload.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';


const router = express.Router();

// Upload single image (Admin/Staff only)
router.post(
  '/image',
  requireAuth,
  requireRole(['ADMIN', 'STAFF']),
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'construction-projects',
            transformation: [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      res.json({
        message: 'Image uploaded successfully',
        url: result.secure_url,
        public_id: result.public_id
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

// Upload multiple images
router.post(
  '/images',
  requireAuth,
  requireRole(['ADMIN', 'STAFF']),
  upload.array('images', 10), // Max 10 images
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images provided' });
      }

      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'construction-projects',
              transformation: [
                { width: 1200, height: 800, crop: 'limit' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url: result.secure_url,
                public_id: result.public_id
              });
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);

      res.json({
        message: 'Images uploaded successfully',
        images: results
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }
);

// Delete image
router.delete(
  '/image/:public_id',
  requireAuth,
  requireRole(['ADMIN', 'STAFF']),
  async (req, res) => {
    try {
      const publicId = req.params.public_id.replace(/~/g, '/');
      await cloudinary.uploader.destroy(publicId);

      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  }
);

export default router;