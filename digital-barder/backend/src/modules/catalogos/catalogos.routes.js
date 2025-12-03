import { Router } from "express";
import {
  getCategorias,
  getUnidadesMedida,
  getPaquetesCreditos,
  getTiposActividad,
  getTiposPromocion,
  getUbicacionesPublicidad,
  getTiposLogro,
  // CRUD opcional solo admin
  crearCatalogoController,
  editarCatalogoController,
} from "./catalogos.controller.js";

import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";

const router = Router();

/* =======================
   RUTAS PÚBLICAS
   ======================= */
router.get("/categorias", getCategorias);
router.get("/unidades-medida", getUnidadesMedida);
router.get("/paquetes-creditos", getPaquetesCreditos);
router.get("/tipos-actividad", getTiposActividad);
router.get("/tipos-promocion", getTiposPromocion);
router.get("/ubicaciones-publicidad", getUbicacionesPublicidad);
router.get("/tipos-logro", getTiposLogro);

/* =======================
   RUTAS ADMIN (OPCIONALES)
   ======================= */
router.use(authMiddleware, isAdmin);

router.post("/admin/crear", crearCatalogoController);
router.put("/admin/editar", editarCatalogoController);

export default router;
