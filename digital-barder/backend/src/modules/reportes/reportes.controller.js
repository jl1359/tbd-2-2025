// src/modules/reportes/reportes.controller.js
import {
  repUsuariosActivosService,
  repUsuariosAbandonadosService,
  repIngresosCreditosService,
  repCreditosGenConsService,
  repIntercambiosCategoriaService,
  repPublicacionesVsIntercambiosService,
  repImpactoAcumuladoService,
  rankingUsuariosService,
} from "./reportes.service.js";

/**
 * Helper para convertir BigInt / Date / Decimal a tipos serializables
 */
function toPlain(value) {
  if (typeof value === "bigint") return Number(value);

  if (value instanceof Date) {
    return value.toISOString().slice(0, 19).replace("T", " ");
  }

  if (value && typeof value === "object") {
    if (typeof value.toNumber === "function") return value.toNumber();

    const prim = value.valueOf?.();
    if (prim != null && typeof prim !== "object") return prim;

    if (Array.isArray(value)) return value.map((v) => toPlain(v));

    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = toPlain(v);
    }
    return out;
  }

  return value;
}

function rango(req) {
  return { desde: req.query.desde, hasta: req.query.hasta };
}

export const repUsuariosActivosController = async (req, res, next) => {
  try {
    const data = await repUsuariosActivosService(rango(req));
    res.json(toPlain(data));
  } catch (e) {
    next(e);
  }
};

export const repUsuariosAbandonadosController = async (req, res, next) => {
  try {
    const data = await repUsuariosAbandonadosService(rango(req));
    res.json(toPlain(data));
  } catch (e) {
    next(e);
  }
};

export const repIngresosCreditosController = async (req, res, next) => {
  try {
    const data = await repIngresosCreditosService(rango(req));
    res.json(toPlain(data));
  } catch (e) {
    next(e);
  }
};

export const repCreditosGenConsController = async (req, res, next) => {
  try {
    const data = await repCreditosGenConsService(rango(req));
    res.json(toPlain(data));
  } catch (e) {
    next(e);
  }
};

export const repIntercambiosCategoriaController = async (req, res, next) => {
  try {
    const data = await repIntercambiosCategoriaService(rango(req));
    res.json(toPlain(data));
  } catch (e) {
    next(e);
  }
};

export const repPublicacionesVsIntercambiosController = async (
  req,
  res,
  next
) => {
  try {
    const data = await repPublicacionesVsIntercambiosService(rango(req));
    res.json(toPlain(data));
  } catch (e) {
    next(e);
  }
};

export const repImpactoAcumuladoController = async (req, res, next) => {
  try {
    const { id_tipo_reporte, id_periodo } = req.query;

    // Asegurar números (o null)
    const tipoReporte = id_tipo_reporte ? parseInt(id_tipo_reporte, 10) : null;
    const periodo     = id_periodo ? parseInt(id_periodo, 10) : null;

    const data = await repImpactoAcumuladoService(tipoReporte, periodo);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

export const rankingUsuariosController = async (req, res, next) => {
  try {
    const idPeriodo = req.query.id_periodo
      ? parseInt(req.query.id_periodo, 10)
      : null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

    const data = await rankingUsuariosService(idPeriodo, limit);
    res.json(toPlain(data));
  } catch (e) {
    next(e);
  }
};
