import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
}); 

const ImageuploadOnCloudinary = async (buffer) => {
    try {
        if (!buffer) {
            throw new Error("No file buffer provided!");
        }

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: "image" }, 
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            streamifier.createReadStream(buffer).pipe(stream);
        });
    } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error);
        return null;
    }
};

export default ImageuploadOnCloudinary;
