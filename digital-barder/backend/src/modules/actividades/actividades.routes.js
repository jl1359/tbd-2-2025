import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import {
  registrarActividadController,
  misActividadesController,
  listarActividadesAdminController,
  aprobarActividadController,
  rechazarActividadController,
} from "./actividades.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", registrarActividadController);            // POST /api/actividades-sostenibles
router.get("/mias", misActividadesController);             // GET  /api/actividades-sostenibles/mias
router.get("/admin", isAdmin, listarActividadesAdminController); // GET /api/actividades-sostenibles/admin

router.patch("/:id/aprobar", isAdmin, aprobarActividadController);   // PATCH /api/actividades-sostenibles/:id/aprobar
router.patch("/:id/rechazar", isAdmin, rechazarActividadController); // PATCH /api/actividades-sostenibles/:id/rechazar

export default router;
