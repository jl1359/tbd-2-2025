import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import {
  crearIntercambioController,
  misComprasController,
  misVentasController,
  detalleTransaccionController,
} from "./intercambios.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", crearIntercambioController);
router.get("/mis-compras", misComprasController);
router.get("/mis-ventas", misVentasController);
router.get("/:id", detalleTransaccionController);

export default router;
