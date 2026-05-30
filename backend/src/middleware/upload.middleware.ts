// import type { NextFunction } from 'express';
// import multer, { type FileFilterCallback } from 'multer';
// import { ApiError } from '../utils/api-response';

// const MAX_FILE_SIZE = 10 * 1024 * 1024;

// const ALLOWED_MIME_TYPES = [
//   'image/jpeg',
//   'image/png',
//   'image/webp',
//   'image/gif',
//   'application/pdf',
//   'application/msword',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// ];

// const fileFilter = (
//   _req: Express.Request,
//   file: Express.Multer.File,
//   cb: FileFilterCallback
// ) => {
//   if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new ApiError(
//         400,
//         `File type not allowed. Accepted types: images, PDF, DOC, DOCX.`
//       )
//     );
//   }
// };

// export const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter,
//   limits: {
//     fileSize: MAX_FILE_SIZE,
//   },
// });

// export const multerErrorHandler = (
//   err: unknown,
//   _req: Express.Request,
//   _res: Express.Response,
//   next: NextFunction
// ) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return next(new ApiError(400, 'File too large. Maximum size is 10MB.'));
//     }
//   }
//   next(err);
// };
