import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import {
  listarPublicacionesController,
  obtenerPublicacionController,
  crearPublicacionProductoController,
  crearPublicacionServicioController,
  misPublicacionesController,
  buscarPublicacionesController,
  crearCalificacionController,
  listarCalificacionesController,
  actualizarPublicacionController,
  cambiarEstadoPublicacionController,
  eliminarPublicacionController,
} from "./publicaciones.controller.js";

const router = Router();

/* ====== RUTAS PÚBLICAS ====== */
// Paginación opcional: ?page=1&pageSize=12
router.get("/", listarPublicacionesController);
router.get("/busqueda", buscarPublicacionesController);

// OJO: la más específica primero
router.get("/:id/calificaciones", listarCalificacionesController);
router.get("/:id", obtenerPublicacionController);

/* ====== RUTAS PROTEGIDAS (requieren login) ====== */
router.use(authMiddleware);

// Mis publicaciones
router.get("/mias/listado", misPublicacionesController);

// Crear publicaciones
router.post("/producto", crearPublicacionProductoController);
router.post("/servicio", crearPublicacionServicioController);

// Calificar publicación
router.post("/:id/calificaciones", crearCalificacionController);

// NUEVOS: editar / estado / eliminar
router.put("/:id", actualizarPublicacionController);
router.patch("/:id/estado", cambiarEstadoPublicacionController);
router.delete("/:id", eliminarPublicacionController);

export default router;
