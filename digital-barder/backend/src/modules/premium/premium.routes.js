// premium.routes.js
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import {
  miPlanPremiumController,
  activarPremiumController,
} from "./premium.controller.js";

const router = Router();

// Todas las rutas premium requieren estar autenticado
router.use(authMiddleware);

// Ver mi plan premium actual (la suscripción más reciente)
router.get("/mi-plan", miPlanPremiumController);

// Activar premium (30 días)
router.post("/activar", activarPremiumController);

export default router;
