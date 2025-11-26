import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import {
  registrarActividadController,
  misActividadesController,
} from "./actividades.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", registrarActividadController);
router.get("/mias", misActividadesController);

export default router;
