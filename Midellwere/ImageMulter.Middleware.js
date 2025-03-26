import multer from "multer";

const storage = multer.memoryStorage(); // Store file in memory for Cloudinary

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type! Only images are allowed."), false);
  }
};

const Imageupload = multer({ storage, fileFilter });

export default Imageupload;
