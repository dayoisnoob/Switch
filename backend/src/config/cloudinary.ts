import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

console.log('Checking Cloudinary Keys in Prod:', {
  hasName: !!env.CLOUDINARY_CLOUD_NAME,
  hasKey: !!env.CLOUDINARY_API_KEY,
  hasSecret: !!env.CLOUDINARY_API_SECRET,
  rawKey: env.CLOUDINARY_API_KEY ? 'EXISTS' : 'MISSING',
});

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
