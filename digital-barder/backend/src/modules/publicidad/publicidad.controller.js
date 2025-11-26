// src/modules/publicidad/publicidad.controller.js

// Servicios propios del módulo PUBLICIDAD
import {
  crearPublicidadService,
  listarPublicidadActivaService,
  listarPublicidadAdminService,
} from "./publicidad.service.js";

// Servicio del módulo PUBLICACIONES (ruta correcta)
import { buscarPublicacionesService } from "../publicaciones/publicaciones.service.js";

/**
 * Convierte BigInt, Date, Prisma.Decimal, etc. en tipos JSON-safe
 */
function toPlain(value) {
  if (typeof value === "bigint") return Number(value);

  if (value instanceof Date)
    return value.toISOString().slice(0, 19).replace("T", " ");

  if (value && typeof value === "object") {
    if (typeof value.toNumber === "function") {
      return value.toNumber();
    }

    const prim = value.valueOf?.();
    if (prim != null && typeof prim !== "object") return prim;

    if (Array.isArray(value)) return value.map((v) => toPlain(v));

    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = toPlain(v);
    return out;
  }

  return value;
}

/**
 * POST /api/publicidad
 * Crear anuncio publicitario (solo admin)
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

/**
 * GET /api/publicidad/activa
 * Publicidad visible para el FRONT (solo activas y en rango)
 */
export const listarPublicidadActivaController = async (req, res, next) => {
  try {
    const data = await listarPublicidadActivaService();
    res.json(toPlain(data));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/publicidad/admin
 * Lista TODA la publicidad (panel administrador)
 */
export const listarPublicidadAdminController = async (req, res, next) => {
  try {
    const data = await listarPublicidadAdminService();
    res.json(toPlain(data));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/publicidad/buscar-publicaciones?q=
 * Buscar publicaciones para vincularlas a un banner
 */
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
