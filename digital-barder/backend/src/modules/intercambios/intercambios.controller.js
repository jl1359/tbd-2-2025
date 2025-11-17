// src/modules/intercambios/intercambios.controller.js
import { prisma } from '../../config/prisma.js'

export async function realizarIntercambio(req, res, next) {
    try {
        const { id_comprador, id_publicacion, creditos } = req.body || {}

        if (!id_comprador || !id_publicacion || !creditos) {
        return res.status(400).json({
            ok: false,
            message: 'id_comprador, id_publicacion y creditos son requeridos',
        })
        }

        await prisma.$executeRaw`
        CALL sp_realizar_intercambio(
            ${Number(id_comprador)},
            ${Number(id_publicacion)},
            ${Number(creditos)}
        )
        `

        res.json({ ok: true, message: 'Intercambio realizado' })
    } catch (err) {
        next(err)
    }
}
