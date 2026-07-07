/**
 * middlewares/upload.middleware.js
 * ---------------------------------
 * Multer configuration for local disk staging before Cloudinary upload.
 *
 * Files are temporarily stored in /uploads during the request lifecycle.
 * The Cloudinary upload utility streams them to the CDN, then they are
 * deleted from disk.
 *
 * File size limit: 5MB per file
 * Allowed types: JPEG, PNG, WebP
 */

import multer from "multer";
import path from "path";
import { AppError } from "../utils/AppError.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError("Only JPEG, PNG, and WebP images are allowed.", 400),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
