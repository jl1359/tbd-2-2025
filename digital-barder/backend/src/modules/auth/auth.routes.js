import { Router } from "express";
import {
  registerController,
  loginController,
  meController,
  updateProfileController,
  changePasswordController,
} from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.js";

const router = Router();

// Registro público
router.post("/register", registerController);

// Login
router.post("/login", loginController);

// Datos del usuario logueado
router.get("/me", authMiddleware, meController);

// Actualizar perfil del usuario logueado
router.put("/me", authMiddleware, updateProfileController);

// Cambiar contraseña del usuario logueado
router.patch("/me/password", authMiddleware, changePasswordController);

export default router;
