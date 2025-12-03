import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Carpeta física donde se guardan los archivos
    cb(null, "uploads_storage");
  },
  filename: (_req, file, cb) => {
    const unique = uuid();
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

export const upload = multer({ storage });
