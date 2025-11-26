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

router.use(authMiddleware, isAdmin);

router.get("/", listarPromocionesController);
router.post("/", crearPromocionController);
router.patch("/:id/estado", actualizarEstadoPromocionController);
router.post("/:id/publicaciones", vincularPublicacionController);

export default router;
