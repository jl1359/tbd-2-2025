// uploads/multer.js
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads_storage"); // carpeta real donde iran las imágenes
  },
  filename: (req, file, cb) => {
    const unique = uuid();
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

export const upload = multer({ storage });
