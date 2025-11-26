// premium.controller.js
import { miPlanPremiumService } from "./premium.service.js";

export const miPlanPremiumController = async (req, res, next) => {
  try { res.json(await miPlanPremiumService(req.user.id_usuario)); }
  catch (e) { next(e); }
};
