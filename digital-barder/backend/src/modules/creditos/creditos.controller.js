// src/modules/creditos/creditos.controller.js
import { prisma } from '../../config/prisma.js'

export async function listarPaquetesCreditos(_req, res, next) {
    try {
        const paquetes = await prisma.paquete_creditos.findMany({
        where: { activo: true },
        orderBy: { cantidad_creditos: 'asc' },
        })
        res.json(paquetes)
    } catch (err) {
        next(err)
    }
}

export async function comprarPaqueteCreditos(req, res, next) {
    try {
        const { id_usuario, id_paquete, id_transaccion_pago } = req.body || {}

        if (!id_usuario || !id_paquete) {
        return res.status(400).json({
            ok: false,
            message: 'id_usuario e id_paquete son requeridos',
        })
        }

        await prisma.$executeRaw`
        CALL sp_compra_creditos_aprobar(${Number(id_usuario)}, ${Number(
            id_paquete
        )}, ${id_transaccion_pago ?? null})
        `

        res.json({ ok: true, message: 'Compra aprobada' })
    } catch (err) {
        next(err)
    }
}
