// src/modules/publicidad/publicidad.controller.js
import {
  crearPublicidadService,
  listarPublicidadActivaService,
  listarPublicidadAdminService,
  cambiarEstadoPublicidadService,
  eliminarPublicidadService,
} from "./publicidad.service.js";

import { buscarPublicacionesService } from "../publicaciones/publicaciones.service.js";

function toPlain(value) {
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Date)
    return value.toISOString().slice(0, 19).replace("T", " ");

  if (value && typeof value === "object") {
    if (typeof value.toNumber === "function") return value.toNumber();
    if (Array.isArray(value)) return value.map(toPlain);

    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = toPlain(v);
    return out;
  }
  return value;
}

/* 
   PUBLICAS
 */
export const listarPublicidadActivaController = async (req, res, next) => {
  try {
    const data = await listarPublicidadActivaService();
    res.json(toPlain(data));
  } catch (err) {
    next(err);
  }
};

/* 
   ADMIN
 */
export const crearPublicidadController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const data = await crearPublicidadService(idUsuario, req.body);
    res.status(201).json(toPlain(data));
  } catch (err) {
    next(err);
  }
};

export const listarPublicidadAdminController = async (req, res, next) => {
  try {
    const data = await listarPublicidadAdminService();
    res.json(toPlain(data));
  } catch (err) {
    next(err);
  }
};

export const buscarPublicacionesParaPublicidadController = async (
  req,
  res,
  next
) => {
  try {
    const q = req.query.q || "";
    const data = await buscarPublicacionesService(q);
    res.json(toPlain(data));
  } catch (err) {
    next(err);
  }
};

/* 
  CAMBIAR ESTADO (SOLO ADMIN)
 */
export const cambiarEstadoPublicidadController = async (req, res, next) => {
  try {
    const idPublicidad = Number(req.params.id);
    const { estado } = req.body;

    const data = await cambiarEstadoPublicidadService(idPublicidad, estado, {
      esAdmin: true, // Ya pasó por isAdmin en el router
    });

    res.json({
      message: "Estado actualizado correctamente",
      publicidad: toPlain(data),
    });
  } catch (err) {
    next(err);
  }
};

/* 
  ELIMINAR (LÓGICO)
 */
export const eliminarPublicidadController = async (req, res, next) => {
  try {
    const idPublicidad = Number(req.params.id);
    const data = await eliminarPublicidadService(idPublicidad);

    res.json({
      message: "Publicidad eliminada (estado = 'ELIMINADA')",
      publicidad: toPlain(data),
    });
  } catch (err) {
    next(err);
  }
};
