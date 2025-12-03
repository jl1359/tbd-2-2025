import {
  listarPromocionesService,
  crearPromocionService,
  actualizarEstadoPromocionService,
  vincularPublicacionService,
} from "./promociones.service.js";

export const listarPromocionesController = async (_req, res, next) => {
  try {
    const promos = await listarPromocionesService();
    res.json(promos);
  } catch (e) {
    next(e);
  }
};

export const crearPromocionController = async (req, res, next) => {
  try {
    const promo = await crearPromocionService(req.body);
    res.status(201).json(promo);
  } catch (e) {
    next(e);
  }
};

export const actualizarEstadoPromocionController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID de promoción inválido" });
    }

    const { estado } = req.body;
    const promo = await actualizarEstadoPromocionService(id, estado);

    res.json({
      message: "Estado de promoción actualizado",
      data: promo,
    });
  } catch (e) {
    next(e);
  }
};

export const vincularPublicacionController = async (req, res, next) => {
  try {
    const idPromocion = Number(req.params.id);
    if (!Number.isFinite(idPromocion)) {
      return res.status(400).json({ message: "ID de promoción inválido" });
    }

    const { id_publicacion } = req.body;
    await vincularPublicacionService(idPromocion, id_publicacion);

    res.status(201).json({ message: "Publicación vinculada correctamente" });
  } catch (e) {
    next(e);
  }
};
