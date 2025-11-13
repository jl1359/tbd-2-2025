import { prisma } from '../../config/prisma.js'

export async function listFeed(req, res, next) {
    try {
        const { categoria, ciudad, min, max, tipo } = req.query
        const rows = await prisma.$queryRawUnsafe(`
        SELECT p.id_publicacion, p.titulo, p.descripcion, p.valor_creditos, p.imagen_url,
                c.nombre AS categoria, u.ciudad,
                (SELECT COUNT(*) FROM CALIFICACION ca WHERE ca.id_publicacion=p.id_publicacion) AS calificaciones
        FROM PUBLICACION p
        JOIN CATEGORIA c ON c.id_categoria=p.id_categoria
        LEFT JOIN UBICACION u ON u.id_ubicacion=p.id_ubicacion
        WHERE p.estado='PUBLICADA'
            ${categoria ? `AND c.nombre=${prisma.$queryRaw`'${categoria}'`}` : ``}
            ${ciudad ? `AND u.ciudad=${prisma.$queryRaw`'${ciudad}'`}` : ``}
            ${min ? `AND p.valor_creditos >= ${Number(min)}` : ``}
            ${max ? `AND p.valor_creditos <= ${Number(max)}` : ``}
            ${tipo ? `AND p.id_tipo_publicacion = (SELECT id_tipo_publicacion FROM TIPO_PUBLICACION WHERE nombre=${prisma.$queryRaw`'${tipo}'`} LIMIT 1)` : ``}
        ORDER BY p.id_publicacion DESC
        LIMIT 60
        `)
        res.json(rows)
    } catch (e) { next(e) }
}

export async function buscar(req, res, next) {
    try {
        const { q } = req.query
        if (!q) return res.json([])
        // FULLTEXT según tu script
        const rows = await prisma.$queryRaw`
        SELECT id_publicacion, titulo, descripcion, valor_creditos, imagen_url
        FROM PUBLICACION
        WHERE MATCH(titulo, descripcion) AGAINST (${q} IN NATURAL LANGUAGE MODE)
        LIMIT 50
        `
        res.json(rows)
    } catch (e) { next(e) }
}

export async function getDetalle(req, res, next) {
    try {
        const { id_publicacion } = req.params
        const det = await prisma.$queryRaw`
        SELECT p.*, c.nombre AS categoria, u.ciudad
        FROM PUBLICACION p
        JOIN CATEGORIA c ON c.id_categoria=p.id_categoria
        LEFT JOIN UBICACION u ON u.id_ubicacion=p.id_ubicacion
        WHERE p.id_publicacion=${Number(id_publicacion)} LIMIT 1
        `
        res.json(det?.[0] || null)
    } catch (e) { next(e) }
}
