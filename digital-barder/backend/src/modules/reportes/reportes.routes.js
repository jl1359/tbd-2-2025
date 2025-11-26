import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import {
  repUsuariosActivosController,
  repUsuariosAbandonadosController,
  repIngresosCreditosController,
  repCreditosGenConsController,
  repIntercambiosCategoriaController,
  repPublicacionesVsIntercambiosController,
  repImpactoAcumuladoController,
  rankingUsuariosController,
} from "./reportes.controller.js";

const router = Router();

router.use(authMiddleware, isAdmin);

router.get("/usuarios-activos", repUsuariosActivosController);
router.get("/usuarios-abandonados", repUsuariosAbandonadosController);
router.get("/ingresos-creditos", repIngresosCreditosController);
router.get("/creditos-generados-consumidos", repCreditosGenConsController);
router.get("/intercambios-categoria", repIntercambiosCategoriaController);
router.get("/publicaciones-intercambios", repPublicacionesVsIntercambiosController);
router.get("/impacto-acumulado", repImpactoAcumuladoController);
router.get("/ranking-usuarios", rankingUsuariosController);

export default router;
