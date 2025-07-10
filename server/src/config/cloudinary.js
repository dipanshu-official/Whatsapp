import "dotenv/config";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (file) => {
  const options = {
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
  };

  return new Promise((resolve, reject) => {
    const uploader = file.mimetype.startsWith("video")
      ? cloudinary.uploader.upload_large
      : cloudinary.uploader.upload;
    uploader(file.path, options, (error, result) => {
      fs.unlink(file.path, (err) => {});
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export const multerMiddleware = multer({dest:"uploads/"}).single("file");
