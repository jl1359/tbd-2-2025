import { prisma } from '../../config/prisma.js'

export async function getSaldo(req, res, next) {
    try {
        const { id_usuario } = req.params
        const row = await prisma.$queryRaw`
        SELECT b.saldo_creditos
        FROM BILLETERA b
        WHERE b.id_usuario = ${Number(id_usuario)}
        LIMIT 1
        `
        res.json({ saldo_creditos: row?.[0]?.saldo_creditos ?? 0 })
    } catch (e) {
        next(e)
    }
}
