import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
// Yeh function ab do parameter lega: subfolder aur fileType ('image' ya 'document')
const multerUpload = (subfolder, fileType = "image") => {
  const uploadDir = path.join("public", "uploads", subfolder);

  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const randomName = crypto.randomBytes(8).toString("hex");
      cb(null, `${subfolder}-${Date.now()}-${randomName}${ext}`);
    },
  });

  // 👇 YAHAN PAR HAI MAIN CHANGE 👇
  const fileFilter = (req, file, cb) => {
    let allowedTypes;

    // fileType ke hisaab se allowed extensions set karo
    if (fileType === "image") {
      allowedTypes = /jpeg|jpg|png|gif|webp/;
    } else if (fileType === "document") {
      allowedTypes = /pdf|doc|docx/;
    } else {
      // Agar koi anjaan type hai, toh error de do
      return cb(new Error("Invalid file type specified for upload."), false);
    }

    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      const errorMessage =
        fileType === "image"
          ? "Only image files (jpeg, jpg, png, gif, webp) are allowed!"
          : "Only document files (pdf, doc, docx) are allowed!";
      cb(new Error(errorMessage), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit (good practice)
  });
};

export default multerUpload;
