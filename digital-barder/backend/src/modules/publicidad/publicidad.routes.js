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

/* 
   RUTAS PÚBLICAS
    */

// Publicidad visible en el sistema (HOME, publicaciones, etc.)
router.get("/activa", listarPublicidadActivaController);

/* 
   USUARIO AUTENTICADO
    */

// Desde aquí, solo usuarios logueados
router.use(authMiddleware);

// Cualquier usuario logueado puede CREAR su campaña (queda PROGRAMADA)
router.post("/", crearPublicidadController);

/* 
   SOLO ADMIN (GESTIÓN)
    */

// Desde aquí, además debe ser ADMIN
router.use(isAdmin);

// Listado completo de campañas (todas, cualquier estado)
router.get("/admin", listarPublicidadAdminController);

// Búsqueda de publicaciones para asociar a campañas (si lo usas)
router.get(
  "/buscar-publicaciones",
  buscarPublicacionesParaPublicidadController
);

// Cambiar estado (PROGRAMADA, ACTIVA, PAUSADA, FINALIZADA, CANCELADA, ELIMINADA)
router.patch("/:id/estado", cambiarEstadoPublicidadController);

// Eliminado lógico (estado = ELIMINADA)
router.delete("/:id", eliminarPublicidadController);

export default router;
