import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import {
  listarUsuariosController,
  crearUsuarioAdminController,
  actualizarUsuarioController,
  cambiarEstadoUsuarioController,
  obtenerHistorialUsuarioController,
} from "./usuarios.controller.js";

const router = Router();

// Todo lo de aquí requiere admin
router.use(authMiddleware, isAdmin);

// GET /api/usuarios
router.get("/", listarUsuariosController);

// POST /api/usuarios
router.post("/", crearUsuarioAdminController);

// PUT /api/usuarios/:id
router.put("/:id", actualizarUsuarioController);

// PATCH /api/usuarios/:id/estado
router.patch("/:id/estado", cambiarEstadoUsuarioController);

// GET /api/usuarios/:id/historial
router.get("/:id/historial", obtenerHistorialUsuarioController);

export default router;
