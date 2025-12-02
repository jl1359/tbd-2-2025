// src/modules/publicidad/publicidad.routes.js
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";

import {
  listarPublicidadActivaController,
  crearPublicidadController,
  listarPublicidadAdminController,
  buscarPublicacionesParaPublicidadController,
  cambiarEstadoPublicidadController,
  eliminarPublicidadController,
} from "./publicidad.controller.js";

const router = Router();

/* ===========================
   PUBLICA
=========================== */
router.get("/activa", listarPublicidadActivaController);

/* ===========================
   SOLO ADMIN
=========================== */
router.use(authMiddleware, isAdmin);

router.get("/admin", listarPublicidadAdminController);

router.get("/buscar-publicaciones", buscarPublicacionesParaPublicidadController);

router.post("/", crearPublicidadController);

router.patch("/:id/estado", cambiarEstadoPublicidadController);

router.delete("/:id", eliminarPublicidadController);

export default router;
