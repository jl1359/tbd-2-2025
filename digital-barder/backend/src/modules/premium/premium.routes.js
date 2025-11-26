// premium.routes.js
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import {
  miPlanPremiumController,
} from "./premium.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/mi-plan", miPlanPremiumController);

export default router;
