import {
  obtenerMisCreditosService,
  obtenerMisMovimientosService,
  comprarCreditosService,
  obtenerMisComprasService,
} from "./wallet.service.js";

export async function getMisCreditosController(req, res, next) {
  try {
    const idUsuario = req.user.id_usuario;
    const data = await obtenerMisCreditosService(idUsuario);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getMisMovimientosController(req, res, next) {
  try {
    const idUsuario = req.user.id_usuario;
    const data = await obtenerMisMovimientosService(idUsuario);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function postCompraCreditosController(req, res, next) {
  try {
    const idUsuario = req.user.id_usuario;
    const { idPaquete, idTransaccionPago } = req.body;

    if (!idPaquete) {
      return res.status(400).json({ message: "idPaquete es obligatorio" });
    }

    const billetera = await comprarCreditosService({
      idUsuario,
      idPaquete,
      idTransaccionPago: idTransaccionPago || null,
    });

    res.status(201).json({
      message: "Compra aprobada",
      billetera,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMisComprasController(req, res, next) {
  try {
    const idUsuario = req.user.id_usuario;
    const compras = await obtenerMisComprasService(idUsuario);
    res.json(compras);
  } catch (err) {
    next(err);
  }
}
