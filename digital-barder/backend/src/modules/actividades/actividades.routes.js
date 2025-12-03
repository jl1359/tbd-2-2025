import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import {
  registrarActividadController,
  misActividadesController,
  listarActividadesAdminController,
} from "./actividades.controller.js";

const router = Router();

// Todas las rutas requieren estar logueado
router.use(authMiddleware);

// Registrar actividad sostenible (usuario)
router.post("/", registrarActividadController);

// Ver MIS actividades
router.get("/mias", misActividadesController);

// Listado ADMIN de actividades con filtros
router.get("/admin", isAdmin, listarActividadesAdminController);

export default router;
