import multer from "multer";
import path from "path";
import fs from "fs";


const uploadPath = "uploads/";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// file filter (VERY IMPORTANT for security)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/i;
  // Check mime
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, jpg, png) are allowed"), false);
  }
};

// limits (prevent large uploads attack)
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
