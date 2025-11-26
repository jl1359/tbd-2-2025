import {
  listarCategorias,
  listarUnidadesMedida,
  listarPaquetesCreditos,
  listarTiposActividad,
  listarTiposPromocion,
  listarUbicacionesPublicidad,
  listarTiposLogro,
} from "./catalogos.service.js";

export const getCategorias = async (_req, res, next) => {
  try { res.json(await listarCategorias()); } catch (e) { next(e); }
};
export const getUnidadesMedida = async (_req, res, next) => {
  try { res.json(await listarUnidadesMedida()); } catch (e) { next(e); }
};
export const getPaquetesCreditos = async (_req, res, next) => {
  try { res.json(await listarPaquetesCreditos()); } catch (e) { next(e); }
};
export const getTiposActividad = async (_req, res, next) => {
  try { res.json(await listarTiposActividad()); } catch (e) { next(e); }
};
export const getTiposPromocion = async (_req, res, next) => {
  try { res.json(await listarTiposPromocion()); } catch (e) { next(e); }
};
export const getUbicacionesPublicidad = async (_req, res, next) => {
  try { res.json(await listarUbicacionesPublicidad()); } catch (e) { next(e); }
};
export const getTiposLogro = async (_req, res, next) => {
  try { res.json(await listarTiposLogro()); } catch (e) { next(e); }
};
