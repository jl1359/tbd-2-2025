import { Router } from "express";
import {
  getCategorias,
  getUnidadesMedida,
  getPaquetesCreditos,
  getTiposActividad,
  getTiposPromocion,
  getUbicacionesPublicidad,
  getTiposLogro,
} from "./catalogos.controller.js";

const router = Router();

router.get("/categorias", getCategorias);
router.get("/unidades-medida", getUnidadesMedida);
router.get("/paquetes-creditos", getPaquetesCreditos);
router.get("/tipos-actividad", getTiposActividad);
router.get("/tipos-promocion", getTiposPromocion);
router.get("/ubicaciones-publicidad", getUbicacionesPublicidad);
router.get("/tipos-logro", getTiposLogro);

export default router;
