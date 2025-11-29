import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import {
  listarPublicidadActivaController,
  crearPublicidadController,
} from "./publicidad.controller.js";

const router = Router();

router.get("/", listarPublicidadActivaController);

router.use(authMiddleware);
router.post("/", crearPublicidadController);

export default router;
