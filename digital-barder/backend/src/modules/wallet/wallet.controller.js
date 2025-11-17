// src/modules/wallet/wallet.controller.js
import { prisma } from '../../config/prisma.js'

export async function obtenerBilleteraUsuario(req, res, next) {
    try {
        const idUsuario = Number(req.params.idUsuario)

        const billetera = await prisma.billetera.findUnique({
        where: { id_usuario: idUsuario },
        })

        if (!billetera) {
        return res.status(404).json({
            ok: false,
            message: 'Billetera no encontrada para el usuario',
        })
        }

        res.json(billetera)
    } catch (err) {
        next(err)
    }
}

export async function movimientosUsuario(req, res, next) {
    try {
        const idUsuario = Number(req.params.idUsuario)

        const movimientos = await prisma.movimiento_creditos.findMany({
        where: { id_usuario: idUsuario },
        orderBy: { id_movimiento: 'desc' },
        })

        res.json(movimientos)
    } catch (err) {
        next(err)
    }
}
