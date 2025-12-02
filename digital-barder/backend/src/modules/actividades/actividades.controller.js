import {
  registrarActividadService,
  misActividadesService,
  listarActividadesAdminService,
} from "./actividades.service.js";

/**
 * Registrar nueva actividad sostenible (usuario logueado)
 */
export const registrarActividadController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const {
      id_tipo_actividad,
      descripcion,
      creditos_otorgados,
      evidencia_url,
    } = req.body;

    const result = await registrarActividadService({
      idUsuario,
      id_tipo_actividad,
      descripcion,
      creditos_otorgados,
      evidencia_url,
    });

    res.status(201).json({
      message: "Actividad registrada correctamente",
      actividad: result,
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Listar SOLO mis actividades (usuario logueado)
 */
export const misActividadesController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const actividades = await misActividadesService(idUsuario);
    res.json(actividades);
  } catch (e) {
    next(e);
  }
};

/**
 * Listar actividades para ADMIN, con filtros opcionales:
 *  - ?id_usuario=...
 *  - ?id_tipo_actividad=...
 *  - ?desde=YYYY-MM-DD
 *  - ?hasta=YYYY-MM-DD
 */
export const listarActividadesAdminController = async (req, res, next) => {
  try {
    const { id_usuario, id_tipo_actividad, desde, hasta } = req.query;

    const filtros = {
      id_usuario: id_usuario ? Number(id_usuario) : undefined,
      id_tipo_actividad: id_tipo_actividad
        ? Number(id_tipo_actividad)
        : undefined,
      desde: desde || undefined,
      hasta: hasta || undefined,
    };

    const actividades = await listarActividadesAdminService(filtros);

    res.json({
      message: "Listado de actividades sostenibles",
      filtros,
      data: actividades,
    });
  } catch (e) {
    next(e);
  }
};
