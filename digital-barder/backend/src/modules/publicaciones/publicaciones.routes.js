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
} from "./publicaciones.controller.js";

const router = Router();

// públicas
router.get("/", listarPublicacionesController);
router.get("/busqueda", buscarPublicacionesController);
router.get("/:id", obtenerPublicacionController);
router.get("/:id/calificaciones", listarCalificacionesController);

// protegidas
router.use(authMiddleware);

router.get("/mias/listado", misPublicacionesController);
router.post("/producto", crearPublicacionProductoController);
router.post("/servicio", crearPublicacionServicioController);
router.post("/:id/calificaciones", crearCalificacionController);

export default router;
