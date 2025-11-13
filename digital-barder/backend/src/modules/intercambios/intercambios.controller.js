import { prisma } from '../../config/prisma.js'
export async function intercambiar(req, res, next) {
    try {
        const { id_comprador, id_publicacion, creditos } = req.body || {}
        if (!id_comprador || !id_publicacion || !creditos) return res.status(400).json({ ok:false, message:'Campos requeridos' })
        // SP realiza validaciones de saldo, inserciones y bitácora
        await prisma.$executeRawUnsafe(`
        CALL sp_realizar_intercambio(${Number(id_comprador)}, ${Number(id_publicacion)}, ${Number(creditos)})
        `) /* usa tu SP */ // :contentReference[oaicite:3]{index=3}
        res.json({ ok:true })
    } catch (e) { next(e) }
}
