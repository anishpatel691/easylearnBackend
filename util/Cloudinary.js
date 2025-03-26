import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (buffer, mimetype) => {
  try {
    const resourceType = mimetype.startsWith("video/") ? "video" : "image"; // ✅ Detect file type

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder: "lectures" }, // ✅ Specify folder (optional)
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      streamifier.createReadStream(buffer).pipe(stream); // ✅ Convert buffer to stream
    });
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    return null;
  }
};

export default uploadOnCloudinary;
