// premium.controller.js
import {
  miPlanPremiumService,
  activarPremiumService,
} from "./premium.service.js";

export const miPlanPremiumController = async (req, res, next) => {
  try {
    res.json(await miPlanPremiumService(req.user.id_usuario));
  } catch (e) { next(e); }
};

export const activarPremiumController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const data = await activarPremiumService(idUsuario);
    res.status(201).json(data);
  } catch (e) { next(e); }
};
