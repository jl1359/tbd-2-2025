// backend/src/modules/intercambios/intercambios.routes.js
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import {
  crearIntercambioController,
  misComprasController,
  misVentasController,
  detalleTransaccionController,
  confirmarIntercambioController,
  cancelarIntercambioController,
} from "./intercambios.controller.js";

const router = Router();

// Todas las rutas requieren estar logueado
router.use(authMiddleware);

// Crear nuevo intercambio (aplica retención)
router.post("/", crearIntercambioController);

// Confirmar intercambio (normalmente lo hace el vendedor)
router.post("/:id/confirmar", confirmarIntercambioController);

// Cancelar intercambio (comprador o admin, según política)
router.post("/:id/cancelar", cancelarIntercambioController);

// Ver mis compras
router.get("/mis-compras", misComprasController);

// Ver mis ventas
router.get("/mis-ventas", misVentasController);

// Detalle de una transacción
router.get("/:id", detalleTransaccionController);

export default router;
