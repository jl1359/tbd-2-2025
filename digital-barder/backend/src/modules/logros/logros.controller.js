import {
  misLogrosService,
  listarLogrosService,
} from "./logros.service.js";

export const misLogrosController = async (req, res, next) => {
  try { res.json(await misLogrosService(req.user.id_usuario)); }
  catch (e) { next(e); }
};

export const listarLogrosController = async (_req, res, next) => {
  try { res.json(await listarLogrosService()); }
  catch (e) { next(e); }
};
