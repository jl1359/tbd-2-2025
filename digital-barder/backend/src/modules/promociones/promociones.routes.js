import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import {
  listarPromocionesController,
  crearPromocionController,
  actualizarEstadoPromocionController,
  vincularPublicacionController,
} from "./promociones.controller.js";

const router = Router();

// Todo el módulo de promociones es solo ADMIN
router.use(authMiddleware, isAdmin);

// Listar promociones
router.get("/", listarPromocionesController);

// Crear nueva promoción
router.post("/", crearPromocionController);

// Cambiar estado de promoción
router.patch("/:id/estado", actualizarEstadoPromocionController);

// Vincular publicación a promoción (dispara bono vía trigger)
router.post("/:id/publicaciones", vincularPublicacionController);

export default router;
