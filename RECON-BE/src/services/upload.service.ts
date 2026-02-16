import cloudinary from '../config/cloudinary.js';

export async function uploadSingleImage(buffer: Buffer): Promise<{ url: string; public_id: string }> {
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
        else if (result) resolve({ url: result.secure_url, public_id: result.public_id });
        else reject(new Error('No result'));
      }
    );
    uploadStream.end(buffer);
  });
}

export async function uploadMultipleImages(
  buffers: Buffer[]
): Promise<Array<{ url: string; public_id: string }>> {
  const results = await Promise.all(buffers.map((buf) => uploadSingleImage(buf)));
  return results;
}

export async function deleteImage(publicId: string): Promise<void> {
  const id = publicId.replace(/~/g, '/');
  await cloudinary.uploader.destroy(id);
}
