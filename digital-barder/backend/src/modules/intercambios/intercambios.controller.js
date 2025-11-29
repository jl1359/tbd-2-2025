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
    const tx = await crearIntercambioService({ idComprador, id_publicacion, creditos });
    res.status(201).json({ message: "Intercambio creado", transaccion: tx });
  } catch (e) { next(e); }
};

export const misComprasController = async (req, res, next) => {
  try { res.json(await misComprasService(req.user.id_usuario)); }
  catch (e) { next(e); }
};

export const misVentasController = async (req, res, next) => {
  try { res.json(await misVentasService(req.user.id_usuario)); }
  catch (e) { next(e); }
};

export const detalleTransaccionController = async (req, res, next) => {
  try { res.json(await detalleTransaccionService(+req.params.id)); }
  catch (e) { next(e); }
};
