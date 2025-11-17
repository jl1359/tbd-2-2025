// src/modules/usuarios/usuarios.controller.js
import { prisma } from '../../config/prisma.js'

export async function listarUsuarios(_req, res, next) {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { id_usuario: 'asc' },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        telefono: true,
        estado: true,
        id_rol: true,
      },
    })
    res.json(usuarios)
  } catch (err) {
    next(err)
  }
}

export async function obtenerUsuario(req, res, next) {
  try {
    const id = Number(req.params.id)
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
    })
    if (!usuario) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' })
    }
    res.json(usuario)
  } catch (err) {
    next(err)
  }
}

export async function crearUsuario(req, res, next) {
  try {
    const { id_rol, nombre, apellido, correo, telefono } = req.body || {}

    if (!id_rol || !nombre || !correo) {
      return res.status(400).json({
        ok: false,
        message: 'id_rol, nombre y correo son requeridos',
      })
    }

    const usuario = await prisma.usuario.create({
      data: { id_rol, nombre, apellido, correo, telefono },
    })

    res.status(201).json(usuario)
  } catch (err) {
    next(err)
  }
}
