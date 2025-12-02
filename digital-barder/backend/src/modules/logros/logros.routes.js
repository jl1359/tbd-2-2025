import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import {
  misLogrosController,
  listarLogrosController,
} from "./logros.controller.js";

const router = Router();

// Todas las rutas requieren estar logueado
router.use(authMiddleware);

// Ver mis logros (usuario normal)
router.get("/mios", misLogrosController);

// Catálogo completo de logros (solo admin, con filtro opcional)
router.get("/", isAdmin, listarLogrosController);

export default router;
