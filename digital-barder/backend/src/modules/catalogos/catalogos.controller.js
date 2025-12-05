// src/modules/catalogos/catalogos.controller.js
import {
  listarCategorias,
  listarUnidadesMedida,
  listarPaquetesCreditos,
  listarTiposActividad,
  listarTiposPromocion,
  listarUbicacionesPublicidad,
  listarTiposLogro,
  // Opcional (para admin – CRUD)
  crearCatalogoService,
  editarCatalogoService,
} from "./catalogos.service.js";

// Helper para respuestas limpias
//  ANTES: devolvía { ok: true, data }
//  AHORA: devolvemos directamente data (array/objeto)
function ok(res, data) {
  return res.json(data);
}

/* =======================
   CATÁLOGOS PÚBLICOS
   ======================= */

export const getCategorias = async (_req, res, next) => {
  try {
    ok(res, await listarCategorias());
  } catch (e) {
    next(e);
  }
};

export const getUnidadesMedida = async (_req, res, next) => {
  try {
    ok(res, await listarUnidadesMedida());
  } catch (e) {
    next(e);
  }
};

export const getPaquetesCreditos = async (_req, res, next) => {
  try {
    ok(res, await listarPaquetesCreditos());
  } catch (e) {
    next(e);
  }
};

export const getTiposActividad = async (_req, res, next) => {
  try {
    ok(res, await listarTiposActividad());
  } catch (e) {
    next(e);
  }
};

export const getTiposPromocion = async (_req, res, next) => {
  try {
    ok(res, await listarTiposPromocion());
  } catch (e) {
    next(e);
  }
};

export const getUbicacionesPublicidad = async (_req, res, next) => {
  try {
    ok(res, await listarUbicacionesPublicidad());
  } catch (e) {
    next(e);
  }
};

export const getTiposLogro = async (_req, res, next) => {
  try {
    ok(res, await listarTiposLogro());
  } catch (e) {
    next(e);
  }
};

/* =======================
   OPCIONAL: ADMIN – CRUD
   ======================= */

export const crearCatalogoController = async (req, res, next) => {
  try {
    const { tabla, nombre } = req.body;
    const result = await crearCatalogoService(tabla, nombre);
    res
      .status(201)
      .json({ ok: true, message: "Creado correctamente", data: result });
  } catch (e) {
    next(e);
  }
};

export const editarCatalogoController = async (req, res, next) => {
  try {
    const { tabla, id, nombre } = req.body;
    const result = await editarCatalogoService(tabla, id, nombre);
    res.json({ ok: true, message: "Actualizado correctamente", data: result });
  } catch (e) {
    next(e);
  }
};
