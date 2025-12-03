import {
  misLogrosService,
  listarLogrosService,
} from "./logros.service.js";

/**
 * Devolver logros del usuario logueado
 * GET /api/logros/mios
 */
export const misLogrosController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario; // viene del JWT
    const logros = await misLogrosService(idUsuario);
    res.json(logros); // el front espera un array directo
  } catch (e) {
    next(e);
  }
};

/**
 * Listado completo de logros (solo admin)
 * Soporta filtro opcional:
 *   GET /api/logros?id_tipo_logro=1
 */
export const listarLogrosController = async (req, res, next) => {
  try {
    const idTipo = req.query.id_tipo_logro
      ? Number(req.query.id_tipo_logro)
      : undefined;

    if (idTipo !== undefined && !Number.isFinite(idTipo)) {
      return res.status(400).json({ message: "id_tipo_logro inválido" });
    }

    const logros = await listarLogrosService(idTipo);

    res.json({
      message: "Listado de logros",
      filtro: idTipo ? { id_tipo_logro: idTipo } : null,
      data: logros,
    });
  } catch (e) {
    next(e);
  }
};
