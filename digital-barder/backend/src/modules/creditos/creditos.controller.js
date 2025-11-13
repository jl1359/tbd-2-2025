import { prisma } from '../../config/prisma.js'
export async function comprarPaquete(req, res, next) {
    try {
        const { id_usuario, id_paquete, pago_tx } = req.body || {}
        if (!id_usuario || !id_paquete) return res.status(400).json({ ok:false, message:'id_usuario e id_paquete requeridos' })
        // usa tu SP de compra
        await prisma.$executeRawUnsafe(`
        CALL sp_compra_creditos_aprobar(${Number(id_usuario)}, ${Number(id_paquete)}, ${pago_tx ? `'${pago_tx}'` : 'NULL'})
        `) /* SP y lógica vienen de tu SQL */ // :contentReference[oaicite:2]{index=2}
        res.json({ ok:true })
    } catch (e) { next(e) }
}
