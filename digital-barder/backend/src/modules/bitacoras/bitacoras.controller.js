// src/modules/bitacoras/bitacoras.controller.js
import {
  listarAccesosService,
  listarBitacoraIntercambiosService,
} from "./bitacoras.service.js";

function toInt(v, def = null) {
  const n = Number(v);
  return Number.isNaN(n) ? def : n;
}

/**
 * GET /api/bitacoras/accesos
 * Admin: lista accesos (con paginación y filtro opcional por idUsuario)
 */
export async function getAccesosController(req, res, next) {
  try {
    const { page, pageSize, idUsuario } = req.query;

    const result = await listarAccesosService({
      page: toInt(page, 1),
      pageSize: toInt(pageSize, 20),
      idUsuario: idUsuario ? toInt(idUsuario) : null,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bitacoras/mis-accesos
 * Usuario normal: ve solo sus propios accesos
 */
export async function getMisAccesosController(req, res, next) {
  try {
    const { page, pageSize } = req.query;
    const idUsuario = req.user.id_usuario;

    const result = await listarAccesosService({
      page: toInt(page, 1),
      pageSize: toInt(pageSize, 20),
      idUsuario,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bitacoras/intercambios
 * Admin: bitácora de intercambios.
 * Filtros opcionales: ?idTransaccion=&idUsuario=
 */
export async function getBitacoraIntercambiosController(req, res, next) {
  try {
    const { page, pageSize, idTransaccion, idUsuario } = req.query;

    const result = await listarBitacoraIntercambiosService({
      page: toInt(page, 1),
      pageSize: toInt(pageSize, 20),
      idTransaccion: idTransaccion ? toInt(idTransaccion) : null,
      idUsuario: idUsuario ? toInt(idUsuario) : null,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}
