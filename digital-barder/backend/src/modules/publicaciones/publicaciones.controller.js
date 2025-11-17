// src/modules/publicaciones/publicaciones.controller.js
import { prisma } from '../../config/prisma.js'

export async function listarPublicaciones(req, res, next) {
    try {
        const { estado, categoria } = req.query

        const where = {}
        if (estado) where.estado = estado
        if (categoria) where.id_categoria = Number(categoria)

        const publicaciones = await prisma.publicacion.findMany({
        where,
        orderBy: { creado_en: 'desc' },
        select: {
            id_publicacion: true,
            titulo: true,
            descripcion: true,
            valor_creditos: true,
            estado: true,
            creado_en: true,
            usuario: {
            select: { id_usuario: true, nombre: true, apellido: true, correo: true },
            },
            categoria: {
            select: { id_categoria: true, nombre: true },
            },
        },
        })

        res.json(publicaciones)
    } catch (err) {
        next(err)
    }
}

export async function obtenerPublicacion(req, res, next) {
    try {
        const id = Number(req.params.id)

        const pub = await prisma.publicacion.findUnique({
        where: { id_publicacion: id },
        include: {
            usuario: true,
            categoria: true,
        },
        })

        if (!pub) {
        return res.status(404).json({ ok: false, message: 'Publicación no encontrada' })
        }

        res.json(pub)
    } catch (err) {
        next(err)
    }
}

export async function crearPublicacion(req, res, next) {
    try {
        const {
        id_usuario,
        id_categoria,
        id_tipo_publicacion,
        titulo,
        descripcion,
        valor_creditos,
        id_ubicacion,
        imagen_url,
        } = req.body || {}

        if (
        !id_usuario ||
        !id_categoria ||
        !id_tipo_publicacion ||
        !titulo ||
        !descripcion ||
        !valor_creditos
        ) {
        return res.status(400).json({
            ok: false,
            message:
            'id_usuario, id_categoria, id_tipo_publicacion, titulo, descripcion y valor_creditos son requeridos',
        })
        }

        const pub = await prisma.publicacion.create({
        data: {
            id_usuario,
            id_categoria,
            id_tipo_publicacion,
            titulo,
            descripcion,
            valor_creditos,
            id_ubicacion,
            imagen_url,
        },
        })

        res.status(201).json(pub)
    } catch (err) {
        next(err)
    }
}

export async function cambiarEstadoPublicacion(req, res, next) {
    try {
        const id = Number(req.params.id)
        const { estado } = req.body || {}

        if (!estado) {
        return res.status(400).json({
            ok: false,
            message: 'estado es requerido',
        })
        }

        const pub = await prisma.publicacion.update({
        where: { id_publicacion: id },
        data: { estado },
        })

        res.json(pub)
    } catch (err) {
        next(err)
    }
}
