// src/modules/auth/auth.controller.js
import { prisma } from '../../config/prisma.js'

export async function loginDemo(req, res, next) {
  try {
    const { correo } = req.body || {}

    if (!correo) {
      return res.status(400).json({
        ok: false,
        message: 'correo es requerido',
      })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        correo: true,
        id_rol: true,
        estado: true,
      },
    })

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no encontrado',
      })
    }

    // Token ficticio: en producción usar JWT
    const token = Buffer.from(
      JSON.stringify({
        id: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.id_rol,
      }),
      'utf8'
    ).toString('base64')

    res.json({
      ok: true,
      token,
      usuario,
    })
  } catch (err) {
    next(err)
  }
}
