import { Router } from "express";
import {
    registerController,
    loginController,
    meController,
} from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.js";

const router = Router();

// Registro público (rol COMPRADOR)
router.post("/register", registerController);

// Login
router.post("/login", loginController);

// Datos del usuario logueado
router.get("/me", authMiddleware, meController);

export default router;
