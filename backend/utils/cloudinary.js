/**
 * utils/cloudinary.js
 * --------------------
 * Cloudinary upload and deletion utilities.
 *
 * Wraps the Cloudinary SDK with error handling and structured return values.
 * All complaint image uploads and avatar uploads go through these helpers.
 *
 * Files uploaded via Multer (from /uploads) are streamed to Cloudinary
 * and then deleted from local disk.
 */

import { promises as fs } from "fs";
import cloudinary from "../config/cloudinary.js";
import { AppError } from "./AppError.js";

/**
 * Uploads a file from disk to Cloudinary.
 *
 * @param {string} filePath      - Absolute path to the temp file on disk
 * @param {string} folder        - Cloudinary folder (e.g. "campusresolve/complaints")
 * @param {object} [options]     - Additional Cloudinary upload options
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = async (filePath, folder, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
      ...options,
    });

    // Delete the temp file from disk after successful upload
    await fs.unlink(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    // Attempt cleanup even on failure
    try {
      await fs.unlink(filePath);
    } catch (_cleanupErr) {
      // Ignore cleanup errors
    }
    throw new AppError(`Cloudinary upload failed: ${err.message}`, 500);
  }
};

/**
 * Deletes an asset from Cloudinary by public ID.
 *
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    throw new AppError(`Cloudinary deletion failed: ${err.message}`, 500);
  }
};
