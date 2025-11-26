import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import {
  getMisCreditosController,
  getMisMovimientosController,
  postCompraCreditosController,
  getMisComprasController,
} from "./wallet.controller.js";

const router = Router();

router.use(authMiddleware);

// GET /api/wallet/mis-creditos
router.get("/mis-creditos", getMisCreditosController);

// GET /api/wallet/mis-movimientos
router.get("/mis-movimientos", getMisMovimientosController);

// POST /api/wallet/compra-creditos
router.post("/compra-creditos", postCompraCreditosController);

// GET /api/wallet/compras
router.get("/compras", getMisComprasController);

export default router;
