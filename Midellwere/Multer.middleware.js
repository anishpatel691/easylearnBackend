import multer from "multer";

const storage = multer.memoryStorage(); // ✅ Store file in memory for Cloudinary upload

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type! Only videos are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
