import {
  listarPromocionesService,
  crearPromocionService,
  actualizarEstadoPromocionService,
  vincularPublicacionService,
} from "./promociones.service.js";

export const listarPromocionesController = async (_req, res, next) => {
  try { res.json(await listarPromocionesService()); } catch (e) { next(e); }
};

export const crearPromocionController = async (req, res, next) => {
  try { res.status(201).json(await crearPromocionService(req.body)); }
  catch (e) { next(e); }
};

export const actualizarEstadoPromocionController = async (req, res, next) => {
  try {
    const id = +req.params.id;
    const { estado } = req.body;
    res.json(await actualizarEstadoPromocionService(id, estado));
  } catch (e) { next(e); }
};

export const vincularPublicacionController = async (req, res, next) => {
  try {
    const idPromocion = +req.params.id;
    const { id_publicacion } = req.body;
    await vincularPublicacionService(idPromocion, id_publicacion);
    res.status(201).json({ message: "Publicación vinculada" });
  } catch (e) { next(e); }
};
