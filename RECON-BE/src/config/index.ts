import 'dotenv/config';
import { logger } from '../utils/logger.js';

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  logger.error({ missing: missing.join(', ') }, 'Missing required env. Check .env and .env.example.');
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  supabase: {
    url: process.env.SUPABASE_URL as string,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  groqApiKey: process.env.GROQ_API_KEY,
  frontendUrl: process.env.FRONTEND_URL || null,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : (process.env.NODE_ENV === 'production' ? 100 : 1000),
    authMax: process.env.AUTH_RATE_LIMIT_MAX ? Number(process.env.AUTH_RATE_LIMIT_MAX) : (process.env.NODE_ENV === 'production' ? 10 : 100),
  },
} as const;
