import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { upload } from "./multer.js";
import { subirArchivoController } from "./uploads.controller.js";

const router = Router();

// Ruta protegida: requiere login
router.post("/", authMiddleware, upload.single("archivo"), subirArchivoController);

export default router;
