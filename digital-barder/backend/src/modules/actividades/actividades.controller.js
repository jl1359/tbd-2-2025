import {
  registrarActividadService,
  misActividadesService,
} from "./actividades.service.js";

export const registrarActividadController = async (req, res, next) => {
  try {
    const idUsuario = req.user.id_usuario;
    const { id_tipo_actividad, descripcion, creditos_otorgados, evidencia_url } = req.body;

    const result = await registrarActividadService({
      idUsuario,
      id_tipo_actividad,
      descripcion,
      creditos_otorgados,
      evidencia_url,
    });

    res.status(201).json(result);
  } catch (e) { next(e); }
};

export const misActividadesController = async (req, res, next) => {
  try { res.json(await misActividadesService(req.user.id_usuario)); }
  catch (e) { next(e); }
};
