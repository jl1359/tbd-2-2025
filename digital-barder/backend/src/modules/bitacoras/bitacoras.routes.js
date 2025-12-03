// src/modules/bitacoras/bitacoras.routes.js
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import {
  getAccesosController,
  getMisAccesosController,
  getBitacoraIntercambiosController,
} from "./bitacoras.controller.js";

const router = Router();

// Todas requieren login
router.use(authMiddleware);

// Admin: ver todos los accesos
router.get("/accesos", isAdmin, getAccesosController);

// Usuario: ver solo sus accesos
router.get("/mis-accesos", getMisAccesosController);

// Admin: bitácora de intercambios
router.get("/intercambios", isAdmin, getBitacoraIntercambiosController);

export default router;
