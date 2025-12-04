// backend/src/modules/intercambios/intercambios.controller.js
import {
  crearIntercambioService,
  misComprasService,
  misVentasService,
  detalleTransaccionService,
  confirmarIntercambioService,
  cancelarIntercambioService,
} from "./intercambios.service.js";

export const crearIntercambioController = async (req, res, next) => {
  try {
    const idComprador = req.user.id_usuario;
    const { id_publicacion, creditos } = req.body; // creditos opcional

    if (!id_publicacion) {
      return res
        .status(400)
        .json({ message: "id_publicacion es obligatorio" });
    }

    const tx = await crearIntercambioService({
      idComprador,
      id_publicacion,
      creditos,
    });

    res.status(201).json({
      message: "Intercambio solicitado correctamente",
      transaccion: tx,
    });
  } catch (e) {
    next(e);
  }
};

export const confirmarIntercambioController = async (req, res, next) => {
  try {
    const idUsuarioAccion = req.user.id_usuario;
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID de transacción inválido" });
    }

    const tx = await confirmarIntercambioService({
      idUsuarioAccion,
      idTransaccion: id,
    });

    res.json({
      message: "Intercambio confirmado correctamente",
      transaccion: tx,
    });
  } catch (e) {
    next(e);
  }
};

export const cancelarIntercambioController = async (req, res, next) => {
  try {
    const idUsuarioAccion = req.user.id_usuario;
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID de transacción inválido" });
    }

    const tx = await cancelarIntercambioService({
      idUsuarioAccion,
      idTransaccion: id,
    });

    res.json({
      message: "Intercambio cancelado correctamente",
      transaccion: tx,
    });
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
