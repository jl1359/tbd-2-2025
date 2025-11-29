import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import {
  misLogrosController,
  listarLogrosController,
} from "./logros.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/mios", misLogrosController);

// sólo admin ve catálogo completo
router.get("/", isAdmin, listarLogrosController);

export default router;
