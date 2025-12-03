import {
  crearIntercambioService,
  misComprasService,
  misVentasService,
  detalleTransaccionService,
} from "./intercambios.service.js";

export const crearIntercambioController = async (req, res, next) => {
  try {
    const idComprador = req.user.id_usuario;
    const { id_publicacion, creditos } = req.body;

    const tx = await crearIntercambioService({
      idComprador,
      id_publicacion,
      creditos,
    });

    res
      .status(201)
      .json({ message: "Intercambio creado correctamente", transaccion: tx });
  } catch (e) {
    next(e);
  }
};

export const misComprasController = async (req, res, next) => {
  try {
    const compras = await misComprasService(req.user.id_usuario);
    res.json(compras);
  } catch (e) {
    next(e);
  }
};

export const misVentasController = async (req, res, next) => {
  try {
    const ventas = await misVentasService(req.user.id_usuario);
    res.json(ventas);
  } catch (e) {
    next(e);
  }
};

export const detalleTransaccionController = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID de transacción inválido" });
    }

    const detalle = await detalleTransaccionService(id);
    res.json(detalle);
  } catch (e) {
    next(e);
  }
};
