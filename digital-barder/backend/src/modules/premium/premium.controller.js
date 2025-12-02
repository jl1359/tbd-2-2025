// premium.controller.js
import {
  miPlanPremiumService,
  activarPremiumService,
} from "./premium.service.js";

export const miPlanPremiumController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const plan = await miPlanPremiumService(idUsuario);
    res.json(plan);
  } catch (e) {
    next(e);
  }
};

export const activarPremiumController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const data = await activarPremiumService(idUsuario);
    res
      .status(201)
      .json({ message: "Suscripción premium activada correctamente", data });
  } catch (e) {
    next(e);
  }
};
