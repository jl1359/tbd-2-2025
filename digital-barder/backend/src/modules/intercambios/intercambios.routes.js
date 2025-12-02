import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import {
  crearIntercambioController,
  misComprasController,
  misVentasController,
  detalleTransaccionController,
} from "./intercambios.controller.js";

const router = Router();

// Todas las rutas requieren estar logueado
router.use(authMiddleware);

// Crear nuevo intercambio
router.post("/", crearIntercambioController);

// Ver mis compras
router.get("/mis-compras", misComprasController);

// Ver mis ventas
router.get("/mis-ventas", misVentasController);

// Detalle de una transacción
router.get("/:id", detalleTransaccionController);

export default router;
