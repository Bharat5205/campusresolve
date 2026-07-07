/**
 * config/cloudinary.js
 * ---------------------
 * Configures and exports the Cloudinary SDK instance.
 *
 * Cloudinary is used exclusively for file uploads (complaint images, avatars).
 * The upload utility in utils/cloudinary.js uses this config.
 */

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
