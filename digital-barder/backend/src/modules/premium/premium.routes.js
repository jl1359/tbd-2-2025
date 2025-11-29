// premium.routes.js
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import {
  miPlanPremiumController,
  activarPremiumController,
} from "./premium.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/mi-plan", miPlanPremiumController);
router.post("/activar", activarPremiumController);

export default router;
